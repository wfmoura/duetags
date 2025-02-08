const express = require("express");
const router = express.Router();
const { authenticateToken, isAdmin } = require("../middlewares/authMiddleware"); 
const supabase = require('../config/supabase'); 


// Helper function to format order data for the response
const formatOrderData = (order) => ({
  id: order.id,
  userId: order.user_id,
  kitId: order.kit_id,
  status: order.status,
  createdAt: order.created_at,
  //... any other fields you want to include
});

// GET / - Fetch all orders (admin only)
router.get("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { data: orders, error } = await supabase.from('orders').select('*');
    if (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
    const formattedOrders = orders.map(formatOrderData);
    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /:pedidoId - Fetch a specific order by ID (admin only)
router.get("/:pedidoId", authenticateToken, isAdmin, async (req, res) => {
  const { pedidoId } = req.params;
  try {
    const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', pedidoId)
    .single();

    if (error) {
      console.error('Error fetching order:', error);
      return res.status(500).json({ error: 'Failed to fetch order' });
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const formattedOrder = formatOrderData(order);
    res.json(formattedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// GET /:pedidoId/etiquetas/:etiquetaId - Download a specific etiqueta (admin only)
router.get("/:pedidoId/etiquetas/:etiquetaId", authenticateToken, isAdmin, async (req, res) => {
  const { pedidoId, etiquetaId } = req.params;
  try {
    const { data: etiqueta, error } = await supabase
    .from('order_labels') 
    .select('label_url') // Now fetching the Base64 string
    .eq('order_id', pedidoId)
    .eq('id', etiquetaId) 
    .single();

    if (error) {
      console.error('Error fetching etiqueta:', error);
      return res.status(500).json({ error: 'Failed to fetch etiqueta' });
    }

    if (!etiqueta) {
      return res.status(404).json({ error: 'Etiqueta not found' });
    }

    // Sending the Base64 string directly
    res.set('Content-Type', 'image/png'); // Set the appropriate content type
    res.send(Buffer.from(etiqueta.label_url, 'base64')); 

  } catch (error) {
    console.error('Error downloading etiqueta:', error);
    res.status(500).json({ error: 'Failed to download etiqueta' });
  }
});

module.exports = router;