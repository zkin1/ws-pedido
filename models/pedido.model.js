const { pedidoPool } = require('../config/db.config');
const logger = require('../utils/logger');
const DetalleModel = require('./detalle.model');

// Modelo para operaciones con pedidos
const PedidoModel = {
  
  /**
   * Genera un número de pedido único
   * @returns {Promise<string>} Número de pedido generado
   */
  async generarNumeroPedido() {
    try {
      const date = new Date();
      const year = date.getFullYear().toString().substr(-2);
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      
      const [rows] = await pedidoPool.execute(
        'SELECT COUNT(*) as count FROM pedidos WHERE DATE(fecha_pedido) = CURDATE()'
      );
      
      const count = rows[0].count + 1;
      const sequential = ('000' + count).slice(-4);
      
      return `PED-${year}${month}${day}-${sequential}`;
    } catch (error) {
      logger.error('Error al generar número de pedido:', error);
      throw error;
    }
  },
  
  /**
   * Crea un nuevo pedido
   * @param {Object} datosPedido - Datos del pedido a crear
   * @returns {Promise<Object>} Pedido creado
   */
  async crear(datosPedido) {
    const connection = await pedidoPool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Generar número de pedido
      const numeroPedido = await this.generarNumeroPedido();
      
      // Insertar datos del pedido
      const [resultPedido] = await connection.execute(
        `INSERT INTO pedidos (
          numero_pedido, usuario_id, total, costo_envio, descuento, 
          impuestos, total_final, estado, metodo_pago, referencia_pago,
          tipo_entrega, sucursal_retiro, nombre_receptor, direccion_entrega,
          comuna_entrega, ciudad_entrega, region_entrega, telefono_contacto,
          instrucciones_entrega
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          numeroPedido,
          datosPedido.usuario_id,
          datosPedido.total,
          datosPedido.costo_envio || 0,
          datosPedido.descuento || 0,
          datosPedido.impuestos || 0,
          datosPedido.total_final,
          'pendiente', // Estado inicial
          datosPedido.metodo_pago,
          datosPedido.referencia_pago || null,
          datosPedido.tipo_entrega,
          datosPedido.sucursal_retiro || null,
          datosPedido.nombre_receptor || null,
          datosPedido.direccion_entrega || null,
          datosPedido.comuna_entrega || null,
          datosPedido.ciudad_entrega || null,
          datosPedido.region_entrega || null,
          datosPedido.telefono_contacto || null,
          datosPedido.instrucciones_entrega || null
        ]
      );
      
      const pedidoId = resultPedido.insertId;
      
      // Insertar registro en historial de estados
      await connection.execute(
        `INSERT INTO historial_estados_pedido (pedido_id, estado_anterior, estado_nuevo, comentario)
         VALUES (?, NULL, 'pendiente', 'Pedido creado')`,
        [pedidoId]
      );
      
      // Insertar detalles del pedido
      for (const detalle of datosPedido.detalles) {
        await connection.execute(
          `INSERT INTO detalles_pedido (
            pedido_id, producto_id, nombre_producto, cantidad, 
            precio_unitario, subtotal
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            pedidoId,
            detalle.producto_id,
            detalle.nombre_producto,
            detalle.cantidad,
            detalle.precio_unitario,
            detalle.cantidad * detalle.precio_unitario
          ]
        );
      }
      
      await connection.commit();
      
      // Obtener el pedido completo
      const pedidoCreado = await this.obtenerPorId(pedidoId);
      
      return {
        id: pedidoId,
        numero_pedido: numeroPedido,
        ...pedidoCreado
      };
      
    } catch (error) {
      await connection.rollback();
      logger.error('Error al crear pedido:', error);
      throw error;
    } finally {
      connection.release();
    }
  },
  
  /**
   * Obtiene un pedido por su ID
   * @param {number} id - ID del pedido
   * @returns {Promise<Object|null>} Pedido o null si no existe
   */
  async obtenerPorId(id) {
    try {
      // Obtener datos del pedido
      const [rows] = await pedidoPool.execute(
        'SELECT * FROM pedidos WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const pedido = rows[0];
      
      // Obtener detalles del pedido
      const detalles = await DetalleModel.obtenerPorPedidoId(id);
      
      // Obtener historial de estados
      const [historial] = await pedidoPool.execute(
        'SELECT * FROM historial_estados_pedido WHERE pedido_id = ? ORDER BY fecha_cambio',
        [id]
      );
      
      return {
        ...pedido,
        detalles,
        historial
      };
    } catch (error) {
      logger.error(`Error al obtener pedido por ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Obtiene un pedido por su número
   * @param {string} numeroPedido - Número de pedido
   * @returns {Promise<Object|null>} Pedido o null si no existe
   */
  async obtenerPorNumero(numeroPedido) {
    try {
      // Obtener datos del pedido
      const [rows] = await pedidoPool.execute(
        'SELECT * FROM pedidos WHERE numero_pedido = ?',
        [numeroPedido]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const pedidoId = rows[0].id;
      return this.obtenerPorId(pedidoId);
    } catch (error) {
      logger.error(`Error al obtener pedido por número ${numeroPedido}:`, error);
      throw error;
    }
  },
  
  /**
   * Actualiza el estado de un pedido
   * @param {number} id - ID del pedido
   * @param {string} nuevoEstado - Nuevo estado
   * @param {string} comentario - Comentario sobre el cambio
   * @returns {Promise<boolean>} true si se actualizó correctamente
   */
  async actualizarEstado(id, nuevoEstado, comentario = '') {
    const connection = await pedidoPool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Obtener estado actual
      const [rows] = await connection.execute(
        'SELECT estado FROM pedidos WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        throw new Error(`Pedido con ID ${id} no encontrado`);
      }
      
      const estadoAnterior = rows[0].estado;
      
      // No actualizar si el estado es el mismo
      if (estadoAnterior === nuevoEstado) {
        await connection.rollback();
        return false;
      }
      
      // Actualizar estado del pedido
      await connection.execute(
        'UPDATE pedidos SET estado = ? WHERE id = ?',
        [nuevoEstado, id]
      );
      
      // Actualizar campo de fecha correspondiente al nuevo estado
      let campoFecha = null;
      switch (nuevoEstado) {
        case 'pagado':
          campoFecha = 'fecha_pago';
          break;
        case 'preparando':
          campoFecha = 'fecha_preparacion';
          break;
        case 'enviado':
          campoFecha = 'fecha_envio';
          break;
        case 'entregado':
          campoFecha = 'fecha_entrega';
          break;
      }
      
      if (campoFecha) {
        await connection.execute(
          `UPDATE pedidos SET ${campoFecha} = CURRENT_TIMESTAMP WHERE id = ?`,
          [id]
        );
      }
      
      // Registrar en historial
      await connection.execute(
        `INSERT INTO historial_estados_pedido (
          pedido_id, estado_anterior, estado_nuevo, comentario
        ) VALUES (?, ?, ?, ?)`,
        [id, estadoAnterior, nuevoEstado, comentario]
      );
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      logger.error(`Error al actualizar estado del pedido ${id}:`, error);
      throw error;
    } finally {
      connection.release();
    }
  },
  
  /**
   * Obtiene pedidos por usuario
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Array>} Lista de pedidos
   */
  async obtenerPorUsuario(usuarioId) {
    try {
      const [rows] = await pedidoPool.execute(
        'SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY fecha_pedido DESC',
        [usuarioId]
      );
      
      // Para cada pedido, obtener sus detalles
      const pedidosCompletos = [];
      for (const pedido of rows) {
        const detalles = await DetalleModel.obtenerPorPedidoId(pedido.id);
        pedidosCompletos.push({
          ...pedido,
          detalles
        });
      }
      
      return pedidosCompletos;
    } catch (error) {
      logger.error(`Error al obtener pedidos del usuario ${usuarioId}:`, error);
      throw error;
    }
  },
  
  /**
   * Obtiene pedidos por estado
   * @param {string} estado - Estado de los pedidos a buscar
   * @returns {Promise<Array>} Lista de pedidos
   */
  async obtenerPorEstado(estado) {
    try {
      const [rows] = await pedidoPool.execute(
        'SELECT * FROM pedidos WHERE estado = ? ORDER BY fecha_pedido DESC',
        [estado]
      );
      
      // Para cada pedido, obtener sus detalles
      const pedidosCompletos = [];
      for (const pedido of rows) {
        const detalles = await DetalleModel.obtenerPorPedidoId(pedido.id);
        pedidosCompletos.push({
          ...pedido,
          detalles
        });
      }
      
      return pedidosCompletos;
    } catch (error) {
      logger.error(`Error al obtener pedidos con estado ${estado}:`, error);
      throw error;
    }
  },
  
  /**
   * Calcula el total de un pedido
   * @param {Object} datosPedido - Datos del pedido
   * @returns {Object} Totales calculados
   */
  calcularTotales(datosPedido) {
    try {
      // Calcular subtotal a partir de los detalles
      const { subtotal } = DetalleModel.calcularTotales(datosPedido.detalles);
      
      // Calcular el total final
      const costoEnvio = parseFloat(datosPedido.costo_envio || 0);
      const descuento = parseFloat(datosPedido.descuento || 0);
      const impuestos = parseFloat(datosPedido.impuestos || 0);
      
      const totalFinal = subtotal + costoEnvio - descuento + impuestos;
      
      return {
        subtotal,
        costo_envio: costoEnvio,
        descuento,
        impuestos,
        total_final: totalFinal
      };
    } catch (error) {
      logger.error('Error al calcular totales del pedido:', error);
      throw error;
    }
  }
  
};

module.exports = PedidoModel;