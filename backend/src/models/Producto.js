const { Schema, model } = require('mongoose');

const productoSchema = new Schema({
  categoriaId:  { type: Schema.Types.ObjectId, ref: 'Categoria', required: true },
  nombre:       { type: String, required: true },
  descripcion:  { type: String },
  precio:       { type: Number, required: true, min: 0 },
  stock:        { type: Number, required: true, min: 0, default: 0 },
  imagen:       { type: String },
  estado:       { type: String, enum: ['activo', 'inactivo'], default: 'activo' }
});

module.exports = model('Producto', productoSchema);
