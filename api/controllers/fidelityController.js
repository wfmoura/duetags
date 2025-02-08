const db = require('../models/fidelityModel');

exports.getUserPoints = async (req, res) => {
  const userId = req.user.id;

  try {
    const points = await db.getUserPoints(userId);
    res.json(points);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter pontos' });
  }
};
