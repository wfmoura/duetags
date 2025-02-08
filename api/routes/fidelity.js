const express = require('express');
const router = express.Router();
const fidelityController = require('../controllers/fidelityController');

// Rota para obter pontos de fidelidade
router.get('/points', fidelityController.getUserPoints);

module.exports = router;
