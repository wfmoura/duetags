import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid } from '@mui/material';

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    fetch('/api/getPedidos')
      .then((response) => response.json())
      .then((data) => setPedidos(data))
      .catch((error) => console.error('Erro ao carregar pedidos:', error));
  }, []);

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>Pedidos</Typography>
      <Grid container spacing={2}>
        {pedidos.map((pedido, index) => (
          <Grid item key={index} xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6">Pedido {index + 1}</Typography>
                <Typography>Kit: {pedido.kit}</Typography>
                <Typography>Tema: {pedido.tema}</Typography>
                <Typography>Nome: {pedido.nome}</Typography>
                <Typography>Complemento: {pedido.complemento}</Typography>
                <Typography>Turma: {pedido.turma}</Typography>
                <Typography>Fonte: {pedido.fontFamily}</Typography>
                <Typography>Cor da Fonte: {pedido.textColor}</Typography>
                <Typography>Cor do Fundo: {pedido.corFundo}</Typography>
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    href={`/api/downloadPedido/${pedido.id}`}
                  >
                    Baixar Tudo
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Pedidos;