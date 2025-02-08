const db = require('../config/db');

exports.getRecommendations = async (userId) => {
  const recommendations = await db('product_recommendations')
    .where({ user_id: userId })
    .orderBy('score', 'desc');
  return recommendations;
};
