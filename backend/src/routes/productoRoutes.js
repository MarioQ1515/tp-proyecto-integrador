const { Router } = require('express');
const { listarProductos, obtenerProducto, crearProducto, actualizarProducto, eliminarProducto } = require('../controllers/productoController');
const { verificarToken, verificarAdmin, validarObjectId } = require('../middleware/auth');

const router = Router();

router.get('/', listarProductos);
router.get('/:id', validarObjectId, obtenerProducto);
router.post('/', verificarToken, verificarAdmin, crearProducto);
router.put('/:id', verificarToken, verificarAdmin, validarObjectId, actualizarProducto);
router.delete('/:id', verificarToken, verificarAdmin, validarObjectId, eliminarProducto);

module.exports = router;
