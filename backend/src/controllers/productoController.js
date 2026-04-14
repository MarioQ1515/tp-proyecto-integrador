const Producto = require('../models/Producto');

// GET /api/productos

const listarProductos = async (req, res) => {
  try {
    const filtro = { estado: 'activo' };

    if (req.query.categoria) {
      filtro.categoriaId = req.query.categoria;
    }

    if (req.query.nombre) {
      filtro.nombre = { $regex: req.query.nombre, $options: 'i' };
    }

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip  = (page - 1) * limit;

    const [productos, total] = await Promise.all([
      Producto.find(filtro).populate('categoriaId', 'nombre').skip(skip).limit(limit),
      Producto.countDocuments(filtro)
    ]);

    res.json({
      data: productos,
      paginacion: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    const errorMsg = process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor';
    res.status(500).json({ mensaje: 'Error al obtener productos', error: errorMsg });
  }
};

// GET /api/productos/:id
const obtenerProducto = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id).populate('categoriaId', 'nombre');

    if (!producto || producto.estado === 'inactivo') {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    res.json(producto);
  } catch (error) {
    console.error(error);
    const errorMsg = process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor';
    res.status(500).json({ mensaje: 'Error al obtener producto', error: errorMsg });
  }
};

// POST /api/productos
const crearProducto = async (req, res) => {
  try {
    const { categoriaId, nombre, precio, stock } = req.body;
    if (!categoriaId || !nombre || precio === undefined || stock === undefined) {
      return res.status(400).json({ mensaje: 'categoriaId, nombre, precio y stock son requeridos' });
    }

    const Categoria = require('../models/Categoria');
    const categoriaExiste = await Categoria.findById(categoriaId);
    if (!categoriaExiste) {
      return res.status(400).json({ mensaje: 'La categoría especificada no existe' });
    }

    const producto = new Producto(req.body);
    await producto.save();
    await producto.populate('categoriaId', 'nombre');
    res.status(201).json(producto);
  } catch (error) {
    console.error(error);
    const errorMsg = process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor';
    res.status(500).json({ mensaje: 'Error al crear producto', error: errorMsg });
  }
};

// PUT /api/productos/:id
const actualizarProducto = async (req, res) => {
  try {
    const { categoriaId, nombre, descripcion, precio, stock, imagen, estado } = req.body;

    const cambios = {};
    if (categoriaId !== undefined) cambios.categoriaId = categoriaId;
    if (nombre      !== undefined) cambios.nombre      = nombre;
    if (descripcion !== undefined) cambios.descripcion = descripcion;
    if (precio      !== undefined) cambios.precio      = precio;
    if (stock       !== undefined) cambios.stock       = stock;
    if (imagen      !== undefined) cambios.imagen      = imagen;
    if (estado      !== undefined) cambios.estado      = estado;

    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      cambios,
      { new: true, runValidators: true }
    ).populate('categoriaId', 'nombre');

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    console.error(error);
    const errorMsg = process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor';
    res.status(500).json({ mensaje: 'Error al actualizar producto', error: errorMsg });
  }
};

// DELETE /api/productos/:id  (soft delete)
const eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { estado: 'inactivo' },
      { new: true }
    );
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    console.error(error);
    const errorMsg = process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor';
    res.status(500).json({ mensaje: 'Error al eliminar producto', error: errorMsg });
  }
};

module.exports = { listarProductos, obtenerProducto, crearProducto, actualizarProducto, eliminarProducto };
