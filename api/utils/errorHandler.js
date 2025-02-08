// utils/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Erro interno no servidor' });
  };
  
  module.exports = errorHandler;