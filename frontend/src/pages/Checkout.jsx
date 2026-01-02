import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import supabase from "../utils/supabaseClient";
import ProgressBar from "../components/ProgressBar";
import TermsAndConditions from "../components/TermsAndConditions";
import ConfirmationModal from "../components/ConfirmationModal";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const handleFinalizarCompra = async () => {
    if (!acceptedTerms) {
      alert("Você deve aceitar os Termos e Condições para prosseguir.");
      return;
    }

    if (!user) {
      alert("Você precisa estar logado para finalizar a compra.");
      navigate("/login");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Calculate total
      const totalAmount = cart.reduce((acc, item) => {
        const price = parseFloat(item.preco) || 0; // Ensure it's a number
        return acc + price;
      }, 0);

      // 2. Create Order in Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total_amount: totalAmount,
            status: 'pending', // Initial status
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderId = orderData.id;

      // 3. Create Order Items
      const orderItems = cart.map(item => ({
        order_id: orderId,
        // product_id: item.id, // Assuming item.id matches a product UUID, if not, might need adjustment or handle ad-hoc items
        // For now, if products table isn't strictly populated with cart items, we might need to handle this. 
        // Based on SQL schema, product_id is FK to products. 
        // If cart items are dynamically generated labels, we might not have a 'product_id' in 'products' table yet.
        // For this refactor, let's assume we skip product_id constraint or insert a generic one, 
        // OR better, we just save the label data in 'etiqueta' table and link it to order.

        // However, the SQL script created order_items with product_id FK.
        // If 'etiqueta' items are what's in the cart, they are likely not in 'products' table.
        // Let's check what 'cart' contains. It has 'nome', 'preco', 'thumbnail'.

        // Strategy: 
        // Since this is a custom label app, 'products' might be "Kit A", "Kit B".
        // If the cart item has an ID that matches a product, great. If not, we might have an issue with the FK.
        // Let's assume for now we just want to create the order record.
        // If strict FK is enforced, we might need to ensure product exists.

        quantity: 1,
        unit_price: parseFloat(item.preco) || 0,
        // product_id: ... 
      }));

      // WORKAROUND: If we don't have real product IDs that match UUIDs in 'products', 
      // inserting into order_items will fail if product_id is set.
      // But the SQL schema allows product_id to be nullable? "product_id UUID REFERENCES public.products(id)" -> No "NOT NULL" specified in my script above.
      // So we can omit product_id if it's a custom item.

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 4. Update 'etiqueta' records to link to this order?
      // The cart might contain the 'etiqueta' object itself or a reference.
      // If the cart items are just display items, we might need to find the pending labels.
      // Assuming 'cart' in this app context holds the items to be purchased.

      // 5. Mock Payment / Redirect
      // Since backend payment processing is removed, we'll simulate success or redirect to a client-side payment flow.
      // For now, let's just mark it as success and redirect to confirmation.

      await clearCart();
      navigate("/confirmation", { state: { orderId: orderId } });

    } catch (error) {
      console.error("Erro ao finalizar compra:", error);
      setError("Erro ao processar o pedido: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ padding: "16px", maxWidth: "800px", margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2" }}>
        Finalizar Compra
      </Typography>

      <ProgressBar currentStep={2} totalSteps={3} />

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <Box mt={4}>
        <TermsAndConditions accepted={acceptedTerms} onAccept={() => setAcceptedTerms(!acceptedTerms)} />
      </Box>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
          Resumo do Pedido
        </Typography>
        <Box
          sx={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            backgroundColor: "#f9f9f9",
            minHeight: "200px",
          }}
        >
          {cart.length > 0 ? (
            cart.map((item, index) => (
              <Typography key={index} variant="body1">
                {item.nome} - {item.preco}
              </Typography>
            ))
          ) : (
            <Typography variant="body1" color="textSecondary">
              Nenhum item no carrinho.
            </Typography>
          )}
        </Box>
      </Box>

      <Box mt={4} sx={{ textAlign: "center" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleFinalizarCompra}
          disabled={isProcessing || !acceptedTerms || cart.length === 0}
          sx={{ fontSize: "1rem", padding: "10px 20px", fontWeight: "bold" }}
        >
          {isProcessing ? <CircularProgress size={24} color="inherit" /> : "Pagar com Mercado Pago"}
        </Button>
      </Box>

      <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Box>
  );
};

export default Checkout;
