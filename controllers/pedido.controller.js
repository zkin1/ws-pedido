const PedidoModel = require('../models/pedido.model');
const InventarioModel = require('../models/inventario.model');
const logger = require('../utils/logger');
const { validarId, validarDatosPedido, validarEstadoPedido } = require('../utils/validator');

// Controlador para la lógica de pedidos
const PedidoController = {
  
  /**
   * Crea un nuevo pedido
   * @param {Object} datosPedido - Datos del pedido a crear
   * @returns {Promise<Object>} Resultado de la creación
   */
  async crearPedido(datosPedido) {
    try {
      // Validar datos del pedido
      const validacion = validarDatosPedido(datosPedido);
      if (!validacion.valido) {
        return {
          exito: false,
          mensaje: validacion.mensaje
        };
      }
      
      // Verificar stock de productos
      const items = datosPedido.detalles.map(detalle => ({
        producto_id: detalle.producto_id,
        cantidad: detalle.cantidad
      }));
      
      const verificacionStock = await InventarioModel.verificarStockMultiple(items);
      
      if (!verificacionStock.hayStock) {
        return {
          exito: false,
          mensaje: "No hay stock suficiente para algunos productos",
          productosSinStock: verificacionStock.productosSinStock
        };
      }
      
      // Crear pedido
      const pedidoCreado = await PedidoModel.crear(datosPedido);
      
      return {
        exito: true,
        mensaje: "Pedido creado exitosamente",
        pedido: {
          id: pedidoCreado.id,
          numero_pedido: pedidoCreado.numero_pedido,
          estado: pedidoCreado.estado,
          total: pedidoCreado.total_final
        }
      };
    } catch (error) {
      logger.error("Error en crearPedido:", error);
      return {
        exito: false,
        mensaje: "Error al crear el pedido: " + error.message
      };
    }
  },
  
  /**
   * Consulta detalles de un pedido
   * @param {Object} params - Parámetros de búsqueda (id o numeroPedido)
   * @returns {Promise<Object>} Resultado de la consulta
   */
  async consultarPedido(params) {
    try {
      let pedido = null;
      
      if (params.id && validarId(params.id)) {
        pedido = await PedidoModel.obtenerPorId(params.id);
      } else if (params.numeroPedido) {
        pedido = await PedidoModel.obtenerPorNumero(params.numeroPedido);
      } else {
        return {
          exito: false,
          mensaje: "Debe especificar un ID o número de pedido válido"
        };
      }
      
      if (!pedido) {
        return {
          exito: false,
          mensaje: "Pedido no encontrado"
        };
      }
      
      return {
        exito: true,
        pedido
      };
    } catch (error) {
      logger.error("Error en consultarPedido:", error);
      return {
        exito: false,
        mensaje: "Error al consultar el pedido: " + error.message
      };
    }
  },
  
  /**
   * Actualiza el estado de un pedido
   * @param {number} id - ID del pedido
   * @param {string} nuevoEstado - Nuevo estado
   * @param {string} comentario - Comentario sobre el cambio
   * @returns {Promise<Object>} Resultado de la actualización
   */
  async actualizarEstadoPedido(id, nuevoEstado, comentario = '') {
    try {
      if (!validarId(id)) {
        return {
          exito: false,
          mensaje: "ID de pedido no válido"
        };
      }
      
      if (!validarEstadoPedido(nuevoEstado)) {
        return {
          exito: false,
          mensaje: "Estado no válido"
        };
      }
      
      const pedido = await PedidoModel.obtenerPorId(id);
      if (!pedido) {
        return {
          exito: false,
          mensaje: "Pedido no encontrado"
        };
      }
      
      // Validaciones específicas según el nuevo estado
      if (nuevoEstado === 'pagado') {
        // Verificar stock nuevamente antes de marcar como pagado
        const items = pedido.detalles.map(detalle => ({
          producto_id: detalle.producto_id,
          cantidad: detalle.cantidad
        }));
        
        const verificacionStock = await InventarioModel.verificarStockMultiple(items);
        
        if (!verificacionStock.hayStock) {
          return {
            exito: false,
            mensaje: "No hay stock suficiente para algunos productos",
            productosSinStock: verificacionStock.productosSinStock
          };
        }
        
        // Registrar salida en inventario al marcar como pagado
        for (const detalle of pedido.detalles) {
          await InventarioModel.registrarSalida(
            detalle.producto_id,
            detalle.cantidad,
            pedido.numero_pedido
          );
        }
      }
      
      // Actualizar estado
      const actualizado = await PedidoModel.actualizarEstado(id, nuevoEstado, comentario);
      
      if (!actualizado) {
        return {
          exito: false,
          mensaje: "No se pudo actualizar el estado del pedido"
        };
      }
      
      return {
        exito: true,
        mensaje: `Estado del pedido actualizado a: ${nuevoEstado}`
      };
    } catch (error) {
      logger.error("Error en actualizarEstadoPedido:", error);
      return {
        exito: false,
        mensaje: "Error al actualizar el estado del pedido: " + error.message
      };
    }
  },
  
  /**
   * Consulta pedidos por usuario
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Object>} Resultado de la consulta
   */
  async consultarPedidosPorUsuario(usuarioId) {
    try {
      if (!validarId(usuarioId)) {
        return {
          exito: false,
          mensaje: "ID de usuario no válido"
        };
      }
      
      const pedidos = await PedidoModel.obtenerPorUsuario(usuarioId);
      
      return {
        exito: true,
        pedidos
      };
    } catch (error) {
      logger.error("Error en consultarPedidosPorUsuario:", error);
      return {
        exito: false,
        mensaje: "Error al consultar pedidos del usuario: " + error.message
      };
    }
  },
  
  /**
   * Consulta pedidos por estado
   * @param {string} estado - Estado a consultar
   * @returns {Promise<Object>} Resultado de la consulta
   */
  async consultarPedidosPorEstado(estado) {
    try {
      if (!validarEstadoPedido(estado)) {
        return {
          exito: false,
          mensaje: "Estado no válido"
        };
      }
      
      const pedidos = await PedidoModel.obtenerPorEstado(estado);
      
      return {
        exito: true,
        pedidos
      };
    } catch (error) {
      logger.error("Error en consultarPedidosPorEstado:", error);
      return {
        exito: false,
        mensaje: "Error al consultar pedidos por estado: " + error.message
      };
    }
  }
  
};

module.exports = PedidoController;