require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();
app.use(express.json());
app.use(cors());

// 🔹 Configurar Mercado Pago com sua chave de acesso
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN, // ⚠️ Substituir pelo seu Access Token
});

// 🔹 Rota para criar pagamento no Mercado Pago
app.post("/api/create-payment", async (req, res) => {
  try {
    const { items, payer_email } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Nenhum item informado para pagamento." });
    }

    // 🔹 Criando a preferência de pagamento
    const preference = {
      items: items.map((item) => ({
        title: item.title,
        unit_price: item.unit_price,
        quantity: item.quantity,
        currency_id: "BRL",
      })),
      payer: {
        email: payer_email,
      },
      back_urls: {
        success: "http://localhost:3000/success",
        failure: "http://localhost:3000/failure",
        pending: "http://localhost:3000/pending",
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);
    res.json({ paymentUrl: response.body.init_point });
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    res.status(500).json({ error: "Erro ao processar pagamento." });
  }
});

// 🔹 Inicializa o servidor na porta 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
