const db = require('../config/db');

exports.addReview = async (userId, productId, rating, comment) => {
  const review = await db('reviews').insert({
    user_id: userId,
    product_id: productId,
    rating,
    comment,
  }).returning('*');
  return review[0];
};
