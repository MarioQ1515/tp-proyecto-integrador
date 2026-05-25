const mongoose = require('mongoose');
const Pedido = require('../models/Pedido');
const Carrito = require('../models/Carrito');
const Producto = require('../models/Producto');

const soportaTransacciones = () => {
  const topologyType = mongoose.connection.client?.topology?.description?.type;
  return ['ReplicaSetWithPrimary', 'Sharded', 'LoadBalanced'].includes(topologyType);
};

const datosPedidoDesdeCarrito = (carrito, usuarioId, direccionEntrega) => ({
  usuarioId,
  items: carrito.items.map(item => ({
    productoId: item.productoId,
    cantidad: item.cantidad,
    precioUnitario: item.precioUnitario,
    subtotal: item.subtotal
  })),
  total: carrito.total,
  direccionEntrega,
  estado: 'pendiente'
});

const descontarStock = async (items, options = {}) => {
  const descontados = [];

  try {
    for (const item of items) {
      const actualizado = await Producto.findOneAndUpdate(
        { _id: item.productoId, stock: { $gte: item.cantidad } },
        { $inc: { stock: -item.cantidad } },
        options
      );

      if (!actualizado) {
        const err = new Error('Stock insuficiente para uno o más productos');
        err.status = 400;
        throw err;
      }

      descontados.push(item);
    }
  } catch (error) {
    if (!options.session && descontados.length > 0) {
      await Promise.all(descontados.map(item =>
        Producto.findByIdAndUpdate(item.productoId, { $inc: { stock: item.cantidad } })
      ));
    }
    throw error;
  }
};

const crearPedidoConTransaccion = async (carrito, usuarioId, direccionEntrega) => {
  const session = await mongoose.startSession();

  try {
    let pedido;
    await session.withTransaction(async () => {
      await descontarStock(carrito.items, { session });

      [pedido] = await Pedido.create(
        [datosPedidoDesdeCarrito(carrito, usuarioId, direccionEntrega)],
        { session }
      );

      carrito.estado = 'completado';
      await carrito.save({ session });
    });
    return pedido;
  } finally {
    session.endSession();
  }
};

const crearPedidoSinTransaccion = async (carrito, usuarioId, direccionEntrega) => {
  await descontarStock(carrito.items);

  let pedido;
  try {
    pedido = await Pedido.create(datosPedidoDesdeCarrito(carrito, usuarioId, direccionEntrega));
    carrito.estado = 'completado';
    await carrito.save();
    return pedido;
  } catch (error) {
    if (pedido) {
      await Pedido.findByIdAndDelete(pedido._id);
    }
    await Promise.all(carrito.items.map(item =>
      Producto.findByIdAndUpdate(item.productoId, { $inc: { stock: item.cantidad } })
    ));
    throw error;
  }
};

// POST /api/pedidos
// Body: { direccionEntrega }
const crearPedido = async (req, res) => {
  const { direccionEntrega } = req.body;

  if (!direccionEntrega || typeof direccionEntrega !== 'string' || direccionEntrega.trim().length === 0) {
    return res.status(400).json({ mensaje: 'La dirección de entrega es obligatoria' });
  }

  let carrito;
  try {
    carrito = await Carrito.findOne({ usuarioId: req.usuarioId, estado: 'activo' });
    if (!carrito || carrito.items.length === 0) {
      return res.status(400).json({ mensaje: 'El carrito está vacío' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al procesar el pedido', error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor' });
  }

  try {
    const pedido = soportaTransacciones()
      ? await crearPedidoConTransaccion(carrito, req.usuarioId, direccionEntrega)
      : await crearPedidoSinTransaccion(carrito, req.usuarioId, direccionEntrega);
    res.status(201).json({ mensaje: 'Pedido creado correctamente', pedido });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ mensaje: error.message });
    }
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
        .populate({
          path: 'items.productoId',
          select: 'nombre precio categoriaId',
          populate: { path: 'categoriaId', select: 'nombre' }
        })
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
    const ESTADOS_VALIDOS = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];

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
