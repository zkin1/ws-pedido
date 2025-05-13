const config = require('../../config/env.config');

// Definición del WSDL para el servicio de pedidos
const wsdl = `<?xml version="1.0" encoding="UTF-8"?>
<wsdl:definitions 
  xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" 
  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" 
  xmlns:tns="${config.service.namespace}" 
  xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
  targetNamespace="${config.service.namespace}">

  <wsdl:types>
    <xsd:schema targetNamespace="${config.service.namespace}">
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
      <soap:operation soapAction="${config.service.namespace}/CrearPedido"/>
      <wsdl:input>
        <soap:body use="literal"/>
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal"/>
      </wsdl:output>
    </wsdl:operation>
    
    <wsdl:operation name="ConsultarPedido">
      <soap:operation soapAction="${config.service.namespace}/ConsultarPedido"/>
      <wsdl:input>
        <soap:body use="literal"/>
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal"/>
      </wsdl:output>
    </wsdl:operation>
    
    <wsdl:operation name="ActualizarEstadoPedido">
      <soap:operation soapAction="${config.service.namespace}/ActualizarEstadoPedido"/>
      <wsdl:input>
        <soap:body use="literal"/>
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal"/>
      </wsdl:output>
    </wsdl:operation>
    
    <wsdl:operation name="ConsultarPedidosPorUsuario">
      <soap:operation soapAction="${config.service.namespace}/ConsultarPedidosPorUsuario"/>
      <wsdl:input>
        <soap:body use="literal"/>
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal"/>
      </wsdl:output>
    </wsdl:operation>
    
    <wsdl:operation name="ConsultarPedidosPorEstado">
      <soap:operation soapAction="${config.service.namespace}/ConsultarPedidosPorEstado"/>
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

module.exports = wsdl;