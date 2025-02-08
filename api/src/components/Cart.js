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
import { AppContext } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";

function Cart() {
  const context = useContext(AppContext);
  const { cart, setCart, removeFromCart, user } = context || {};
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const [isProcessing, setIsProcessing] = useState(false);
  const [kitLabels, setKitLabels] = useState({});

  // Garantir que setCart seja uma função antes de usá-lo
  useEffect(() => {
    if (!setCart || typeof setCart !== "function") {
      console.error("[ERRO] setCart não está disponível no contexto.");
    }
  }, [setCart]);

  const safeCart = Array.isArray(cart) ? cart : [];

  // Recuperar carrinho do localStorage ao carregar a página
  useEffect(() => {
    if (setCart && typeof setCart === "function") {
      try {
        const savedCart = JSON.parse(localStorage.getItem("cart"));
        if (savedCart && Array.isArray(savedCart)) {
          setCart(savedCart);
        }
      } catch (error) {
        console.error("Erro ao ler o carrinho do localStorage:", error);
      }
    }
  }, [setCart]);

  // Salvar o carrinho no localStorage sempre que ele for atualizado
  useEffect(() => {
    if (cart && Array.isArray(cart)) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

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

  // Formatação de preço para R$ BRL
  const formatPriceToBRL = (price) => {
    let numericPrice;
    if (typeof price === "string") {
      numericPrice = parseFloat(price.replace("R$ ", "").replace(",", "."));
    } else {
      numericPrice = price;
    }

    if (isNaN(numericPrice)) {
      console.log("[ERRO] Preço inválido:", price);
      return "R$ 0,00";
    }

    return Number(numericPrice).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Calcula o total do carrinho
  const calculateTotal = () => {
    return safeCart.reduce((total, item) => {
      const price =
        typeof item?.preco === "string"
          ? parseFloat(item.preco.replace("R$ ", "").replace(",", "."))
          : item?.preco;
      return isNaN(price) ? total : total + price;
    }, 0);
  };

  const total = calculateTotal();
  const formattedTotal = formatPriceToBRL(total);

  // Finalizar a compra e limpar o carrinho
  const handleCheckout = async () => {
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(cart));
      setOpenSnackbar(true);
      navigate("/login", { state: { from: "/Cart" } });
      return;
    }

    setIsProcessing(true);
    try {
      setSnackbarMessage("Pedido finalizado com sucesso!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);

      if (setCart && typeof setCart === "function") {
        setCart([]);
        localStorage.removeItem("cart");
      }

      navigate("/checkout");
    } catch (error) {
      setSnackbarMessage("Erro ao processar pedido.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Continuar comprando (voltar para personalização)
  const handleContinueShopping = () => {
    navigate("/customize");
  };

  // Limpa o carrinho manualmente
  const limparCarrinho = () => {
    if (setCart && typeof setCart === "function") {
      setCart([]);
      localStorage.removeItem("cart");
    }
  };

  // Fechar alerta
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

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
            onClick={handleContinueShopping}
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
                    kitLabels[item.id] ? (
                      kitLabels[item.id].map((label, i) => (
                        <Typography
                          key={i}
                          variant="body2"
                          color="text.secondary"
                        >
                          {`${label.quantidade}x ${label.etiqueta_nome}`}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body2">
                        Carregando etiquetas...
                      </Typography>
                    )
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
              onClick={handleContinueShopping}
              fullWidth
            >
              Continuar Comprando
            </Button>
            <Button
              variant="text"
              color="error"
              onClick={limparCarrinho}
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