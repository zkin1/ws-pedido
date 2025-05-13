const PedidoController = require('../../controllers/pedido.controller');
const logger = require('../../utils/logger');

// Implementación del servicio SOAP para pedidos
const PedidoService = {
  PedidoService: {
    PedidoSOAP: {
      /**
       * Implementación del método SOAP CrearPedido
       * @param {Object} args - Argumentos de la solicitud
       * @returns {Promise<Object>} - Respuesta del servicio
       */
      CrearPedido: async function(args) {
        logger.info('SOAP: CrearPedido invocado');
        logger.debug('Datos de pedido recibidos:', JSON.stringify(args));
        
        try {
          // Preparar datos del pedido
          const datosPedido = {
            usuario_id: args.usuario_id,
            total: args.total,
            costo_envio: args.costo_envio || 0,
            descuento: args.descuento || 0,
            impuestos: args.impuestos || 0,
            total_final: args.total_final,
            metodo_pago: args.metodo_pago,
            referencia_pago: args.referencia_pago,
            tipo_entrega: args.tipo_entrega,
            sucursal_retiro: args.sucursal_retiro,
            nombre_receptor: args.nombre_receptor,
            direccion_entrega: args.direccion_entrega,
            comuna_entrega: args.comuna_entrega,
            ciudad_entrega: args.ciudad_entrega,
            region_entrega: args.region_entrega,
            telefono_contacto: args.telefono_contacto,
            instrucciones_entrega: args.instrucciones_entrega,
            detalles: Array.isArray(args.detalles.detalle) 
              ? args.detalles.detalle 
              : [args.detalles.detalle]
          };
          
          // Llamar al controlador
          const resultado = await PedidoController.crearPedido(datosPedido);
          
          if (resultado.exito) {
            logger.info(`Pedido creado: ${resultado.pedido.numero_pedido}`);
            return {
              exito: true,
              mensaje: resultado.mensaje,
              id: resultado.pedido.id,
              numero_pedido: resultado.pedido.numero_pedido
            };
          } else {
            logger.warn(`Error al crear pedido: ${resultado.mensaje}`);
            return {
              exito: false,
              mensaje: resultado.mensaje
            };
          }
        } catch (error) {
          logger.error(`Error en servicio SOAP CrearPedido: ${error.message}`);
          return {
            exito: false,
            mensaje: `Error interno del servidor: ${error.message}`
          };
        }
      },
      
      /**
       * Implementación del método SOAP ConsultarPedido
       * @param {Object} args - Argumentos de la solicitud
       * @returns {Promise<Object>} - Respuesta del servicio
       */
      ConsultarPedido: async function(args) {
        logger.info(`SOAP: ConsultarPedido invocado: ID=${args.id}, Número=${args.numeroPedido}`);
        
        try {
          const resultado = await PedidoController.consultarPedido({
            id: args.id,
            numeroPedido: args.numeroPedido
          });
          
          if (resultado.exito) {
            logger.info(`Consulta de pedido exitosa: ${args.id || args.numeroPedido}`);
            return {
              exito: true,
              pedido: resultado.pedido
            };
          } else {
            logger.warn(`Pedido no encontrado: ${args.id || args.numeroPedido}`);
            return {
              exito: false,
              mensaje: resultado.mensaje
            };
          }
        } catch (error) {
          logger.error(`Error en servicio SOAP ConsultarPedido: ${error.message}`);
          return {
            exito: false,
            mensaje: `Error interno del servidor: ${error.message}`
          };
        }
      },
      
      /**
       * Implementación del método SOAP ActualizarEstadoPedido
       * @param {Object} args - Argumentos de la solicitud
       * @returns {Promise<Object>} - Respuesta del servicio
       */
      ActualizarEstadoPedido: async function(args) {
        logger.info(`SOAP: ActualizarEstadoPedido invocado: ID=${args.id}, NuevoEstado=${args.nuevoEstado}`);
        
        try {
          const resultado = await PedidoController.actualizarEstadoPedido(
            args.id,
            args.nuevoEstado,
            args.comentario || ''
          );
          
          if (resultado.exito) {
            logger.info(`Estado de pedido actualizado: ID=${args.id}, Estado=${args.nuevoEstado}`);
          } else {
            logger.warn(`Error al actualizar estado: ${resultado.mensaje}`);
          }
          
          return {
            exito: resultado.exito,
            mensaje: resultado.mensaje
          };
        } catch (error) {
          logger.error(`Error en servicio SOAP ActualizarEstadoPedido: ${error.message}`);
          return {
            exito: false,
            mensaje: `Error interno del servidor: ${error.message}`
          };
        }
      },
      
      /**
       * Implementación del método SOAP ConsultarPedidosPorUsuario
       * @param {Object} args - Argumentos de la solicitud
       * @returns {Promise<Object>} - Respuesta del servicio
       */
      ConsultarPedidosPorUsuario: async function(args) {
        logger.info(`SOAP: ConsultarPedidosPorUsuario invocado: UsuarioID=${args.usuarioId}`);
        
        try {
          const resultado = await PedidoController.consultarPedidosPorUsuario(args.usuarioId);
          
          if (resultado.exito) {
            logger.info(`Consulta de pedidos por usuario exitosa: ${args.usuarioId}`);
            return {
              exito: true,
              pedidos: resultado.pedidos
            };
          } else {
            logger.warn(`Error en consulta de pedidos por usuario: ${resultado.mensaje}`);
            return {
              exito: false,
              mensaje: resultado.mensaje
            };
          }
        } catch (error) {
          logger.error(`Error en servicio SOAP ConsultarPedidosPorUsuario: ${error.message}`);
          return {
            exito: false,
            mensaje: `Error interno del servidor: ${error.message}`
          };
        }
      },
      
      /**
       * Implementación del método SOAP ConsultarPedidosPorEstado
       * @param {Object} args - Argumentos de la solicitud
       * @returns {Promise<Object>} - Respuesta del servicio
       */
      ConsultarPedidosPorEstado: async function(args) {
        logger.info(`SOAP: ConsultarPedidosPorEstado invocado: Estado=${args.estado}`);
        
        try {
          const resultado = await PedidoController.consultarPedidosPorEstado(args.estado);
          
          if (resultado.exito) {
            logger.info(`Consulta de pedidos por estado exitosa: ${args.estado}`);
            return {
              exito: true,
              pedidos: resultado.pedidos
            };
          } else {
            logger.warn(`Error en consulta de pedidos por estado: ${resultado.mensaje}`);
            return {
              exito: false,
              mensaje: resultado.mensaje
            };
          }
        } catch (error) {
          logger.error(`Error en servicio SOAP ConsultarPedidosPorEstado: ${error.message}`);
          return {
            exito: false,
            mensaje: `Error interno del servidor: ${error.message}`
          };
        }
      }
    }
  }
};

module.exports = PedidoService;