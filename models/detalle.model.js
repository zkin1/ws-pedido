const { pedidoPool } = require('../config/db.config');
const logger = require('../utils/logger');

// Modelo para operaciones con detalles de pedido
const DetalleModel = {
  
  /**
   * Obtiene los detalles de un pedido
   * @param {number} pedidoId - ID del pedido
   * @returns {Promise<Array>} Lista de detalles
   */
  async obtenerPorPedidoId(pedidoId) {
    try {
      const [rows] = await pedidoPool.execute(
        'SELECT * FROM detalles_pedido WHERE pedido_id = ?',
        [pedidoId]
      );
      
      return rows;
    } catch (error) {
      logger.error(`Error al obtener detalles del pedido ${pedidoId}:`, error);
      throw error;
    }
  },
  
  /**
   * Crea un nuevo detalle de pedido
   * @param {Object} detalle - Datos del detalle
   * @returns {Promise<Object>} Detalle creado
   */
  async crear(detalle) {
    try {
      const [result] = await pedidoPool.execute(
        `INSERT INTO detalles_pedido (
          pedido_id, producto_id, nombre_producto, cantidad, 
          precio_unitario, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          detalle.pedido_id,
          detalle.producto_id,
          detalle.nombre_producto,
          detalle.cantidad,
          detalle.precio_unitario,
          detalle.subtotal || (detalle.cantidad * detalle.precio_unitario)
        ]
      );
      
      return {
        id: result.insertId,
        ...detalle
      };
    } catch (error) {
      logger.error(`Error al crear detalle de pedido:`, error);
      throw error;
    }
  },
  
  /**
   * Elimina todos los detalles de un pedido
   * @param {number} pedidoId - ID del pedido
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  async eliminarPorPedidoId(pedidoId) {
    try {
      await pedidoPool.execute(
        'DELETE FROM detalles_pedido WHERE pedido_id = ?',
        [pedidoId]
      );
      
      return true;
    } catch (error) {
      logger.error(`Error al eliminar detalles del pedido ${pedidoId}:`, error);
      throw error;
    }
  },
  
  /**
   * Calcula el total de un pedido a partir de sus detalles
   * @param {Array} detalles - Lista de detalles
   * @returns {Object} Totales calculados
   */
  calcularTotales(detalles) {
    try {
      let subtotal = 0;
      
      for (const detalle of detalles) {
        const precioUnitario = parseFloat(detalle.precio_unitario);
        const cantidad = parseInt(detalle.cantidad);
        subtotal += precioUnitario * cantidad;
      }
      
      return {
        subtotal,
        total: subtotal
      };
    } catch (error) {
      logger.error('Error al calcular totales:', error);
      throw error;
    }
  }
  
};

module.exports = DetalleModel;