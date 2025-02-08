const db = require('../models/couponsModel');

exports.validateCoupon = async (req, res) => {
  const { code } = req.body;

  try {
    const coupon = await db.validateCoupon(code);
    if (!coupon) {
      return res.status(400).json({ error: 'Cupom inválido' });
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao validar cupom' });
  }
};
