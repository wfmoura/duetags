const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Rota para processar pagamento
router.post('/process', paymentController.processPayment);

module.exports = router;
