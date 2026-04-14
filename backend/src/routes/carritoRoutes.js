const { Router } = require('express');
const { obtenerCarrito, agregarItem, actualizarItem, eliminarItem, vaciarCarrito } = require('../controllers/carritoController');
const { verificarToken, validarObjectId } = require('../middleware/auth');

const router = Router();

router.use(verificarToken);

router.get('/', obtenerCarrito);
router.delete('/', vaciarCarrito);
router.post('/items', agregarItem);
router.put('/items/:itemId', validarObjectId, actualizarItem);
router.delete('/items/:itemId', validarObjectId, eliminarItem);

module.exports = router;
