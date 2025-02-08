const express = require('express');
const router = express.Router();
const orderItemsController = require('../controllers/orderItemsController');

// Rota para obter itens de um pedido
router.get('/:orderId', orderItemsController.getOrderItems);

module.exports = router;
