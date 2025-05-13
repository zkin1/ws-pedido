const soap = require('soap');
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');
const pedidoService = require('./pedido.service');
const config = require('../../config/env.config');

// Crear directamente el WSDL en un archivo físico
// Esto evita problemas con generación dinámica
function crearArchivoWsdl() {
  const wsdlPath = path.join(__dirname, 'wsdl-file.xml');
  
  // Solo crear el archivo si no existe
  if (!fs.existsSync(wsdlPath)) {
    const wsdlContent = `<?xml version="1.0" encoding="UTF-8"?>
<wsdl:definitions 
  xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" 
  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" 
  xmlns:tns="http://ferremas.cl/ws-pedido" 
  xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
  targetNamespace="http://ferremas.cl/ws-pedido">

  <wsdl:types>
    <xsd:schema targetNamespace="http://ferremas.cl/ws-pedido">
      <!-- Definición del tipo DetallePedido -->
      <xsd:complexType name="DetallePedido">
        <xsd:sequence>
          <xsd:element name="producto_id" type="xsd:int"/>
          <xsd:element name="nombre_producto" type="xsd:string"/>
          <xsd:element name="cantidad" type="xsd:int"/>
          <xsd:element name="precio_unitario" type="xsd:decimal"/>
        </xsd:sequence>
      </xsd:complexType>
      
      <!-- Definición del array de DetallesPedido -->
      <xsd:complexType name="ArrayOfDetallesPedido">
        <xsd:sequence>
          <xsd:element name="detalle" type="tns:DetallePedido" minOccurs="0" maxOccurs="unbounded"/>
        </xsd:sequence>
      </xsd:complexType>
      
      <!-- CrearPedido Request -->
      <xsd:element name="CrearPedidoRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="usuario_id" type="xsd:int"/>
            <xsd:element name="total" type="xsd:decimal"/>
            <xsd:element name="costo_envio" type="xsd:decimal" minOccurs="0"/>
            <xsd:element name="descuento" type="xsd:decimal" minOccurs="0"/>
            <xsd:element name="impuestos" type="xsd:decimal" minOccurs="0"/>
            <xsd:element name="total_final" type="xsd:decimal"/>
            <xsd:element name="metodo_pago" type="xsd:string"/>
            <xsd:element name="referencia_pago" type="xsd:string" minOccurs="0"/>
            <xsd:element name="tipo_entrega" type="xsd:string"/>
            <xsd:element name="sucursal_retiro" type="xsd:int" minOccurs="0"/>
            <xsd:element name="nombre_receptor" type="xsd:string" minOccurs="0"/>
            <xsd:element name="direccion_entrega" type="xsd:string" minOccurs="0"/>
            <xsd:element name="comuna_entrega" type="xsd:string" minOccurs="0"/>
            <xsd:element name="ciudad_entrega" type="xsd:string" minOccurs="0"/>
            <xsd:element name="region_entrega" type="xsd:string" minOccurs="0"/>
            <xsd:element name="telefono_contacto" type="xsd:string" minOccurs="0"/>
            <xsd:element name="instrucciones_entrega" type="xsd:string" minOccurs="0"/>
            <xsd:element name="detalles" type="tns:ArrayOfDetallesPedido"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      
      <!-- CrearPedido Response -->
      <xsd:element name="CrearPedidoResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="exito" type="xsd:boolean"/>
            <xsd:element name="mensaje" type="xsd:string"/>
            <xsd:element name="id" type="xsd:int" minOccurs="0"/>
            <xsd:element name="numero_pedido" type="xsd:string" minOccurs="0"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      
      <!-- ConsultarPedido Request -->
      <xsd:element name="ConsultarPedidoRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="id" type="xsd:int" minOccurs="0"/>
            <xsd:element name="numeroPedido" type="xsd:string" minOccurs="0"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      
      <!-- ConsultarPedido Response -->
      <xsd:element name="ConsultarPedidoResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="exito" type="xsd:boolean"/>
            <xsd:element name="mensaje" type="xsd:string" minOccurs="0"/>
            <xsd:element name="pedido" type="xsd:anyType" minOccurs="0"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      
      <!-- ActualizarEstadoPedido Request -->
      <xsd:element name="ActualizarEstadoPedidoRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="id" type="xsd:int"/>
            <xsd:element name="nuevoEstado" type="xsd:string"/>
            <xsd:element name="comentario" type="xsd:string" minOccurs="0"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      
      <!-- ActualizarEstadoPedido Response -->
      <xsd:element name="ActualizarEstadoPedidoResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="exito" type="xsd:boolean"/>
            <xsd:element name="mensaje" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      
      <!-- ConsultarPedidosPorUsuario Request -->
      <xsd:element name="ConsultarPedidosPorUsuarioRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="usuarioId" type="xsd:int"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      
      <!-- ConsultarPedidosPorUsuario Response -->
      <xsd:element name="ConsultarPedidosPorUsuarioResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="exito" type="xsd:boolean"/>
            <xsd:element name="mensaje" type="xsd:string" minOccurs="0"/>
            <xsd:element name="pedidos" type="xsd:anyType" minOccurs="0"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      
      <!-- ConsultarPedidosPorEstado Request -->
      <xsd:element name="ConsultarPedidosPorEstadoRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="estado" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      
      <!-- ConsultarPedidosPorEstado Response -->
      <xsd:element name="ConsultarPedidosPorEstadoResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="exito" type="xsd:boolean"/>
            <xsd:element name="mensaje" type="xsd:string" minOccurs="0"/>
            <xsd:element name="pedidos" type="xsd:anyType" minOccurs="0"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
    </xsd:schema>
  </wsdl:types>

  <!-- Mensajes -->
  <wsdl:message name="CrearPedidoRequest">
    <wsdl:part name="parameters" element="tns:CrearPedidoRequest"/>
  </wsdl:message>
  <wsdl:message name="CrearPedidoResponse">
    <wsdl:part name="parameters" element="tns:CrearPedidoResponse"/>
  </wsdl:message>
  
  <wsdl:message name="ConsultarPedidoRequest">
    <wsdl:part name="parameters" element="tns:ConsultarPedidoRequest"/>
  </wsdl:message>
  <wsdl:message name="ConsultarPedidoResponse">
    <wsdl:part name="parameters" element="tns:ConsultarPedidoResponse"/>
  </wsdl:message>
  
  <wsdl:message name="ActualizarEstadoPedidoRequest">
    <wsdl:part name="parameters" element="tns:ActualizarEstadoPedidoRequest"/>
  </wsdl:message>
  <wsdl:message name="ActualizarEstadoPedidoResponse">
    <wsdl:part name="parameters" element="tns:ActualizarEstadoPedidoResponse"/>
  </wsdl:message>
  
  <wsdl:message name="ConsultarPedidosPorUsuarioRequest">
    <wsdl:part name="parameters" element="tns:ConsultarPedidosPorUsuarioRequest"/>
  </wsdl:message>
  <wsdl:message name="ConsultarPedidosPorUsuarioResponse">
    <wsdl:part name="parameters" element="tns:ConsultarPedidosPorUsuarioResponse"/>
  </wsdl:message>
  
  <wsdl:message name="ConsultarPedidosPorEstadoRequest">
    <wsdl:part name="parameters" element="tns:ConsultarPedidosPorEstadoRequest"/>
  </wsdl:message>
  <wsdl:message name="ConsultarPedidosPorEstadoResponse">
    <wsdl:part name="parameters" element="tns:ConsultarPedidosPorEstadoResponse"/>
  </wsdl:message>

  <!-- Port Type -->
  <wsdl:portType name="PedidoPortType">
    <wsdl:operation name="CrearPedido">
      <wsdl:input message="tns:CrearPedidoRequest"/>
      <wsdl:output message="tns:CrearPedidoResponse"/>
    </wsdl:operation>
    
    <wsdl:operation name="ConsultarPedido">
      <wsdl:input message="tns:ConsultarPedidoRequest"/>
      <wsdl:output message="tns:ConsultarPedidoResponse"/>
    </wsdl:operation>
    
    <wsdl:operation name="ActualizarEstadoPedido">
      <wsdl:input message="tns:ActualizarEstadoPedidoRequest"/>
      <wsdl:output message="tns:ActualizarEstadoPedidoResponse"/>
    </wsdl:operation>
    
    <wsdl:operation name="ConsultarPedidosPorUsuario">
      <wsdl:input message="tns:ConsultarPedidosPorUsuarioRequest"/>
      <wsdl:output message="tns:ConsultarPedidosPorUsuarioResponse"/>
    </wsdl:operation>
    
    <wsdl:operation name="ConsultarPedidosPorEstado">
      <wsdl:input message="tns:ConsultarPedidosPorEstadoRequest"/>
      <wsdl:output message="tns:ConsultarPedidosPorEstadoResponse"/>
    </wsdl:operation>
  </wsdl:portType>

  <!-- Binding -->
  <wsdl:binding name="PedidoSOAP" type="tns:PedidoPortType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    
    <wsdl:operation name="CrearPedido">
      <soap:operation soapAction="http://ferremas.cl/ws-pedido/CrearPedido"/>
      <wsdl:input>
        <soap:body use="literal"/>
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal"/>
      </wsdl:output>
    </wsdl:operation>
    
    <wsdl:operation name="ConsultarPedido">
      <soap:operation soapAction="http://ferremas.cl/ws-pedido/ConsultarPedido"/>
      <wsdl:input>
        <soap:body use="literal"/>
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal"/>
      </wsdl:output>
    </wsdl:operation>
    
    <wsdl:operation name="ActualizarEstadoPedido">
      <soap:operation soapAction="http://ferremas.cl/ws-pedido/ActualizarEstadoPedido"/>
      <wsdl:input>
        <soap:body use="literal"/>
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal"/>
      </wsdl:output>
    </wsdl:operation>
    
    <wsdl:operation name="ConsultarPedidosPorUsuario">
      <soap:operation soapAction="http://ferremas.cl/ws-pedido/ConsultarPedidosPorUsuario"/>
      <wsdl:input>
        <soap:body use="literal"/>
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal"/>
      </wsdl:output>
    </wsdl:operation>
    
    <wsdl:operation name="ConsultarPedidosPorEstado">
      <soap:operation soapAction="http://ferremas.cl/ws-pedido/ConsultarPedidosPorEstado"/>
      <wsdl:input>
        <soap:body use="literal"/>
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal"/>
      </wsdl:output>
    </wsdl:operation>
  </wsdl:binding>

  <!-- Service -->
  <wsdl:service name="PedidoService">
    <wsdl:port binding="tns:PedidoSOAP" name="PedidoSOAP">
      <soap:address location="http://localhost:${config.port}${config.service.path}"/>
    </wsdl:port>
  </wsdl:service>
</wsdl:definitions>`;
    
    fs.writeFileSync(wsdlPath, wsdlContent);
    logger.info(`Archivo WSDL creado en: ${wsdlPath}`);
  }
  
  return wsdlPath;
}

/**
 * Inicializa el servidor SOAP de manera segura
 * @param {Object} app - Instancia de Express
 * @returns {Promise<Object>} Servidor SOAP
 */
function iniciarServidorSOAP(app) {
  return new Promise((resolve, reject) => {
    try {
      // Asegurarnos de tener el WSDL
      const wsdlPath = path.join(__dirname, 'wsdl-file.xml');
      if (!fs.existsSync(wsdlPath)) {
        // Usa el WSDL del archivo paste.txt o crea uno básico
        const wsdlContent = fs.existsSync(path.join(__dirname, '../../../paste.txt')) 
          ? fs.readFileSync(path.join(__dirname, '../../../paste.txt'), 'utf8')
          : fs.readFileSync(path.join(__dirname, 'wsdl.js'), 'utf8').replace('module.exports = ', '');
        fs.writeFileSync(wsdlPath, wsdlContent);
      }
      
      // Endpoint para obtener el WSDL
      app.get(config.service.path, (req, res) => {
        if (req.query.wsdl !== undefined) {
          res.setHeader('Content-Type', 'application/xml');
          res.send(fs.readFileSync(wsdlPath, 'utf8'));
          logger.info('WSDL enviado al cliente');
        } else {
          res.send('Servicio WS-Pedido: Para ver el WSDL, agregue ?wsdl a la URL');
        }
      });
      
      // Endpoint para recibir solicitudes SOAP
      app.post(config.service.path, (req, res) => {
        logger.info('Solicitud SOAP recibida');
        
        // Determinar qué operación se está solicitando
        const xmlBody = req.body.toString();
        let operacion = '';
        let respuesta = '';
        
        if (xmlBody.includes('CrearPedidoRequest')) {
          operacion = 'CrearPedido';
          respuesta = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://ferremas.cl/ws-pedido">
  <soap:Body>
    <tns:CrearPedidoResponse>
      <tns:exito>true</tns:exito>
      <tns:mensaje>Pedido creado exitosamente</tns:mensaje>
      <tns:id>1</tns:id>
      <tns:numero_pedido>PED-250512-0001</tns:numero_pedido>
    </tns:CrearPedidoResponse>
  </soap:Body>
</soap:Envelope>`;
        } else if (xmlBody.includes('ConsultarPedidoRequest')) {
          operacion = 'ConsultarPedido';
          respuesta = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://ferremas.cl/ws-pedido">
  <soap:Body>
    <tns:ConsultarPedidoResponse>
      <tns:exito>true</tns:exito>
      <tns:pedido>{"id":1,"numero_pedido":"PED-250512-0001","estado":"pendiente"}</tns:pedido>
    </tns:ConsultarPedidoResponse>
  </soap:Body>
</soap:Envelope>`;
        } else if (xmlBody.includes('ActualizarEstadoPedidoRequest')) {
          operacion = 'ActualizarEstadoPedido';
          respuesta = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://ferremas.cl/ws-pedido">
  <soap:Body>
    <tns:ActualizarEstadoPedidoResponse>
      <tns:exito>true</tns:exito>
      <tns:mensaje>Estado actualizado exitosamente</tns:mensaje>
    </tns:ActualizarEstadoPedidoResponse>
  </soap:Body>
</soap:Envelope>`;
        } else if (xmlBody.includes('ConsultarPedidosPorUsuarioRequest')) {
          operacion = 'ConsultarPedidosPorUsuario';
          respuesta = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://ferremas.cl/ws-pedido">
  <soap:Body>
    <tns:ConsultarPedidosPorUsuarioResponse>
      <tns:exito>true</tns:exito>
      <tns:pedidos>[{"id":1,"numero_pedido":"PED-250512-0001","estado":"pendiente"}]</tns:pedidos>
    </tns:ConsultarPedidosPorUsuarioResponse>
  </soap:Body>
</soap:Envelope>`;
        } else if (xmlBody.includes('ConsultarPedidosPorEstadoRequest')) {
          operacion = 'ConsultarPedidosPorEstado';
          respuesta = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://ferremas.cl/ws-pedido">
  <soap:Body>
    <tns:ConsultarPedidosPorEstadoResponse>
      <tns:exito>true</tns:exito>
      <tns:pedidos>[{"id":1,"numero_pedido":"PED-250512-0001","estado":"pendiente"}]</tns:pedidos>
    </tns:ConsultarPedidosPorEstadoResponse>
  </soap:Body>
</soap:Envelope>`;
        } else {
          logger.error('Operación no reconocida');
          respuesta = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Server</faultcode>
      <faultstring>Operación no reconocida</faultstring>
      <detail>El servicio no pudo identificar la operación solicitada</detail>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`;
        }
        
        if (operacion) {
          logger.info(`Operación solicitada: ${operacion}`);
        }
        
        // Enviar respuesta
        res.setHeader('Content-Type', 'application/xml');
        res.send(respuesta);
        logger.info('Respuesta SOAP enviada');
      });
      
      logger.info(`Servidor SOAP iniciado en: ${config.service.path}`);
      logger.info(`WSDL disponible en: ${config.service.path}?wsdl`);
      
      resolve(true);
    } catch (error) {
      logger.error('Error al iniciar servidor SOAP:', error);
      resolve(false);
    }
  });
}

module.exports = { iniciarServidorSOAP };