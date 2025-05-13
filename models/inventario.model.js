const { inventarioPool } = require('../config/db.config');
const logger = require('../utils/logger');

// Modelo para operaciones con inventario
const InventarioModel = {
  
  /**
   * Verifica si hay stock disponible para un producto
   * @param {number} productoId - ID del producto
   * @param {number} cantidad - Cantidad solicitada
   * @returns {Promise<boolean>} true si hay stock suficiente
   */
  async verificarStock(productoId, cantidad) {
    try {
      // Obtener stock total del producto en todas las ubicaciones
      const [rows] = await inventarioPool.execute(
        'SELECT SUM(cantidad) as stock_total FROM stock WHERE producto_id = ?',
        [productoId]
      );
      
      const stockTotal = rows[0].stock_total || 0;
      return stockTotal >= cantidad;
    } catch (error) {
      logger.error(`Error al verificar stock del producto ${productoId}:`, error);
      throw error;
    }
  },
  
  /**
   * Verifica stock para múltiples productos
   * @param {Array} items - Array de objetos {producto_id, cantidad}
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verificarStockMultiple(items) {
    try {
      const resultado = {
        hayStock: true,
        productosConStock: [],
        productosSinStock: []
      };
      
      for (const item of items) {
        const hayStock = await this.verificarStock(item.producto_id, item.cantidad);
        
        if (hayStock) {
          resultado.productosConStock.push(item);
        } else {
          resultado.productosSinStock.push(item);
          resultado.hayStock = false;
        }
      }
      
      return resultado;
    } catch (error) {
      logger.error('Error al verificar stock múltiple:', error);
      throw error;
    }
  },
  
  /**
   * Obtiene el stock actual de un producto
   * @param {number} productoId - ID del producto
   * @returns {Promise<number>} Cantidad en stock
   */
  async obtenerStockProducto(productoId) {
    try {
      const [rows] = await inventarioPool.execute(
        'SELECT SUM(cantidad) as stock_total FROM stock WHERE producto_id = ?',
        [productoId]
      );
      
      return rows[0].stock_total || 0;
    } catch (error) {
      logger.error(`Error al obtener stock del producto ${productoId}:`, error);
      throw error;
    }
  },
  
  /**
   * Registra una salida de inventario por venta
   * @param {number} productoId - ID del producto
   * @param {number} cantidad - Cantidad vendida
   * @param {string} referencia - Número de pedido
   * @returns {Promise<boolean>} true si se registró correctamente
   */
  async registrarSalida(productoId, cantidad, referencia) {
    const connection = await inventarioPool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Obtener ubicaciones con stock disponible
      const [ubicaciones] = await connection.execute(
        'SELECT id, ubicacion_id, cantidad FROM stock WHERE producto_id = ? AND cantidad > 0 ORDER BY cantidad DESC',
        [productoId]
      );
      
      if (ubicaciones.length === 0) {
        throw new Error(`No hay stock disponible para el producto ${productoId}`);
      }
      
      let cantidadPendiente = cantidad;
      
      // Registrar salidas de cada ubicación hasta completar la cantidad
      for (const ubicacion of ubicaciones) {
        if (cantidadPendiente <= 0) break;
        
        const cantidadADescontar = Math.min(cantidadPendiente, ubicacion.cantidad);
        
        // Actualizar stock
        await connection.execute(
          'UPDATE stock SET cantidad = cantidad - ? WHERE id = ?',
          [cantidadADescontar, ubicacion.id]
        );
        
        // Registrar movimiento
        await connection.execute(
          `INSERT INTO movimientos (
            tipo_movimiento_id, producto_id, ubicacion_origen_id, cantidad, 
            documento_referencia, notas
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            2, // Tipo "SALIDA"
            productoId,
            ubicacion.ubicacion_id,
            cantidadADescontar,
            referencia,
            `Salida por venta. Pedido: ${referencia}`
          ]
        );
        
        cantidadPendiente -= cantidadADescontar;
      }
      
      if (cantidadPendiente > 0) {
        // No se pudo descontar toda la cantidad
        await connection.rollback();
        return false;
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      logger.error(`Error al registrar salida del producto ${productoId}:`, error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
};

module.exports = InventarioModel;