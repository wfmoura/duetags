const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Adicionar cookie-parser
const shippingRoutes = require('./routes/shipping');
const couponsRoutes = require('./routes/coupons');
const fidelityRoutes = require('./routes/fidelity');
const reviewsRoutes = require('./routes/reviews');
const recommendationsRoutes = require('./routes/recommendations');
const paymentRoutes = require('./routes/payment');

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Permitir credenciais
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(cookieParser()); // Usar cookie-parser
app.use(express.json());

app.use('/api/shipping', shippingRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/fidelity', fidelityRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});