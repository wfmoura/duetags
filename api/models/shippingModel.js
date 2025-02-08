const db = require('../config/db');

exports.getShippingMethods = async (cep, method) => {
  // Simulação de consulta ao banco de dados
  const shippingMethods = await db('shipping_methods').where({ cep, method });
  return shippingMethods;
};
