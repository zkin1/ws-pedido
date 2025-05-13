const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno desde el archivo .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

module.exports = {
  port: process.env.PORT || 8004,
  environment: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ws_pedido_db',
    port: process.env.DB_PORT || 3306
  },
  inventarioDB: {
    host: process.env.INV_DB_HOST || 'localhost',
    user: process.env.INV_DB_USER || 'root',
    password: process.env.INV_DB_PASSWORD || '',
    database: process.env.INV_DB_NAME || 'ws_inventario_db',
    port: process.env.INV_DB_PORT || 3306
  },
  service: {
    namespace: process.env.SERVICE_NAMESPACE || 'http://ferremas.cl/ws-pedido',
    path: process.env.SERVICE_PATH || '/ws-pedido'
  }
};