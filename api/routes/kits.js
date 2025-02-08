const express = require('express');
const router = express.Router();
const kitsController = require('../controllers/kitsController');

// Rota para obter kits
router.get('/', kitsController.getKits);

module.exports = router;
