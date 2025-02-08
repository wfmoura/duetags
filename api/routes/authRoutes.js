const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de registro de usuário
router.post('/register', authController.register);

// Rota de login
router.post('/login', authController.login);


router.get('/api/auth/check', authController.checkAuth);

router.post('/logout', authController.logout);

// Rota de recuperação de senha
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;