const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// POST /api/auth/registro
const registro = async (req, res) => {
  try {
    const { nombre, apellido, email, password, telefono, direccion } = req.body;

    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ mensaje: 'nombre, apellido, email y password son obligatorios' });
    }

    if (typeof nombre !== 'string' || nombre.trim().length === 0) {
      return res.status(400).json({ mensaje: 'nombre debe ser un texto válido' });
    }

    if (typeof apellido !== 'string' || apellido.trim().length === 0) {
      return res.status(400).json({ mensaje: 'apellido debe ser un texto válido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const emailNormalizado = email.toLowerCase().trim();

    const usuarioExistente = await Usuario.findOne({ email: emailNormalizado });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, apellido, email: emailNormalizado, passwordHash, telefono, direccion });

    res.status(201).json({ mensaje: 'Usuario registrado correctamente', id: usuario._id });
  } catch (error) {
    console.error(error);
    const errorMsg = process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor';
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: errorMsg });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'email y password son obligatorios' });
    }

    const emailNormalizado = email.toLowerCase().trim();

    const usuario = await Usuario.findOne({ email: emailNormalizado });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    if (usuario.estado === 'inactivo') {
      return res.status(401).json({ mensaje: 'Usuario inactivo' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error(error);
    const errorMsg = process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor';
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: errorMsg });
  }
};

// GET /api/auth/perfil
const perfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuarioId).select('-passwordHash');
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener perfil' });
  }
};

// GET /api/auth/usuarios  (solo admin)
const listarUsuarios = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip  = (page - 1) * limit;

    const filtro = {};
    if (req.query.rol)    filtro.rol    = req.query.rol;
    if (req.query.estado) filtro.estado = req.query.estado;

    const [usuarios, total] = await Promise.all([
      Usuario.find(filtro).select('-passwordHash').sort({ fechaRegistro: -1 }).skip(skip).limit(limit),
      Usuario.countDocuments(filtro)
    ]);

    res.json({
      data: usuarios,
      paginacion: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error(error);
    const errorMsg = process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor';
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: errorMsg });
  }
};

module.exports = { registro, login, perfil, listarUsuarios };
