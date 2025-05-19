const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { testConnections } = require('./config/db.config');
const { iniciarServidorSOAP } = require('./services/soap/soap.server');
const logger = require('./utils/logger');
const config = require('./config/env.config');

// Crear la aplicación Express
const app = express();

// Middleware para CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Permite cualquier origen (puedes limitarlo a http://localhost:3002)
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, SOAPAction');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  // Manejar solicitudes preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Middleware para procesar solicitudes SOAP
app.use(bodyParser.raw({ 
    type: function() { return true; }, 
    limit: '5mb' 
}));

// Crear directorio de logs si no existe
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta básica para verificar que el servidor está funcionando
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>WS-Pedido</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    h1 {
                        color: #3498db;
                    }
                    .card {
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        padding: 20px;
                        margin-bottom: 20px;
                        background-color: #f9f9f9;
                    }
                    .links {
                        margin-top: 20px;
                    }
                    a {
                        color: #3498db;
                        text-decoration: none;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <h1>Servicio WS-Pedido</h1>
                <div class="card">
                    <h2>Estado</h2>
                    <p>✅ Servicio activo y funcionando correctamente.</p>
                    <p>Puerto: ${config.port}</p>
                    <p>Entorno: ${config.environment}</p>
                </div>
                <div class="card">
                    <h2>Enlaces</h2>
                    <p><a href="${config.service.path}?wsdl" target="_blank">Ver WSDL</a> - Definición del servicio SOAP</p>
                    <p><a href="/soap-tester.html" target="_blank">Herramienta de pruebas</a> - Interfaz para probar el servicio</p>
                </div>
            </body>
        </html>
    `);
});

// Inicializar el servidor
async function iniciarServidor() {
    try {
        // Verificar conexión a las bases de datos
        logger.info('Comprobando conexiones a las bases de datos...');
        const dbConnected = await testConnections();
        if (!dbConnected) {
            logger.error('No se pudo conectar a las bases de datos. Verificar configuración.');
            process.exit(1);
        }

        // Iniciar servidor HTTP
        const server = app.listen(config.port, () => {
            logger.info(`Servidor HTTP iniciado en el puerto ${config.port}`);
            
            // Iniciar servidor SOAP
            iniciarServidorSOAP(app).then(() => {
                logger.info('Servidor WS-Pedido iniciado correctamente');
            }).catch(err => {
                logger.error('Error al iniciar servidor SOAP:', err);
                process.exit(1);
            });
        });

        // Manejar cierre del servidor
        process.on('SIGTERM', () => {
            logger.info('Señal SIGTERM recibida. Cerrando servidor...');
            server.close(() => {
                logger.info('Servidor cerrado.');
                process.exit(0);
            });
        });

        // Manejar errores no capturados
        process.on('uncaughtException', (err) => {
            logger.error('Error no capturado:', err);
            // No cerrar el servidor para mantenerlo funcionando
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Promesa rechazada no manejada:', reason);
            // No cerrar el servidor para mantenerlo funcionando
        });

    } catch (err) {
        logger.error('Error al iniciar el servidor:', err);
        process.exit(1);
    }
}

// Iniciar el servidor
iniciarServidor();