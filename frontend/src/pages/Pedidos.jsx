import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import { useProduct } from '../contexts/ProductContext';
import supabase from '../utils/supabaseClient';
import PrintLayout from '../components/admin/PrintLayout';
import io from 'socket.io-client';

const Pedidos = () => {
  const { user } = useAuth();
  const { etiquetas, kits } = useProduct();
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const pedidosPorPagina = 10;
  const [filtroStatus, setFiltroStatus] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      reconnectionAttempts: 3,
      timeout: 5000,
      autoConnect: false
    });

    newSocket.connect();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setSocketConnected(true);
      console.log('Connected to WebSocket server');
    });

    newSocket.on('connect_error', (error) => {
      console.debug('Socket.io not available, using Supabase for data');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const buscarPedidos = async () => {
      if (!user?.id) {
        setCarregando(false);
        return;
      }

      setIsAdmin(user.role === 'admin');

      try {
        let query = supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        // Se não for admin, filtra apenas os pedidos do próprio usuário
        if (user.role !== 'admin') {
          query = query.eq('user_id', user.id);
        }

        const { data, error: supabaseError } = await query;

        if (supabaseError) throw supabaseError;
        setPedidos(data || []);
      } catch (error) {
        console.error('Erro ao buscar pedidos no Supabase:', error);
        setError('Erro ao carregar pedidos.');
      } finally {
        setCarregando(false);
      }
    };

    buscarPedidos();
  }, [user]);

  const handleMudarPagina = (evento, novaPagina) => {
    setPaginaAtual(novaPagina);
  };

  const handleFiltroStatusChange = (evento) => {
    setFiltroStatus(evento.target.value);
  };

  const handleUpdateStatus = async (pedidoId, novoStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: novoStatus })
        .eq('id', pedidoId);

      if (error) throw error;

      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status: novoStatus } : p));
      enqueueSnackbar('Status atualizado com sucesso!', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      enqueueSnackbar('Erro ao atualizar status.', { variant: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'producao': return 'warning';
      case 'sent': return 'info';
      case 'draft': return 'default';
      default: return 'primary';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'producao': return 'Em Produção';
      case 'completed': return 'Concluído';
      case 'sent': return 'Enviado';
      case 'draft': return 'Rascunho';
      default: return status;
    }
  };

  const indiceInicial = (paginaAtual - 1) * pedidosPorPagina;
  const indiceFinal = indiceInicial + pedidosPorPagina;
  const pedidosFiltrados = pedidos
    .filter(pedido => filtroStatus === '' || pedido.status === filtroStatus)
    .slice(indiceInicial, indiceFinal);

  if (carregando) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: '1000px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        {isAdmin ? 'Painel Administrativo - Pedidos' : 'Meus Pedidos'}
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
          <InputLabel id="filtro-status-label">Filtrar por Status</InputLabel>
          <Select
            labelId="filtro-status-label"
            value={filtroStatus}
            label="Filtrar por Status"
            onChange={handleFiltroStatusChange}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pending">Pendente</MenuItem>
            <MenuItem value="completed">Concluído</MenuItem>
            <MenuItem value="producao">Em produção</MenuItem>
            <MenuItem value="sent">Enviado</MenuItem>
            <MenuItem value="draft">Rascunhos</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {pedidosFiltrados.length > 0 ? (
        <Grid container spacing={3}>
          {pedidosFiltrados.map(pedido => (
            <Grid item xs={12} key={pedido.id}>
              <Card elevation={2} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={2} gap={2}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Pedido #{pedido.id.slice(0, 8)}...</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(pedido.created_at).toLocaleDateString()} às {new Date(pedido.created_at).toLocaleTimeString()}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
                      {isAdmin && (
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={pedido.status}
                            onChange={(e) => handleUpdateStatus(pedido.id, e.target.value)}
                            sx={{ height: 32, borderRadius: 2 }}
                          >
                            <MenuItem value="pending">Pendente</MenuItem>
                            <MenuItem value="producao">Produção</MenuItem>
                            <MenuItem value="completed">Concluído</MenuItem>
                            <MenuItem value="sent">Enviado</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                      <Chip
                        label={getStatusLabel(pedido.status)}
                        color={getStatusColor(pedido.status)}
                        variant="filled"
                        size="small"
                        sx={{ height: 32, fontWeight: 'bold' }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} mb={3}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1"><strong>{pedido.kit_nome}</strong></Typography>
                      <Typography variant="body2">{pedido.tema_nome}</Typography>
                      <Typography variant="h6" color="primary" sx={{ mt: 1 }}>R$ {pedido.total_amount?.toFixed(2).replace('.', ',')}</Typography>
                    </Box>

                    {/* Preview Images */}
                    <Box display="flex" gap={1} overflow="auto" sx={{ width: '100%', maxWidth: { xs: '100%', md: '400px' }, pb: 1 }}>
                      {pedido.etiquetas_urls?.slice(0, 3).map((url, i) => (
                        <CardMedia
                          key={i}
                          component="img"
                          image={url}
                          sx={{ width: 80, height: 60, borderRadius: 1, objectFit: 'contain', border: '1px solid #eee', flexShrink: 0 }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1} mt={3}>
                    {isAdmin && (
                      <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={() => window.location.href = `/customize?edit=${pedido.id}`}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 'bold' }}
                      >
                        Editar Design
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => setSelectedOrderForPrint(pedido)}
                      sx={{ borderRadius: '8px', textTransform: 'none' }}
                    >
                      {isAdmin ? 'Gerar Impressão' : 'Visualizar Pedido'}
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      href={`mailto:${pedido.customer_email}`}
                      sx={{ borderRadius: '8px', textTransform: 'none' }}
                    >
                      Contato
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" py={10}>
          <Typography color="textSecondary">Nenhum pedido encontrado.</Typography>
        </Box>
      )}

      {pedidos.length > pedidosPorPagina && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={Math.ceil(pedidos.length / pedidosPorPagina)}
            page={paginaAtual}
            onChange={handleMudarPagina}
            color="primary"
          />
        </Box>
      )}

      {/* Print Layout Modal Overlay */}
      {selectedOrderForPrint && (
        <PrintLayout
          order={selectedOrderForPrint}
          etiquetas={etiquetas}
          kits={kits}
          onClose={() => setSelectedOrderForPrint(null)}
        />
      )}
    </Box>
  );
};

export default Pedidos;