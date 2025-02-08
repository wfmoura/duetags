import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent, Grid, Container, Divider, IconButton, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { AppContext } from '../contexts/AppContext';
import Chatbot from '../components/Chatbot';

function Cart() {
  const { cart, removeFromCart, user } = useContext(AppContext);
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Função para calcular o total do carrinho
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      // Verifica se o preço está definido e é uma string
      if (item.preco && typeof item.preco === 'string') {
        // Remove o "R$ " e substitui a vírgula por ponto
        const price = parseFloat(item.preco.replace('R$ ', '').replace(',', '.'));
        return total + (isNaN(price) ? 0 : price); // Adiciona ao total se o preço for válido
      }
      return total; // Ignora itens com preço inválido
    }, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); // Formata o total como moeda
  };

  const handleCheckout = () => {
    if (!user) {
      setOpenSnackbar(true); // Mostra o Snackbar se o usuário não estiver logado
      navigate('/login', { state: { from: '/checkout' } }); // Redireciona para o login com o estado de retorno
    } else {
      navigate('/checkout'); // Redireciona para o checkout se o usuário estiver logado
    }
  };

  const handleContinueShopping = () => {
    navigate('/'); // Redireciona para a página inicial para escolher outro kit
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false); // Fecha o Snackbar
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Carrinho de Compras
        </Typography>

        {cart.length === 0 ? (
          <Box textAlign="center" mt={4}>
            <Typography variant="h6" color="textSecondary">
              Seu carrinho está vazio.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleContinueShopping}
              sx={{ mt: 2 }}
            >
              Escolher outro kit
            </Button>
          </Box>
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              {cart.map((item, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <img
                          src={item.thumbnail}
                          alt={item.nome}
                          style={{ width: '100%', borderRadius: '8px' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <Typography variant="h6">{item.nome}</Typography>
                        <Typography variant="body1" color="textSecondary">
                          Preço: {item.preco}
                        </Typography>
                        <Box mt={2}>
                          <IconButton
                            color="error"
                            onClick={() => removeFromCart(item.id)} // Remove pelo ID
                            aria-label="remover"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resumo do Pedido
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  {cart.map((item, index) => (
                    <Box key={index} mb={2}>
                      <Typography variant="body1">
                        {item.nome} - {item.preco}
                      </Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Total: {calculateTotal()}
                  </Typography>
                  <Box mt={3}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleCheckout}
                    >
                      Finalizar Compra
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      onClick={handleContinueShopping}
                      sx={{ mt: 2 }}
                    >
                      Escolher outro kit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Snackbar para avisar que o login é necessário */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="warning" sx={{ width: '100%' }}>
          Você precisa estar logado para finalizar a compra.
        </Alert>
      </Snackbar>

      {/* Chatbot em todas as páginas */}
      <Chatbot />
    </Container>
  );
}

export default Cart;