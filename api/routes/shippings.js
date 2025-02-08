const express = require('express');
const router = express.Router();
const shippingsController = require('../controllers/shippingsController');

// Rota para obter entregas de um pedido
router.get('/:orderId', shippingsController.getShippings);

module.exports = router;
