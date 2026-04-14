const Pedido = require('../models/Pedido');
const Carrito = require('../models/Carrito');
const Producto = require('../models/Producto');

// POST /api/pedidos
// Body: { direccionEntrega }
const crearPedido = async (req, res) => {
  try {
    const { direccionEntrega } = req.body;

    if (!direccionEntrega || typeof direccionEntrega !== 'string' || direccionEntrega.trim().length === 0) {
      return res.status(400).json({ mensaje: 'La dirección de entrega es obligatoria' });
    }

    const carrito = await Carrito.findOne({ usuarioId: req.usuarioId, estado: 'activo' });

    if (!carrito || carrito.items.length === 0) {
      return res.status(400).json({ mensaje: 'El carrito está vacío' });
    }

    // Descuenta stock de forma atómica por cada item; rollback si alguno falla
    const decrementados = [];
    for (const item of carrito.items) {
      const actualizado = await Producto.findOneAndUpdate(
        { _id: item.productoId, stock: { $gte: item.cantidad } },
        { $inc: { stock: -item.cantidad } }
      );
      if (!actualizado) {
        for (const dec of decrementados) {
          await Producto.findByIdAndUpdate(dec.productoId, { $inc: { stock: dec.cantidad } });
        }
        return res.status(400).json({ mensaje: 'Stock insuficiente para uno o más productos' });
      }
      decrementados.push({ productoId: item.productoId, cantidad: item.cantidad });
    }

    const pedido = await Pedido.create({
      usuarioId: req.usuarioId,
      items: carrito.items,
      total: carrito.total,
      direccionEntrega,
      estado: 'pendiente'
    });

    // Marca el carrito como completado
    carrito.estado = 'completado';
    await carrito.save();

    res.status(201).json({ mensaje: 'Pedido creado correctamente', pedido });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear pedido', error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor' });
  }
};

// GET /api/pedidos
// Query params opcionales: ?page=1&limit=10
const listarPedidos = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip  = (page - 1) * limit;

    const filtro = { usuarioId: req.usuarioId };

    const [pedidos, total] = await Promise.all([
      Pedido.find(filtro)
        .populate('items.productoId', 'nombre precio')
        .sort({ fechaPedido: -1 })
        .skip(skip)
        .limit(limit),
      Pedido.countDocuments(filtro)
    ]);

    res.json({
      data: pedidos,
      paginacion: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener pedidos', error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor' });
  }
};

// GET /api/pedidos/:id
const obtenerPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findOne({ _id: req.params.id, usuarioId: req.usuarioId })
      .populate('items.productoId', 'nombre precio imagen');

    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    res.json(pedido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener pedido', error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor' });
  }
};

// PATCH /api/pedidos/:id/estado  (solo admin)
// Body: { estado }
const actualizarEstadoPedido = async (req, res) => {
  try {
    const { estado } = req.body;
    const ESTADOS_VALIDOS = ['pendiente', 'confirmado', 'cancelado'];

    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ mensaje: `El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}` });
    }

    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    ).populate('items.productoId', 'nombre precio');

    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    res.json(pedido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar estado del pedido', error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor' });
  }
};

// GET /api/pedidos/admin/todos  (solo admin)
// Query params opcionales: ?page=1&limit=10&estado=<estado>
const listarTodosLosPedidos = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip  = (page - 1) * limit;

    const filtro = {};
    if (req.query.estado) {
      filtro.estado = req.query.estado;
    }

    const [pedidos, total] = await Promise.all([
      Pedido.find(filtro)
        .populate('usuarioId', 'nombre apellido email')
        .populate('items.productoId', 'nombre precio')
        .sort({ fechaPedido: -1 })
        .skip(skip)
        .limit(limit),
      Pedido.countDocuments(filtro)
    ]);

    res.json({
      data: pedidos,
      paginacion: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener pedidos', error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor' });
  }
};

module.exports = { crearPedido, listarPedidos, obtenerPedido, actualizarEstadoPedido, listarTodosLosPedidos };
