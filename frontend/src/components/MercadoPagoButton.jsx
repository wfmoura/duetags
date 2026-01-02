import { useState } from "react";

const MercadoPagoButton = () => {
  const [loading, setLoading] = useState(false);

  const checkout = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://payments.example.com/create_preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Book",
          quantity: 1,
        }),
      });

      if (!response.ok) throw new Error("Erro ao criar preferência de pagamento.");

      const data = await response.json();
      window.location.href = data.init_point; // Redireciona para o checkout do Mercado Pago
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      alert("Ocorreu um erro ao processar o pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={checkout}
      disabled={loading}
      className={`px-6 py-3 font-semibold text-white rounded-lg transition-all duration-300 ${
        loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {loading ? "Processando..." : "Pagar com Mercado Pago"}
    </button>
  );
};

export default MercadoPagoButton;
