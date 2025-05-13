/**
 * Validadores para diferentes entidades del sistema de pedidos
 */

// Validar si un ID es válido
function validarId(id) {
  return id && !isNaN(parseInt(id)) && parseInt(id) > 0;
}

// Validar que un pedido tenga todos los campos requeridos
function validarDatosPedido(pedido) {
  // Campos obligatorios para un pedido
  const camposRequeridos = [
    'usuario_id', 
    'total', 
    'total_final', 
    'metodo_pago', 
    'tipo_entrega'
  ];
  
  // Verificar que todos los campos existan
  for (const campo of camposRequeridos) {
    if (pedido[campo] === undefined || pedido[campo] === null) {
      return { valido: false, mensaje: `El campo ${campo} es requerido` };
    }
  }
  
  // Validar que el total sea un número positivo
  if (isNaN(parseFloat(pedido.total)) || parseFloat(pedido.total) < 0) {
    return { valido: false, mensaje: 'El total debe ser un número positivo' };
  }
  
  // Validar método de pago
  const metodosValidos = ['webpay', 'transferencia'];
  if (!metodosValidos.includes(pedido.metodo_pago)) {
    return { valido: false, mensaje: 'Método de pago no válido' };
  }
  
  // Validar tipo de entrega
  const tiposEntregaValidos = ['despacho', 'retiro_tienda'];
  if (!tiposEntregaValidos.includes(pedido.tipo_entrega)) {
    return { valido: false, mensaje: 'Tipo de entrega no válido' };
  }
  
  // Si es despacho, validar dirección
  if (pedido.tipo_entrega === 'despacho') {
    if (!pedido.direccion_entrega || !pedido.comuna_entrega || !pedido.ciudad_entrega || !pedido.region_entrega) {
      return { valido: false, mensaje: 'Datos de entrega incompletos' };
    }
  }
  
  // Si es retiro en tienda, validar sucursal
  if (pedido.tipo_entrega === 'retiro_tienda' && !validarId(pedido.sucursal_retiro)) {
    return { valido: false, mensaje: 'Se requiere especificar la sucursal de retiro' };
  }
  
  // Validar detalles del pedido
  if (!pedido.detalles || !Array.isArray(pedido.detalles) || pedido.detalles.length === 0) {
    return { valido: false, mensaje: 'El pedido debe tener al menos un detalle' };
  }
  
  // Validar cada detalle
  for (const detalle of pedido.detalles) {
    if (!detalle.producto_id || !detalle.cantidad || !detalle.precio_unitario) {
      return { valido: false, mensaje: 'Datos incompletos en los detalles del pedido' };
    }
    
    if (parseInt(detalle.cantidad) <= 0) {
      return { valido: false, mensaje: 'La cantidad debe ser mayor a cero' };
    }
  }
  
  return { valido: true };
}

// Validar estado de pedido
function validarEstadoPedido(estado) {
  const estadosValidos = ['pendiente', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado'];
  return estadosValidos.includes(estado);
}

module.exports = {
  validarId,
  validarDatosPedido,
  validarEstadoPedido
};