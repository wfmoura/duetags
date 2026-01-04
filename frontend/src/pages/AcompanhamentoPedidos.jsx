import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  Chip,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../contexts/AuthContext';
import { useProduct } from '../contexts/ProductContext';
import { useSnackbar } from 'notistack';
import supabase from '../utils/supabaseClient';

const AcompanhamentoPedidos = () => {
  const { user } = useAuth();
  const { kits, etiquetas } = useProduct();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const [openModal, setOpenModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [etiquetasVisuais, setEtiquetasVisuais] = useState([]);

  const handleOpenModal = (pedido) => {
    setSelectedPedido(pedido);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPedido(null);
    setEtiquetasVisuais([]);
  };

  useEffect(() => {
    const gerarUrlsAssinadas = async () => {
      if (!selectedPedido?.etiquetas_urls) {
        setEtiquetasVisuais([]);
        return;
      }

      const urls = await Promise.all(selectedPedido.etiquetas_urls.map(async (urlOrPath) => {
        try {
          // Se for uma URL completa do Supabase ou apenas o path relativo
          let filePath = urlOrPath;
          const isFullUrl = urlOrPath.includes('supabase.co');

          if (isFullUrl) {
            const parts = urlOrPath.split('/etiquetas/');
            if (parts.length > 1) {
              filePath = parts[1];
            } else {
              return urlOrPath; // Não conseguiu extrair, retorna original
            }
          }

          const { data, error } = await supabase.storage
            .from('etiquetas')
            .createSignedUrl(filePath, 3600);

          if (data && !error) {
            return data.signedUrl;
          }
        } catch (err) {
          console.warn("Erro ao gerar URL assinada para:", urlOrPath, err);
        }

        // Se falhou e for path relativo, tenta gerar uma URL de fallback (mesmo que quebre, o onError trata)
        if (!urlOrPath.includes('http')) {
          return `${supabase.storage.from('etiquetas').getPublicUrl(urlOrPath).data.publicUrl}`;
        }
        return urlOrPath;
      }));

      setEtiquetasVisuais(urls);
    };

    if (openModal && selectedPedido) {
      gerarUrlsAssinadas();
    }
  }, [openModal, selectedPedido]);

  useEffect(() => {
    const buscarPedidos = async () => {
      if (!user || !user.id) {
        setCarregando(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setPedidos(data || []);
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        enqueueSnackbar('Erro ao buscar pedidos. Por favor, tente novamente.', { variant: 'error' });
      } finally {
        setCarregando(false);
      }
    };

    buscarPedidos();
  }, [user, enqueueSnackbar]);

  if (carregando) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h6" align="center">Faça login para visualizar seus pedidos.</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{ fontWeight: 'bold', color: '#333' }}>
        Meus Pedidos
      </Typography>

      {pedidos.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            Você ainda não possui pedidos.
          </Typography>
          <Button variant="contained" color="primary" href="/kits" sx={{ mt: 2 }}>
            Ver Catálogo de Kits
          </Button>
        </Paper>
      ) : (
        <Box>
          {isMobile ? (
            <Stack spacing={2}>
              {pedidos.map((pedido) => (
                <Card key={pedido.id} elevation={2} sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">ID do Pedido</Typography>
                        <Typography variant="body1" fontWeight="bold">#{pedido.id.slice(0, 8)}</Typography>
                      </Box>
                      <Chip
                        label={
                          pedido.status === 'pending' ? 'Pendente' :
                            pedido.status === 'payment_confirmed' ? 'Pagamento Confirmado' :
                              pedido.status === 'in_production' ? 'Em Produção' :
                                pedido.status === 'awaiting_pickup' ? 'Aguardando Retirada' :
                                  pedido.status === 'shipped' ? 'Enviado' :
                                    pedido.status === 'delivered' ? 'Entregue' :
                                      pedido.status
                        }
                        color={
                          ['payment_confirmed', 'delivered'].includes(pedido.status) ? 'success' :
                            ['pending', 'in_production'].includes(pedido.status) ? 'warning' :
                              'info'
                        }
                        size="small"
                      />
                    </Box>

                    <Grid container spacing={2} mb={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="textSecondary">Data</Typography>
                        <Typography variant="body2">{new Date(pedido.created_at).toLocaleDateString()}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="textSecondary">Valor Total</Typography>
                        <Typography variant="body2">
                          {pedido.kit_preco ? `R$ ${pedido.kit_preco.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="textSecondary">Kit</Typography>
                        <Typography variant="body2">{pedido.kit_nome || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="textSecondary">Tema</Typography>
                        <Typography variant="body2">{pedido.tema_nome || '-'}</Typography>
                      </Grid>
                    </Grid>

                    <Box mt={2}>
                      {pedido.etiquetas_urls && pedido.etiquetas_urls.length > 0 ? (
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={() => handleOpenModal(pedido)}
                          sx={{ fontWeight: 'bold', borderRadius: 2 }}
                        >
                          Ver Etiquetas
                        </Button>
                      ) : (
                        <Typography variant="caption" color="textSecondary" align="center" display="block">
                          Processando etiquetas...
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <TableContainer component={Paper} elevation={2}>
              <Table>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><strong>ID do Pedido</strong></TableCell>
                    <TableCell><strong>Data</strong></TableCell>
                    <TableCell><strong>Kit</strong></TableCell>
                    <TableCell><strong>Tema</strong></TableCell>
                    <TableCell><strong>Valor Total</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Etiquetas</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pedidos.map((pedido) => (
                    <TableRow key={pedido.id} hover>
                      <TableCell>#{pedido.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        {new Date(pedido.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{pedido.kit_nome || '-'}</TableCell>
                      <TableCell>{pedido.tema_nome || '-'}</TableCell>
                      <TableCell>
                        {pedido.kit_preco ? `R$ ${pedido.kit_preco.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            pedido.status === 'pending' ? 'Pendente' :
                              pedido.status === 'payment_confirmed' ? 'Pagamento Confirmado' :
                                pedido.status === 'in_production' ? 'Em Produção' :
                                  pedido.status === 'awaiting_pickup' ? 'Aguardando Retirada' :
                                    pedido.status === 'shipped' ? 'Enviado' :
                                      pedido.status === 'delivered' ? 'Entregue' :
                                        pedido.status
                          }
                          color={
                            ['payment_confirmed', 'delivered'].includes(pedido.status) ? 'success' :
                              ['pending', 'in_production'].includes(pedido.status) ? 'warning' :
                                'info'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {pedido.etiquetas_urls && pedido.etiquetas_urls.length > 0 ? (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleOpenModal(pedido)}
                            sx={{ fontWeight: 'bold' }}
                          >
                            Ver Etiquetas
                          </Button>
                        ) : (
                          <Typography variant="caption" color="textSecondary">Processando...</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Etiquetas do Pedido #{selectedPedido?.id.slice(0, 8)}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {etiquetasVisuais.length > 0 ? (
              etiquetasVisuais.map((url, index) => (
                <Grid item xs={12} sm={6} md={6} lg={4} key={index} display="flex" justifyContent="center">
                  <Paper
                    elevation={3}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#fff'
                    }}
                  >
                    <Box
                      component="img"
                      src={url}
                      alt={`Etiqueta ${index + 1}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22200%22%20height%3D%22150%22%20fill%3D%22%23eeeeee%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%23999999%22%3EImagem%20Indispon%C3%ADvel%3C%2Ftext%3E%3C%2Fsvg%3E";
                        e.target.style.objectFit = "contain";
                      }}
                      sx={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: 1,
                        display: 'block'
                      }}
                    />
                  </Paper>
                </Grid>
              ))
            ) : (
              <Box display="flex" justifyContent="center" width="100%" p={3}>
                <CircularProgress />
              </Box>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} variant="contained" color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AcompanhamentoPedidos;
