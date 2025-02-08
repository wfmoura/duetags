const express = require('express');
const router = express.Router();
const etiquetasController = require('../controllers/etiquetasController');

// Rota para obter etiquetas
router.get('/', etiquetasController.getEtiquetas);

module.exports = router;
