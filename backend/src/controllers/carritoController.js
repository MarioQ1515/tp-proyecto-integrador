const Carrito = require('../models/Carrito');
const Producto = require('../models/Producto');

const calcularTotal = (items) => items.reduce((acc, item) => acc + item.subtotal, 0);

// GET /api/carrito
const obtenerCarrito = async (req, res) => {
  try {
    let carrito = await Carrito.findOne({ usuarioId: req.usuarioId, estado: 'activo' })
      .populate('items.productoId', 'nombre imagen precio');

    if (!carrito) {
      return res.json({ items: [], total: 0 });
    }

    res.json(carrito);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener el carrito', error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor' });
  }
};

// POST /api/carrito/items
// Body: { productoId, cantidad }
const agregarItem = async (req, res) => {
  try {
    const { productoId, cantidad } = req.body;

    if (!productoId) {
      return res.status(400).json({ mensaje: 'productoId es requerido' });
    }

    if (!cantidad || cantidad < 1 || !Number.isInteger(cantidad)) {
      return res.status(400).json({ mensaje: 'La cantidad debe ser un entero positivo' });
    }

    const producto = await Producto.findById(productoId);
    if (!producto || producto.estado === 'inactivo') {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    let carrito = await Carrito.findOne({ usuarioId: req.usuarioId, estado: 'activo' });
    if (!carrito) {
      carrito = new Carrito({ usuarioId: req.usuarioId, items: [] });
    }

    // Si el producto ya está en el carrito, suma la cantidad
    const itemExistente = carrito.items.find(i => i.productoId.toString() === productoId);
    if (itemExistente) {
      const cantidadTotal = itemExistente.cantidad + cantidad;
      if (producto.stock < cantidadTotal) {
        return res.status(400).json({ mensaje: 'Stock insuficiente' });
      }
      itemExistente.cantidad = cantidadTotal;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.precioUnitario;
    } else {
      if (producto.stock < cantidad) {
        return res.status(400).json({ mensaje: 'Stock insuficiente' });
      }
      carrito.items.push({
        productoId,
        cantidad,
        precioUnitario: producto.precio,
        subtotal: producto.precio * cantidad
      });
    }

    carrito.total = calcularTotal(carrito.items);
    await carrito.save();

    res.status(201).json(carrito);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al agregar item', error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor' });
  }
};

// PUT /api/carrito/items/:itemId
// Body: { cantidad }
const actualizarItem = async (req, res) => {
  try {
    const { cantidad } = req.body;

    if (!cantidad || cantidad < 1 || !Number.isInteger(cantidad)) {
      return res.status(400).json({ mensaje: 'La cantidad debe ser un entero positivo' });
    }

    const carrito = await Carrito.findOne({ usuarioId: req.usuarioId, estado: 'activo' });

    if (!carrito) {
      return res.status(404).json({ mensaje: 'Carrito no encontrado' });
    }

    const item = carrito.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ mensaje: 'Item no encontrado en el carrito' });
    }

    const producto = await Producto.findById(item.productoId);
    if (!producto || producto.stock < cantidad) {
      return res.status(400).json({ mensaje: 'Stock insuficiente' });
    }

    item.cantidad = cantidad;
    item.subtotal = item.precioUnitario * cantidad;
    carrito.total = calcularTotal(carrito.items);
    await carrito.save();

    res.json(carrito);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar item', error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor' });
  }
};

// DELETE /api/carrito/items/:itemId
const eliminarItem = async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ usuarioId: req.usuarioId, estado: 'activo' });

    if (!carrito) {
      return res.status(404).json({ mensaje: 'Carrito no encontrado' });
    }

    carrito.items = carrito.items.filter(i => i._id.toString() !== req.params.itemId);
    carrito.total = calcularTotal(carrito.items);
    await carrito.save();

    res.json(carrito);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar item', error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor' });
  }
};

// DELETE /api/carrito
const vaciarCarrito = async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ usuarioId: req.usuarioId, estado: 'activo' });

    if (!carrito) {
      return res.status(404).json({ mensaje: 'Carrito no encontrado' });
    }

    carrito.items = [];
    carrito.total = 0;
    await carrito.save();

    res.json({ mensaje: 'Carrito vaciado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al vaciar el carrito', error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor' });
  }
};

module.exports = { obtenerCarrito, agregarItem, actualizarItem, eliminarItem, vaciarCarrito };
