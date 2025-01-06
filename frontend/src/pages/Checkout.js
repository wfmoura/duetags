import React, { useState } from 'react'; // Adicione o useState aqui
import { Box, Typography, Button, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { config } from '../config/config'; // Importando o arquivo de configuração

function Checkout() {
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(true); // Exibe o Snackbar ao carregar a página

  const handleComprarNovoKit = () => {
    navigate('/');
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Finalização da Compra</Typography>
      <Typography variant="body1">{config.mensagens.sucessoCompra}</Typography>
      <Box mt={4}>
        <Button variant="contained" color="primary" onClick={handleComprarNovoKit}>
          Comprar Novo Kit
        </Button>
      </Box>

      {/* Snackbar para exibir mensagem de sucesso */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          {config.mensagens.sucessoCompra}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Checkout;