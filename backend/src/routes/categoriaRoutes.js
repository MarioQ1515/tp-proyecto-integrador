const { Router } = require('express');
const { listarCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } = require('../controllers/categoriaController');
const { verificarToken, verificarAdmin, validarObjectId } = require('../middleware/auth');

const router = Router();

router.get('/', listarCategorias);
router.post('/', verificarToken, verificarAdmin, crearCategoria);
router.put('/:id', verificarToken, verificarAdmin, validarObjectId, actualizarCategoria);
router.delete('/:id', verificarToken, verificarAdmin, validarObjectId, eliminarCategoria);

module.exports = router;
