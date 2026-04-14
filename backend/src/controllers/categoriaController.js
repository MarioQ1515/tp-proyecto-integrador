const Categoria = require('../models/Categoria');

// GET /api/categorias
const listarCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find({ estado: 'activo' });
    res.json(categorias);
  } catch (error) {
    console.error(error);
    const errorMsg = process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor';
    res.status(500).json({ mensaje: 'Error al obtener categorías', error: errorMsg });
  }
};

// POST /api/categorias
const crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      return res.status(400).json({ mensaje: 'El nombre es requerido' });
    }
    const categoria = new Categoria({ nombre, descripcion });
    await categoria.save();
    res.status(201).json(categoria);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya existe una categoría con ese nombre' });
    }
    const errorMsg = process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor';
    res.status(500).json({ mensaje: 'Error al crear categoría', error: errorMsg });
  }
};

// PUT /api/categorias/:id
const actualizarCategoria = async (req, res) => {
  try {
    const { nombre, descripcion, estado } = req.body;
    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion, estado },
      { new: true, runValidators: true }
    );
    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    res.json(categoria);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya existe una categoría con ese nombre' });
    }
    const errorMsg = process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor';
    res.status(500).json({ mensaje: 'Error al actualizar categoría', error: errorMsg });
  }
};

// DELETE /api/categorias/:id
const eliminarCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id,
      { estado: 'inactivo' },
      { new: true }
    );
    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (error) {
    console.error(error);
    const errorMsg = process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor';
    res.status(500).json({ mensaje: 'Error al eliminar categoría', error: errorMsg });
  }
};

module.exports = { listarCategorias, crearCategoria, actualizarCategoria, eliminarCategoria };
