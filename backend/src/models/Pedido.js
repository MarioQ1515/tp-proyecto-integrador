const { Schema, model } = require('mongoose');

const itemPedidoSchema = new Schema({
  productoId:     { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad:       { type: Number, required: true },
  precioUnitario: { type: Number, required: true },
  subtotal:       { type: Number, required: true }
});

const pedidoSchema = new Schema({
  usuarioId:         { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  items:             [itemPedidoSchema],
  fechaPedido:       { type: Date, default: Date.now },
  total:             { type: Number, required: true },
  direccionEntrega:  { type: String, required: true },
  estado:            { type: String, enum: ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'], default: 'pendiente' }
});

module.exports = model('Pedido', pedidoSchema);
