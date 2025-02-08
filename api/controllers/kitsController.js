const db = require('../models/kitsModel');

exports.getKits = async (req, res) => {
  try {
    const kits = await db.getKits();
    res.json(kits);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter kits' });
  }
};
