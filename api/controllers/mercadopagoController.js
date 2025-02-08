const mercadoPagoClient = require("../config/mercadopago");
const { Preference } = require("mercadopago");

const createPayment = async (req, res) => {
  try {
    console.log("[DEBUG] Requisição Recebida:", req.body);

    const { items, payer_email } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Nenhum item informado para pagamento." });
    }

    const preference = new Preference(mercadoPagoClient);
    const preferenceData = await preference.create({
      body: {
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
      },
    });

    res.json({ paymentUrl: preferenceData.sandbox_init_point });
  } catch (error) {
    console.error("[ERRO] Erro ao criar pagamento:", error.response ? error.response.data : error);
    res.status(500).json({ error: "Erro ao processar pagamento.", details: error.response ? error.response.data : error.message });
  }
};

module.exports = { createPayment };
