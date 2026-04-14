const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ mensaje: 'Token requerido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = payload.id;
    req.usuarioRol = payload.rol;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
};

const verificarAdmin = (req, res, next) => {
  if (req.usuarioRol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol administrador' });
  }
  next();
};

const validarObjectId = (req, res, next) => {
  const id = req.params.id || req.params.itemId;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ mensaje: 'ID inválido' });
  }
  next();
};

module.exports = { verificarToken, verificarAdmin, validarObjectId };
