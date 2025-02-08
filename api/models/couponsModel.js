const db = require('../config/db');

exports.validateCoupon = async (code) => {
  const coupon = await db('coupons').where({ code }).first();
  return coupon;
};
