const db = require('../config/db');

exports.processPayment = async (paymentData, cart) => {
  // Simulação de processamento de pagamento
  const paymentResult = await db('payments').insert({
    payment_data: paymentData,
    cart: JSON.stringify(cart),
  }).returning('*');
  return paymentResult[0];
};
