const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');

// Rota para calcular frete
router.post('/calculate', shippingController.calculateShipping);

module.exports = router;
