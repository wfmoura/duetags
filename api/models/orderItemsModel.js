const db = require('../config/db');

exports.getOrderItems = async (orderId) => {
  const items = await db('order_items').where({ order_id: orderId });
  return items;
};
