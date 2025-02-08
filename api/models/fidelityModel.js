const db = require('../config/db');

exports.getUserPoints = async (userId) => {
  const points = await db('fidelity_points').where({ user_id: userId }).first();
  return points;
};
