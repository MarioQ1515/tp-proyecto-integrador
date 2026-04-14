const { Schema, model } = require('mongoose');

const categoriaSchema = new Schema({
  nombre:      { type: String, required: true, unique: true },
  descripcion: { type: String },
  estado:      { type: String, enum: ['activo', 'inactivo'], default: 'activo' }
});

module.exports = model('Categoria', categoriaSchema);
