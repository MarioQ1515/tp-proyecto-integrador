const { Schema, model } = require('mongoose');

// Los items se embeben dentro del carrito (mas simple con MongoDB)
const itemCarritoSchema = new Schema({
  productoId:     { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad:       { type: Number, required: true, min: 1 },
  precioUnitario: { type: Number, required: true },
  subtotal:       { type: Number, required: true }
});

const carritoSchema = new Schema({
  usuarioId:     { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  items:         [itemCarritoSchema],
  fechaCreacion: { type: Date, default: Date.now },
  estado:        { type: String, enum: ['activo', 'completado'], default: 'activo' },
  total:         { type: Number, default: 0 }
});

module.exports = model('Carrito', carritoSchema);
