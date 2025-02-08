const db = require('../models/shippingsModel');

exports.getShippings = async (req, res) => {
  const { orderId } = req.params;

  try {
    const shippings = await db.getShippings(orderId);
    res.json(shippings);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter entregas' });
  }
};
