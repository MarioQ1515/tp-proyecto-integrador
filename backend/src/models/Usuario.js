const { Schema, model } = require('mongoose');

const usuarioSchema = new Schema({
  nombre:          { type: String, required: true },
  apellido:        { type: String, required: true },
  email:           { type: String, required: true, unique: true },
  passwordHash:    { type: String, required: true },
  telefono:        { type: String },
  direccion:       { type: String },
  fechaRegistro:   { type: Date, default: Date.now },
  estado:          { type: String, enum: ['activo', 'inactivo'], default: 'activo' },
  rol:             { type: String, enum: ['usuario', 'admin'], default: 'usuario' }
});

module.exports = model('Usuario', usuarioSchema);
