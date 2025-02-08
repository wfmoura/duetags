const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');

// Rota para adicionar avaliação
router.post('/', reviewsController.addReview);

module.exports = router;
