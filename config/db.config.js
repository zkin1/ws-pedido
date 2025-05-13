const mysql = require('mysql2/promise');
const config = require('./env.config');
const logger = require('../utils/logger');

// Crear el pool de conexiones a la base de datos de pedidos
const pedidoPool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  port: config.db.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Crear el pool de conexiones a la base de datos de inventario
const inventarioPool = mysql.createPool({
  host: config.inventarioDB.host,
  user: config.inventarioDB.user,
  password: config.inventarioDB.password,
  database: config.inventarioDB.database,
  port: config.inventarioDB.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para verificar conexiones
async function testConnections() {
  try {
    // Verificar conexión a base de datos de pedidos
    const pedidoConnection = await pedidoPool.getConnection();
    logger.info('Conexión a base de datos de pedidos establecida correctamente');
    pedidoConnection.release();
    
    // Verificar conexión a base de datos de inventario
    const inventarioConnection = await inventarioPool.getConnection();
    logger.info('Conexión a base de datos de inventario establecida correctamente');
    inventarioConnection.release();
    
    return true;
  } catch (err) {
    logger.error('Error al conectar a las bases de datos:', err);
    return false;
  }
}

module.exports = {
  pedidoPool,
  inventarioPool,
  testConnections
};