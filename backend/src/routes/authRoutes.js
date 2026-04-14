const { Router } = require('express');
const { registro, login, perfil, listarUsuarios } = require('../controllers/authController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

const router = Router();

router.post('/registro', registro);
router.post('/login', login);
router.get('/perfil', verificarToken, perfil);
router.get('/usuarios', verificarToken, verificarAdmin, listarUsuarios);

module.exports = router;
