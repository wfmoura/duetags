const db = require('../models/reviewsModel');

exports.addReview = async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user.id;

  try {
    const review = await db.addReview(userId, productId, rating, comment);
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar avaliação' });
  }
};
