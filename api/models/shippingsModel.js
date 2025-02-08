const db = require('../config/db');

exports.getShippings = async (orderId) => {
  const shippings = await db('shippings').where({ order_id: orderId });
  return shippings;
};
