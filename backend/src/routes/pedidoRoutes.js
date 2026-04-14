const { Router } = require('express');
const { crearPedido, listarPedidos, obtenerPedido, actualizarEstadoPedido, listarTodosLosPedidos } = require('../controllers/pedidoController');
const { verificarToken, verificarAdmin, validarObjectId } = require('../middleware/auth');

const router = Router();


router.use(verificarToken);

router.post('/', crearPedido);
router.get('/', listarPedidos);


router.get('/admin/todos', verificarAdmin, listarTodosLosPedidos);
router.patch('/:id/estado', verificarAdmin, validarObjectId, actualizarEstadoPedido);

router.get('/:id', validarObjectId, obtenerPedido);

module.exports = router;
