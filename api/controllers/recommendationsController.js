const db = require('../models/recommendationsModel');

exports.getRecommendations = async (req, res) => {
  const userId = req.user.id;

  try {
    const recommendations = await db.getRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter recomendações' });
  }
};
