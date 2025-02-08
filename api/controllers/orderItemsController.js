const db = require('../models/orderItemsModel');

exports.getOrderItems = async (req, res) => {
  const { orderId } = req.params;

  try {
    const items = await db.getOrderItems(orderId);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter itens do pedido' });
  }
};
