import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Container,
  Divider,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";

function Cart() {
  const { cart, removeFromCart, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const [isProcessing, setIsProcessing] = useState(false);
  const [kitLabels, setKitLabels] = useState({});

  const safeCart = Array.isArray(cart) ? cart : [];

  // Buscando a composição dos kits no Supabase
  useEffect(() => {
    async function fetchKitLabels() {
      const kitIds = safeCart.map((item) => item.id);
      if (kitIds.length === 0) return;

      const { data, error } = await supabase
        .from("kit_etiquetas")
        .select(`
          kit_id,
          quantidade,
          etiqueta_id,
          etiquetas ( nome )
        `)
        .in("kit_id", kitIds);

      if (error) {
        console.error("Erro ao buscar composição dos kits:", error);
        return;
      }

      const composition = {};
      data.forEach((entry) => {
        if (!composition[entry.kit_id]) composition[entry.kit_id] = [];
        composition[entry.kit_id].push({
          etiqueta_id: entry.etiqueta_id,
          etiqueta_nome: entry.etiquetas?.nome,
          quantidade: entry.quantidade,
        });
      });

      setKitLabels(composition);
    }

    fetchKitLabels();
  }, [safeCart]);



  const formatPriceToBRL = (price) => {
    const numericPrice = typeof price === "number" ? price : parseFloat(price.toString().replace("R$ ", "").replace(",", "."));
    return numericPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formattedTotal = formatPriceToBRL(total);

  const handleCheckout = async () => {
    if (!user) {
      setOpenSnackbar(true);
      setSnackbarMessage("Faça login para finalizar a compra.");
      navigate("/login", { state: { from: "/Cart" } });
      return;
    }

    setIsProcessing(true);
    try {
      setSnackbarMessage("Redirecionando para o checkout...");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      navigate("/checkout");
    } catch (error) {
      setSnackbarMessage("Erro ao processar pedido.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Seu Carrinho
      </Typography>

      {safeCart.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "300px",
            textAlign: "center",
          }}
        >
          <Typography variant="h6">Seu carrinho está vazio.</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/customize")}
            sx={{ mt: 2 }}
          >
            Continuar Comprando
          </Button>
        </Box>
      ) : (
        <>
          <List>
            {safeCart.map((item, index) => (
              <ListItem key={index} divider>
                <ListItemAvatar>
                  <Avatar
                    src={item.thumbnail}
                    alt={item.nome}
                    sx={{ width: 56, height: 56 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={item.nome}
                  secondary={
                    <Box component="span">
                      {item.customizations && (
                        <Typography variant="caption" display="block" color="primary.main" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {item.customizations.nome} {item.customizations.complemento ? `- ${item.customizations.complemento}` : ''}
                        </Typography>
                      )}
                      {kitLabels[item.id] ? (
                        kitLabels[item.id].map((label, i) => (
                          <Typography
                            key={i}
                            variant="body2"
                            color="text.secondary"
                            component="span"
                            display="block"
                          >
                            {`${label.quantidade}x ${label.etiqueta_nome}`}
                          </Typography>
                        ))
                      ) : (
                        <Typography variant="body2" component="span" display="block">
                          Carregando etiquetas...
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <Typography variant="subtitle1">
                  {formatPriceToBRL(item.preco)}
                </Typography>
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => removeFromCart(item.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6">{formattedTotal}</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCheckout}
              disabled={isProcessing || safeCart.length === 0}
              fullWidth
            >
              {isProcessing ? (
                <CircularProgress size={24} />
              ) : (
                "Finalizar Compra"
              )}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/customize")}
              fullWidth
            >
              Continuar Comprando
            </Button>
            <Button
              variant="text"
              color="error"
              onClick={() => clearCart()}
              fullWidth
            >
              Esvaziar Carrinho
            </Button>
          </Box>
        </>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
      </Snackbar>
    </Container>
  );
}

export default Cart;