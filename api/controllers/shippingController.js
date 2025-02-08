const db = require('../models/shippingModel');

exports.calculateShipping = async (req, res) => {
  const { cep, method } = req.body;

  try {
    // Simulação de cálculo de frete
    const shippingMethods = await db.getShippingMethods(cep, method);
    res.json(shippingMethods);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular frete' });
  }
};
