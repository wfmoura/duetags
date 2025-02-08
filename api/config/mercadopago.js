const MercadoPago = require("mercadopago");
require("dotenv").config();

// 🔹 Criando uma instância correta do Mercado Pago


// SDK do Mercado Pago
import { MercadoPagoConfig } from 'mercadopago';
// Adicione as credenciais
const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});



module.exports = mercadoPagoClient;
