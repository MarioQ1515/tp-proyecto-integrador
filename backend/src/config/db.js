const mongoose = require('mongoose');

const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Error al conectar MongoDB:', error.message);
    console.error('El servidor sigue corriendo pero sin base de datos.');
  }
};

module.exports = conectarDB;
