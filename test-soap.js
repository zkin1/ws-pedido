const http = require('http');
const fs = require('fs');

// Configuración de la prueba
const HOST = 'localhost';
const PORT = 8004;
const PATH = '/ws-pedido';

// Variables para almacenar datos entre pruebas
let pedidoId = null;
let numeroPedido = null;

// Función para enviar solicitudes SOAP genéricas
function sendSoapRequest(envelope, soapAction) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(envelope),
        'SOAPAction': `http://ferremas.cl/ws-pedido/${soapAction}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(envelope);
    req.end();
  });
}

// 1. Verificar WSDL
async function checkWsdl() {
  console.log('\n=== TEST 1: VERIFICACIÓN DE WSDL ===');
  
  try {
    const options = {
      hostname: HOST,
      port: PORT,
      path: `${PATH}?wsdl`,
      method: 'GET'
    };

    const wsdlPromise = new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.end();
    });

    const response = await wsdlPromise;
    
    console.log(`Código de estado: ${response.statusCode}`);
    
    if (response.statusCode === 200 && response.data.includes('wsdl:definitions')) {
      console.log('✅ WSDL disponible y accesible');
      console.log('✓ Contiene definiciones WSDL correctas');
      
      // Verificar operaciones esperadas
      const operaciones = [
        'CrearPedido', 
        'ConsultarPedido', 
        'ActualizarEstadoPedido',
        'ConsultarPedidosPorUsuario',
        'ConsultarPedidosPorEstado'
      ];
      
      const operacionesFaltantes = [];
      for (const op of operaciones) {
        if (!response.data.includes(op)) {
          operacionesFaltantes.push(op);
        }
      }
      
      if (operacionesFaltantes.length === 0) {
        console.log('✓ WSDL contiene todas las operaciones esperadas');
      } else {
        console.log(`❌ Operaciones faltantes en WSDL: ${operacionesFaltantes.join(', ')}`);
      }
      
      return true;
    } else {
      console.log('❌ WSDL no disponible o formato incorrecto');
      return false;
    }
  } catch (error) {
    console.error(`❌ Error al verificar WSDL: ${error.message}`);
    return false;
  }
}

// 2. Crear Pedido
async function testCrearPedido() {
  console.log('\n=== TEST 2: CREAR PEDIDO ===');
  
  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://ferremas.cl/ws-pedido">
  <soap:Body>
    <tns:CrearPedidoRequest>
      <tns:usuario_id>1</tns:usuario_id>
      <tns:total>31.98</tns:total>
      <tns:costo_envio>10.00</tns:costo_envio>
      <tns:total_final>41.98</tns:total_final>
      <tns:metodo_pago>webpay</tns:metodo_pago>
      <tns:tipo_entrega>despacho</tns:tipo_entrega>
      <tns:direccion_entrega>Av Principal 123</tns:direccion_entrega>
      <tns:comuna_entrega>Santiago</tns:comuna_entrega>
      <tns:ciudad_entrega>Santiago</tns:ciudad_entrega>
      <tns:region_entrega>Metropolitana</tns:region_entrega>
      <tns:detalles>
        <tns:detalle>
          <tns:producto_id>1</tns:producto_id>
          <tns:nombre_producto>Martillo de Carpintero</tns:nombre_producto>
          <tns:cantidad>2</tns:cantidad>
          <tns:precio_unitario>15.99</tns:precio_unitario>
        </tns:detalle>
      </tns:detalles>
    </tns:CrearPedidoRequest>
  </soap:Body>
</soap:Envelope>`;

  try {
    const response = await sendSoapRequest(envelope, 'CrearPedido');
    
    console.log(`Código de estado: ${response.statusCode}`);
    
    if (response.statusCode === 200 && response.data.includes('CrearPedidoResponse')) {
      console.log('✅ Pedido creado correctamente');
      
      // Extraer ID y número de pedido para usar en otras pruebas
      const idMatch = response.data.match(/<tns:id>(\d+)<\/tns:id>/);
      const numMatch = response.data.match(/<tns:numero_pedido>([^<]+)<\/tns:numero_pedido>/);
      
      if (idMatch && idMatch[1]) {
        pedidoId = idMatch[1];
        console.log(`✓ ID de pedido obtenido: ${pedidoId}`);
      }
      
      if (numMatch && numMatch[1]) {
        numeroPedido = numMatch[1];
        console.log(`✓ Número de pedido obtenido: ${numeroPedido}`);
      }
      
      return true;
    } else {
      console.log('❌ Error al crear pedido');
      console.log('Respuesta:', response.data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error en la prueba: ${error.message}`);
    return false;
  }
}

// 3. Consultar Pedido por ID
async function testConsultarPedidoPorId() {
  console.log('\n=== TEST 3: CONSULTAR PEDIDO POR ID ===');
  
  if (!pedidoId) {
    console.log('⚠️ No hay ID de pedido disponible. Omitiendo prueba.');
    return false;
  }
  
  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://ferremas.cl/ws-pedido">
  <soap:Body>
    <tns:ConsultarPedidoRequest>
      <tns:id>${pedidoId}</tns:id>
    </tns:ConsultarPedidoRequest>
  </soap:Body>
</soap:Envelope>`;

  try {
    const response = await sendSoapRequest(envelope, 'ConsultarPedido');
    
    console.log(`Código de estado: ${response.statusCode}`);
    
    if (response.statusCode === 200 && response.data.includes('ConsultarPedidoResponse')) {
      if (response.data.includes('<tns:exito>true</tns:exito>')) {
        console.log(`✅ Pedido consultado correctamente por ID: ${pedidoId}`);
        return true;
      } else {
        console.log(`❌ Error en la respuesta al consultar pedido por ID: ${pedidoId}`);
        console.log('Respuesta:', response.data);
        return false;
      }
    } else {
      console.log('❌ Error al consultar pedido por ID');
      console.log('Respuesta:', response.data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error en la prueba: ${error.message}`);
    return false;
  }
}

// 4. Consultar Pedido por Número
async function testConsultarPedidoPorNumero() {
  console.log('\n=== TEST 4: CONSULTAR PEDIDO POR NÚMERO ===');
  
  if (!numeroPedido) {
    console.log('⚠️ No hay número de pedido disponible. Omitiendo prueba.');
    return false;
  }
  
  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://ferremas.cl/ws-pedido">
  <soap:Body>
    <tns:ConsultarPedidoRequest>
      <tns:numeroPedido>${numeroPedido}</tns:numeroPedido>
    </tns:ConsultarPedidoRequest>
  </soap:Body>
</soap:Envelope>`;

  try {
    const response = await sendSoapRequest(envelope, 'ConsultarPedido');
    
    console.log(`Código de estado: ${response.statusCode}`);
    
    if (response.statusCode === 200 && response.data.includes('ConsultarPedidoResponse')) {
      if (response.data.includes('<tns:exito>true</tns:exito>')) {
        console.log(`✅ Pedido consultado correctamente por número: ${numeroPedido}`);
        return true;
      } else {
        console.log(`❌ Error en la respuesta al consultar pedido por número: ${numeroPedido}`);
        console.log('Respuesta:', response.data);
        return false;
      }
    } else {
      console.log('❌ Error al consultar pedido por número');
      console.log('Respuesta:', response.data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error en la prueba: ${error.message}`);
    return false;
  }
}

// 5. Actualizar Estado de Pedido
async function testActualizarEstadoPedido() {
  console.log('\n=== TEST 5: ACTUALIZAR ESTADO DE PEDIDO ===');
  
  if (!pedidoId) {
    console.log('⚠️ No hay ID de pedido disponible. Omitiendo prueba.');
    return false;
  }
  
  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://ferremas.cl/ws-pedido">
  <soap:Body>
    <tns:ActualizarEstadoPedidoRequest>
      <tns:id>${pedidoId}</tns:id>
      <tns:nuevoEstado>pagado</tns:nuevoEstado>
      <tns:comentario>Pago recibido mediante WebPay</tns:comentario>
    </tns:ActualizarEstadoPedidoRequest>
  </soap:Body>
</soap:Envelope>`;

  try {
    const response = await sendSoapRequest(envelope, 'ActualizarEstadoPedido');
    
    console.log(`Código de estado: ${response.statusCode}`);
    
    if (response.statusCode === 200 && response.data.includes('ActualizarEstadoPedidoResponse')) {
      if (response.data.includes('<tns:exito>true</tns:exito>')) {
        console.log(`✅ Estado del pedido actualizado correctamente a: pagado`);
        return true;
      } else {
        console.log(`❌ Error en la respuesta al actualizar estado del pedido`);
        console.log('Respuesta:', response.data);
        return false;
      }
    } else {
      console.log('❌ Error al actualizar estado del pedido');
      console.log('Respuesta:', response.data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error en la prueba: ${error.message}`);
    return false;
  }
}

// 6. Consultar Pedidos por Usuario
async function testConsultarPedidosPorUsuario() {
  console.log('\n=== TEST 6: CONSULTAR PEDIDOS POR USUARIO ===');
  
  const usuarioId = 1; // ID de usuario para la prueba
  
  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://ferremas.cl/ws-pedido">
  <soap:Body>
    <tns:ConsultarPedidosPorUsuarioRequest>
      <tns:usuarioId>${usuarioId}</tns:usuarioId>
    </tns:ConsultarPedidosPorUsuarioRequest>
  </soap:Body>
</soap:Envelope>`;

  try {
    const response = await sendSoapRequest(envelope, 'ConsultarPedidosPorUsuario');
    
    console.log(`Código de estado: ${response.statusCode}`);
    
    if (response.statusCode === 200 && response.data.includes('ConsultarPedidosPorUsuarioResponse')) {
      if (response.data.includes('<tns:exito>true</tns:exito>')) {
        console.log(`✅ Pedidos consultados correctamente para el usuario ID: ${usuarioId}`);
        return true;
      } else {
        console.log(`❌ Error en la respuesta al consultar pedidos del usuario ID: ${usuarioId}`);
        console.log('Respuesta:', response.data);
        return false;
      }
    } else {
      console.log('❌ Error al consultar pedidos por usuario');
      console.log('Respuesta:', response.data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error en la prueba: ${error.message}`);
    return false;
  }
}

// 7. Consultar Pedidos por Estado
async function testConsultarPedidosPorEstado() {
  console.log('\n=== TEST 7: CONSULTAR PEDIDOS POR ESTADO ===');
  
  const estado = 'pagado'; // Estado para buscar pedidos
  
  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://ferremas.cl/ws-pedido">
  <soap:Body>
    <tns:ConsultarPedidosPorEstadoRequest>
      <tns:estado>${estado}</tns:estado>
    </tns:ConsultarPedidosPorEstadoRequest>
  </soap:Body>
</soap:Envelope>`;

  try {
    const response = await sendSoapRequest(envelope, 'ConsultarPedidosPorEstado');
    
    console.log(`Código de estado: ${response.statusCode}`);
    
    if (response.statusCode === 200 && response.data.includes('ConsultarPedidosPorEstadoResponse')) {
      if (response.data.includes('<tns:exito>true</tns:exito>')) {
        console.log(`✅ Pedidos consultados correctamente con estado: ${estado}`);
        return true;
      } else {
        console.log(`❌ Error en la respuesta al consultar pedidos con estado: ${estado}`);
        console.log('Respuesta:', response.data);
        return false;
      }
    } else {
      console.log('❌ Error al consultar pedidos por estado');
      console.log('Respuesta:', response.data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error en la prueba: ${error.message}`);
    return false;
  }
}

// Función para mostrar resumen de pruebas
function mostrarResumen(resultados) {
  console.log('\n=== RESUMEN DE PRUEBAS ===');
  
  let exitosas = 0;
  let fallidas = 0;
  let omitidas = 0;
  
  for (const [nombre, resultado] of Object.entries(resultados)) {
    if (resultado === true) {
      exitosas++;
    } else if (resultado === false) {
      fallidas++;
    } else {
      omitidas++;
    }
  }
  
  console.log(`✅ Pruebas exitosas: ${exitosas}`);
  console.log(`❌ Pruebas fallidas: ${fallidas}`);
  if (omitidas > 0) {
    console.log(`⚠️ Pruebas omitidas: ${omitidas}`);
  }
  
  const total = exitosas + fallidas + omitidas;
  const porcentajeExito = Math.round((exitosas / total) * 100);
  
  console.log(`\nResultado final: ${porcentajeExito}% de éxito`);
  
  if (porcentajeExito === 100) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE! 🎉');
  } else if (porcentajeExito >= 80) {
    console.log('\n✅ PRUEBAS COMPLETADAS CON ALGUNAS ADVERTENCIAS');
  } else {
    console.log('\n⚠️ ATENCIÓN: VARIAS PRUEBAS FALLARON');
  }
}

// Ejecutar todas las pruebas secuencialmente
async function runAllTests() {
  console.log('\n🧪 INICIANDO PRUEBAS COMPLETAS DE SERVICIO SOAP WS-PEDIDO');
  console.log('========================================================');
  
  const resultados = {
    "Verificación de WSDL": await checkWsdl(),
    "Crear Pedido": await testCrearPedido(),
    "Consultar Pedido por ID": await testConsultarPedidoPorId(),
    "Consultar Pedido por Número": await testConsultarPedidoPorNumero(),
    "Actualizar Estado de Pedido": await testActualizarEstadoPedido(),
    "Consultar Pedidos por Usuario": await testConsultarPedidosPorUsuario(),
    "Consultar Pedidos por Estado": await testConsultarPedidosPorEstado()
  };
  
  mostrarResumen(resultados);
}

// Ejecutar todas las pruebas
runAllTests();