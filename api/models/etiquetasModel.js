const db = require('../config/db');

exports.getEtiquetas = async () => {
  const etiquetas = await db('etiquetas').select('*');
  return etiquetas;
};
