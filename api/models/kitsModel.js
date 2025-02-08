const db = require('../config/db');

exports.getKits = async () => {
  const kits = await db('kits').select('*');
  return kits;
};
