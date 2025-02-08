const db = require('../models/etiquetasModel');

exports.getEtiquetas = async (req, res) => {
  try {
    const etiquetas = await db.getEtiquetas();
    res.json(etiquetas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter etiquetas' });
  }
};
