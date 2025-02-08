const express = require('express');
const router = express.Router();
const recommendationsController = require('../controllers/recommendationsController');

// Rota para obter recomendações
router.get('/', recommendationsController.getRecommendations);

module.exports = router;
