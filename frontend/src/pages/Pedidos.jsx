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
  Chip,
  Divider,
  TextField,
  InputAdornment,
  Menu,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar, // Added
  Stack, // Added
  Checkbox,
  FormControlLabel,
  Switch
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import { useProduct } from '../contexts/ProductContext';
import supabase from '../utils/supabaseClient';
import PrintLayout from '../components/admin/PrintLayout';
import io from 'socket.io-client';
import { downloadOrderZip } from '../services/zipService';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ContentPaste as PasteIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  WhatsApp as WhatsAppIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  FolderZip as FolderZipIcon,
  BugReport as BugReportIcon,
  Email as EmailIcon,
  Engineering as EngineeringIcon,
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon
} from '@mui/icons-material';


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
  const [isAdmin, setIsAdmin] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const pedidosPorPagina = 10;
  const [filtroStatus, setFiltroStatus] = useState('');
  const [pesquisa, setPesquisa] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [metadataOrder, setMetadataOrder] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeOrderMenu, setActiveOrderMenu] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteStorageFiles, setDeleteStorageFiles] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(null); // 'orderId-target'

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

  useEffect(() => {
    buscarPedidos();
  }, [user]);

  const indiceInicial = (paginaAtual - 1) * pedidosPorPagina;
  const indiceFinal = indiceInicial + pedidosPorPagina;

  const todosFiltrados = pedidos.filter(pedido => {
    const statusMatch = filtroStatus === '' || pedido.status === filtroStatus;
    const searchTerm = pesquisa.toLowerCase();
    const searchMatch = pesquisa === '' ||
      pedido.id.toLowerCase().includes(searchTerm) ||
      (pedido.customer_email && pedido.customer_email.toLowerCase().includes(searchTerm)) ||
      (pedido.phone && pedido.phone.toLowerCase().includes(searchTerm));
    return statusMatch && searchMatch;
  });

  const pedidosPaginaAtual = todosFiltrados.slice(indiceInicial, indiceFinal);

  const handleSelectOrder = (id) => {
    setSelectedOrders(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const pageIds = pedidosPaginaAtual.map(p => p.id);
      setSelectedOrders(prev => [...new Set([...prev, ...pageIds])]);
    } else {
      const pageIds = pedidosPaginaAtual.map(p => p.id);
      setSelectedOrders(prev => prev.filter(id => !pageIds.includes(id)));
    }
  };

  const handleDeleteOrders = async () => {
    setIsDeleting(true);
    try {
      const ordersToDelete = deleteDialogOpen && activeOrderMenu ? [activeOrderMenu.id] : selectedOrders;

      if (deleteStorageFiles) {
        // Find all assets to delete
        const { data: ordersWithAssets } = await supabase
          .from('orders')
          .select('etiquetas_urls, original_asset_url')
          .in('id', ordersToDelete);

        if (ordersWithAssets) {
          const filesToDelete = [];
          ordersWithAssets.forEach(o => {
            if (o.etiquetas_urls) {
              o.etiquetas_urls.forEach(url => {
                const path = url.split('/storage/v1/object/public/etiquetas/')[1];
                if (path) filesToDelete.push(path);
              });
            }
          });

          if (filesToDelete.length > 0) {
            await supabase.storage.from('etiquetas').remove(filesToDelete);
          }
        }
      }

      const { error } = await supabase
        .from('orders')
        .delete()
        .in('id', ordersToDelete);

      if (error) throw error;

      enqueueSnackbar(`${ordersToDelete.length} pedido(s) excluído(s) com sucesso.`, { variant: 'success' });
      setSelectedOrders([]);
      setDeleteDialogOpen(false);
      buscarPedidos();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      enqueueSnackbar('Erro ao excluir pedidos.', { variant: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMudarPagina = (evento, novaPagina) => {
    setPaginaAtual(novaPagina);
  };

  const getWhatsAppLink = (phone) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    return `https://api.whatsapp.com/send?phone=${finalPhone}`;
  };

  const handleFiltroStatusChange = (evento) => {
    setFiltroStatus(evento.target.value);
    setPaginaAtual(1);
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

  const handleResendEmail = async (orderId, target) => {
    const resendKey = `${orderId}-${target}`;
    try {
      setResendingEmail(resendKey);
      enqueueSnackbar(`Solicitando reenvio de e-mail (${target === 'client' ? 'Cliente' : 'Produção'})...`, {
        variant: 'info',
        autoHideDuration: 2000
      });

      const { data, error } = await supabase.functions.invoke('send-order-email-v2', {
        body: { orderId, target }
      });

      if (error) throw error;

      if (data?.success) {
        enqueueSnackbar(`E-mail enviado com sucesso!`, {
          variant: 'success',
          autoHideDuration: 5000
        });
      } else {
        enqueueSnackbar(`Erro no servidor: ${data?.error || 'Erro desconhecido'}`, {
          variant: 'error',
          autoHideDuration: 8000
        });
      }
    } catch (error) {
      console.error('Erro ao reenviar e-mail:', error);
      enqueueSnackbar(`Erro de conexão: ${error.message || 'Verifique sua internet ou VPN'}`, { variant: 'error' });
    } finally {
      setResendingEmail(null);
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
        {isAdmin ? 'Gestão de Pedidos' : 'Meus Pedidos'}
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Buscar por ID, Email ou Telefone..."
          fullWidth
          value={pesquisa}
          onChange={(e) => { setPesquisa(e.target.value); setPaginaAtual(1); }}
          sx={{ bgcolor: 'white', borderRadius: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 200, bgcolor: 'white', borderRadius: 2 }}>
          <InputLabel id="filtro-status-label">Status</InputLabel>
          <Select
            labelId="filtro-status-label"
            value={filtroStatus}
            label="Status"
            onChange={handleFiltroStatusChange}
          >
            <MenuItem value="">Todos os Status</MenuItem>
            <MenuItem value="pending">Pendente</MenuItem>
            <MenuItem value="producao">Em produção</MenuItem>
            <MenuItem value="completed">Concluído</MenuItem>
            <MenuItem value="sent">Enviado</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {isAdmin && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f5f5f5', p: 1, borderRadius: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={pedidosPaginaAtual.length > 0 && pedidosPaginaAtual.every(p => selectedOrders.includes(p.id))}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            }
            label="Selecionar todos da página"
          />
          {selectedOrders.length > 0 && (
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {selectedOrders.length} selecionado(s)
              </Typography>
              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => { setActiveOrderMenu(null); setDeleteDialogOpen(true); }}
              >
                Excluir Selecionados
              </Button>
            </Box>
          )}
        </Box>
      )}

      {pedidosPaginaAtual.length > 0 ? (
        <Grid container spacing={3}>
          {pedidosPaginaAtual.map(pedido => (
            <Grid item xs={12} key={pedido.id}>
              <Card elevation={2} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ mr: 1, mt: 0.5 }}>
                      <Checkbox
                        checked={selectedOrders.includes(pedido.id)}
                        onChange={() => handleSelectOrder(pedido.id)}
                      />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={0.5}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                          Pedido #{pedido.id.slice(0, 8)}
                        </Typography>
                        <Chip
                          label={getStatusLabel(pedido.status)}
                          color={getStatusColor(pedido.status)}
                          size="small"
                          sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px' }}
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {new Date(pedido.created_at).toLocaleDateString('pt-BR')} às {new Date(pedido.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {pedido.customer_name || 'Cliente sem nome'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 0.5 }}>
                        {pedido.customer_email}
                      </Typography>

                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#00695c' }}>
                          {pedido.customer_phone || pedido.phone || 'N/A'}
                        </Typography>
                        {(pedido.customer_phone || pedido.phone) && (
                          <Tooltip title="Conversar no WhatsApp">
                            <IconButton
                              size="small"
                              href={getWhatsAppLink(pedido.customer_phone || pedido.phone)}
                              target="_blank"
                              sx={{ color: '#25D366', p: 0.5 }}
                            >
                              <WhatsAppIcon sx={{ fontSize: '1.2rem' }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    {isAdmin && (
                      <Box display="flex" gap={1}>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <Select
                            value={pedido.status}
                            onChange={(e) => handleUpdateStatus(pedido.id, e.target.value)}
                            sx={{ height: 36, borderRadius: 2, bgcolor: '#f5f5f5' }}
                          >
                            <MenuItem value="pending">Pendente</MenuItem>
                            <MenuItem value="producao">Produção</MenuItem>
                            <MenuItem value="completed">Concluído</MenuItem>
                            <MenuItem value="sent">Enviado</MenuItem>
                          </Select>
                        </FormControl>
                        <IconButton onClick={(e) => { setAnchorEl(e.currentTarget); setActiveOrderMenu(pedido); }}>
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" flexDirection="column" gap={2} mt={2}>
                    <Grid container spacing={2}>
                      {/* Seção Arte Original */}
                      {pedido.original_asset_url && (
                        <Grid item xs={12} md={3}>
                          <Typography variant="caption" fontWeight="bold" color="textSecondary" sx={{ mb: 1, display: 'block', textTransform: 'uppercase' }}>
                            Arte Original (Alta)
                          </Typography>
                          <Box
                            onClick={() => setSelectedImage(pedido.original_asset_url)}
                            sx={{
                              width: '100%',
                              height: 120,
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: '2px solid #2956a4',
                              cursor: 'pointer',
                              position: 'relative',
                              '&:hover .overlay': { opacity: 1 }
                            }}
                          >
                            <img
                              src={pedido.original_asset_url}
                              alt="Tema Original"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <Box
                              className="overlay"
                              sx={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                bgcolor: 'rgba(0,0,0,0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: '0.3s'
                              }}
                            >
                              <SearchIcon sx={{ color: 'white' }} />
                            </Box>
                          </Box>
                        </Grid>
                      )}

                      {/* Seção Etiquetas Geradas */}
                      <Grid item xs={12} md={pedido.original_asset_url ? 9 : 12}>
                        <Typography variant="caption" fontWeight="bold" color="textSecondary" sx={{ mb: 1, display: 'block', textTransform: 'uppercase' }}>
                          Etiquetas para Produção
                        </Typography>
                        <Box sx={{
                          display: 'flex',
                          gap: 1.5,
                          pb: 1,
                          overflowX: 'auto',
                          '&::-webkit-scrollbar': { height: '6px' },
                          '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '10px' },
                          '&::-webkit-scrollbar-thumb': { background: '#ccc', borderRadius: '10px' }
                        }}>
                          {pedido.etiquetas_urls?.map((url, index) => (
                            <Box
                              key={index}
                              onClick={() => setSelectedImage(url)}
                              sx={{
                                minWidth: 140,
                                height: 105,
                                borderRadius: 2,
                                overflow: 'hidden',
                                border: '1px solid #eee',
                                cursor: 'pointer',
                                bgcolor: 'white',
                                '&:hover': { opacity: 0.8 }
                              }}
                            >
                              <img
                                src={url}
                                alt={`Etiqueta ${index + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Preço e Botão de Impressão */}
                    <Box sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 2,
                      mt: 1,
                      pt: 2,
                      borderTop: '1px dashed #eee'
                    }}>
                      <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#333' }}>
                          {pedido.kit_nome || 'Kit Personalizado'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                            R$ {Number(pedido.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </Typography>
                          {pedido.payment_method === 'pix' && (
                            <Chip label="PIX" size="small" variant="outlined" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 'bold' }} />
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={resendingEmail === `${pedido.id}-client` ? <CircularProgress size={16} /> : <EmailIcon />}
                          onClick={() => handleResendEmail(pedido.id, 'client')}
                          disabled={!!resendingEmail}
                          sx={{ borderRadius: 20, textTransform: 'none', fontWeight: 600 }}
                        >
                          {resendingEmail === `${pedido.id}-client` ? 'Enviando...' : 'Reenviar Cliente'}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="secondary"
                          startIcon={resendingEmail === `${pedido.id}-production` ? <CircularProgress size={16} color="inherit" /> : <EngineeringIcon />}
                          onClick={() => handleResendEmail(pedido.id, 'production')}
                          disabled={!!resendingEmail}
                          sx={{ borderRadius: 20, textTransform: 'none', fontWeight: 600 }}
                        >
                          {resendingEmail === `${pedido.id}-production` ? 'Enviando...' : 'Produção'}
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<PrintIcon />}
                          href={`/print/${pedido.id}`}
                          target="_blank"
                          sx={{
                            borderRadius: 20,
                            backgroundColor: '#26a69a',
                            px: 3,
                            height: 40,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            '&:hover': { backgroundColor: '#2bbbad' }
                          }}
                        >
                          Imprimir
                        </Button>
                      </Box>
                    </Box>
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

      {
        todosFiltrados.length > pedidosPorPagina && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={Math.ceil(todosFiltrados.length / pedidosPorPagina)}
              page={paginaAtual}
              onChange={handleMudarPagina}
              color="primary"
            />
          </Box>
        )
      }

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onClose={() => setSelectedImage(null)} maxWidth="lg">
        <Box sx={{ position: 'relative', p: 1, bgcolor: 'white' }}>
          <IconButton onClick={() => setSelectedImage(null)} sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.7)', zIndex: 10 }}>
            <CloseIcon />
          </IconButton>
          <img src={selectedImage} style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', borderRadius: '4px' }} alt="Enlarged preview" />
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => {
                const a = document.createElement('a');
                a.href = selectedImage;
                a.download = `duetags_asset_${Date.now()}.png`;
                a.click();
              }}
            >
              Baixar Imagem em Alta
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Production Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 200, mt: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
      >
        <MenuItem onClick={() => { window.location.href = `/admin/order/${activeOrderMenu?.id}`; setAnchorEl(null); }}>
          <VisibilityIcon sx={{ mr: 2, color: '#1a237e' }} /> Ver Detalhes do Pedido
        </MenuItem>
        <MenuItem onClick={() => { downloadOrderZip(activeOrderMenu); setAnchorEl(null); }}>
          <FolderZipIcon sx={{ mr: 2, color: '#fbc02d' }} /> Baixar Pacote ZIP
        </MenuItem>
        <MenuItem onClick={() => { setMetadataOrder(activeOrderMenu); setAnchorEl(null); }}>
          <BugReportIcon sx={{ mr: 2, color: '#1e88e5' }} /> Ver Metadados Técnicos
        </MenuItem>
        <MenuItem onClick={() => window.location.href = `/Customize?edit=${activeOrderMenu?.id}`}>
          <VisibilityIcon sx={{ mr: 2 }} /> Editar Design (Substituir)
        </MenuItem>
        <MenuItem onClick={() => window.location.href = `/Customize?admin_copy=${activeOrderMenu?.id}`}>
          <PasteIcon sx={{ mr: 2 }} /> Salvar Como (Nova Cópia Admin)
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setDeleteDialogOpen(true)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 2 }} /> Excluir Pedido
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Excluir Pedido(s)</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Tem certeza que deseja excluir {activeOrderMenu ? 'este pedido' : `${selectedOrders.length} pedidos`}? Esta ação não pode ser desfeita no banco de dados.
          </Typography>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#fff5f5', borderRadius: 2, border: '1px solid #feb2b2' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={deleteStorageFiles}
                  onChange={(e) => setDeleteStorageFiles(e.target.checked)}
                  color="error"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#c53030' }}>
                  Apagar também as imagens no servidor definitivamente
                </Typography>
              }
            />
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#9b2c2c' }}>
              Se ativado, as imagens associadas a este pedido serão removidas do bucket de armazenamento (Storage).
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>Cancelar</Button>
          <Button
            onClick={handleDeleteOrders}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          >
            Excluir Definitivamente
          </Button>
        </DialogActions>
      </Dialog>

      {/* Metadata Modal */}
      <Dialog open={!!metadataOrder} onClose={() => setMetadataOrder(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
          Metadados Técnicos - #{metadataOrder?.id.slice(0, 8)}
          <IconButton onClick={() => setMetadataOrder(null)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', overflow: 'auto', fontSize: '12px' }}>
            {JSON.stringify(metadataOrder?.label_metadata, null, 2)}
            {"\n\n--- CUSTOMIZATIONS ---\n"}
            {JSON.stringify(metadataOrder?.customizations, null, 2)}
          </pre>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMetadataOrder(null)}>Fechar</Button>
          <Button variant="contained" onClick={() => {
            const blob = new Blob([JSON.stringify(metadataOrder, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `metadata_${metadataOrder.id.slice(0, 8)}.json`;
            a.click();
          }}>Baixar JSON</Button>
        </DialogActions>
      </Dialog>

      {/* Print Layout Modal Overlay */}
      {
        selectedOrderForPrint && (
          <PrintLayout
            order={selectedOrderForPrint}
            etiquetas={etiquetas}
            kits={kits}
            onClose={() => setSelectedOrderForPrint(null)}
          />
        )
      }
    </Box >
  );
};

export default Pedidos;