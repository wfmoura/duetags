const express = require('express');
const router = express.Router();
const couponsController = require('../controllers/couponsController');

// Rota para validar cupom
router.post('/validate', couponsController.validateCoupon);

module.exports = router;
