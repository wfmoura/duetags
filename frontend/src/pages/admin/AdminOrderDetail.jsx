import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    Button,
    IconButton,
    Chip,
    Divider,
    Stack,
    Card,
    CardContent,
    Avatar,
    List,
    ListItem,
    ListItemText,
    Container,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Email as EmailIcon,
    Engineering as EngineeringIcon,
    WhatsApp as WhatsAppIcon,
    Print as PrintIcon,
    Download as DownloadIcon,
    Close as CloseIcon,
    Search as SearchIcon,
    BugReport as BugReportIcon,
    Visibility as VisibilityIcon,
    FolderZip as FolderZipIcon,
    ContentCopy as CopyIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import supabase from '../../utils/supabaseClient';
import { useProduct } from '../../contexts/ProductContext';
import { downloadOrderZip } from '../../services/zipService';

const AdminOrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { etiquetas, kits } = useProduct();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resendingEmail, setResendingEmail] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [metadataOpen, setMetadataOpen] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single();

                if (error) throw error;
                setOrder(data);
            } catch (error) {
                console.error('Error fetching order:', error);
                enqueueSnackbar('Erro ao carregar detalhes do pedido.', { variant: 'error' });
            } finally {
                setLoading(false);
            }
        };

        if (orderId) fetchOrder();
    }, [orderId, enqueueSnackbar]);

    const handleUpdateStatus = async (novoStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: novoStatus })
                .eq('id', orderId);

            if (error) throw error;

            setOrder(prev => ({ ...prev, status: novoStatus }));
            enqueueSnackbar('Status atualizado!', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Erro ao atualizar status.', { variant: 'error' });
        }
    };

    const handleResendEmail = async (target) => {
        setResendingEmail(target);
        try {
            enqueueSnackbar(`Reenviando e-mail para ${target === 'client' ? 'o Cliente' : 'a Produção'}...`, { variant: 'info' });

            const { data, error } = await supabase.functions.invoke('send-order-email-v2', {
                body: { orderId, target }
            });

            if (error) throw error;

            if (data?.success) {
                enqueueSnackbar('E-mail enviado com sucesso!', { variant: 'success' });
            } else {
                enqueueSnackbar(data?.error || 'Erro ao enviar e-mail.', { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar('Erro de conexão com o servidor.', { variant: 'error' });
        } finally {
            setResendingEmail(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'payment_confirmed': return 'success';
            case 'in_production': return 'warning';
            case 'awaiting_pickup': return 'info';
            case 'shipped': return 'info';
            case 'delivered': return 'success';
            case 'pending': return 'primary';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Pendente';
            case 'payment_confirmed': return 'Pagamento Confirmado';
            case 'in_production': return 'Em Produção';
            case 'awaiting_pickup': return 'Aguardando Retirada';
            case 'shipped': return 'Enviado';
            case 'delivered': return 'Entregue';
            case 'draft': return 'Rascunho';
            default: return status;
        }
    };

    const getWhatsAppLink = (phone) => {
        if (!phone) return null;
        const cleanPhone = phone.replace(/\D/g, '');
        const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
        return `https://api.whatsapp.com/send?phone=${finalPhone}`;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!order) {
        return (
            <Container sx={{ py: 10, textAlign: 'center' }}>
                <Typography variant="h5">Pedido não encontrado.</Typography>
                <Button onClick={() => navigate('/admin')} sx={{ mt: 2 }}>Voltar ao Painel</Button>
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', pb: 10 }}>
            {/* Header Sticky */}
            <Paper
                elevation={1}
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    p: 2,
                    bgcolor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #ddd'
                }}
            >
                <Box display="flex" alignItems="center" gap={2}>
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            Pedido #{order.id.slice(0, 8)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {new Date(order.created_at).toLocaleString('pt-BR')}
                        </Typography>
                    </Box>
                    <Chip
                        label={getStatusLabel(order.status)}
                        color={getStatusColor(order.status)}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                    />
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(e.target.value)}
                            sx={{ borderRadius: 2, height: 40 }}
                        >
                            <MenuItem value="pending">Pendente</MenuItem>
                            <MenuItem value="payment_confirmed">Pagamento Confirmado</MenuItem>
                            <MenuItem value="in_production">Em produção</MenuItem>
                            <MenuItem value="awaiting_pickup">Aguardando Retirada</MenuItem>
                            <MenuItem value="shipped">Enviado</MenuItem>
                            <MenuItem value="delivered">Entregue</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        startIcon={<PrintIcon />}
                        href={`/print/${order.id}`}
                        target="_blank"
                        sx={{ bgcolor: '#26a69a', '&:hover': { bgcolor: '#2bbbad' } }}
                    >
                        Imprimir
                    </Button>
                </Box>
            </Paper>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Grid container spacing={4}>
                    {/* Coluna Esquerda: Informações do Cliente e Pedido */}
                    <Grid item xs={12} md={4}>
                        <Stack spacing={3}>
                            {/* Card Cliente */}
                            <Card sx={{ borderRadius: 4 }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                                        <Avatar sx={{ bgcolor: '#1a237e' }}>
                                            {order.customer_email?.[0].toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">Dados do Cliente</Typography>
                                            <Typography variant="body2" color="textSecondary">{order.customer_email}</Typography>
                                        </Box>
                                    </Box>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography variant="body2" color="textSecondary">WhatsApp:</Typography>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="body2" fontWeight="bold">{order.phone || 'N/A'}</Typography>
                                            {order.phone && (
                                                <IconButton
                                                    size="small"
                                                    href={getWhatsAppLink(order.phone)}
                                                    target="_blank"
                                                    sx={{ color: '#25D366' }}
                                                >
                                                    <WhatsAppIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Card Resumo Pedido */}
                            <Card sx={{ borderRadius: 4 }}>
                                <CardContent>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Resumo do Pedido</Typography>
                                    <List disablePadding>
                                        <ListItem sx={{ px: 0, py: 1 }}>
                                            <ListItemText
                                                primary={order.kit_nome || "Kit Personalizado"}
                                                secondary={`R$ ${Number(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                            />
                                        </ListItem>
                                        <Divider sx={{ my: 1 }} />
                                        <Box display="flex" justifyContent="space-between" mt={1}>
                                            <Typography variant="body2">Metódo:</Typography>
                                            <Chip label={(order.payment_method || 'PIX').toUpperCase()} size="small" variant="outlined" />
                                        </Box>
                                    </List>
                                </CardContent>
                            </Card>

                            {/* Card Ações Rápidas */}
                            <Card sx={{ borderRadius: 4, bgcolor: '#f8f9fa' }}>
                                <CardContent>
                                    <Typography variant="subtitle2" fontWeight="bold" color="textSecondary" gutterBottom>Comunicação e Exportação</Typography>
                                    <Stack spacing={1} mt={2}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={resendingEmail === 'client' ? <CircularProgress size={16} /> : <EmailIcon />}
                                            onClick={() => handleResendEmail('client')}
                                            disabled={!!resendingEmail}
                                        >
                                            Reenviar Cliente
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="secondary"
                                            startIcon={resendingEmail === 'production' ? <CircularProgress size={16} color="inherit" /> : <EngineeringIcon />}
                                            onClick={() => handleResendEmail('production')}
                                            disabled={!!resendingEmail}
                                        >
                                            Reenviar Produção
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="info"
                                            startIcon={<FolderZipIcon />}
                                            onClick={() => downloadOrderZip(order)}
                                        >
                                            Baixar Pacote ZIP
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="text"
                                            startIcon={<BugReportIcon />}
                                            onClick={() => setMetadataOpen(true)}
                                            size="small"
                                        >
                                            Ver Metadados
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>

                    {/* Coluna Direita: Conteúdo Visual */}
                    <Grid item xs={12} md={8}>
                        <Stack spacing={4}>
                            {/* Arte Original */}
                            {order.original_asset_url && (
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Arte Original (Alta Resolução)</Typography>
                                    <Paper
                                        onClick={() => setSelectedImage(order.original_asset_url)}
                                        sx={{
                                            p: 2,
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                            transition: '0.3s',
                                            '&:hover': { transform: 'scale(1.01)', boxShadow: 4 },
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <img
                                            src={order.original_asset_url}
                                            alt="Original"
                                            style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 8 }}
                                        />
                                        <Box sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', p: 1, borderRadius: '50%' }}>
                                            <VisibilityIcon />
                                        </Box>
                                    </Paper>
                                </Box>
                            )}

                            {/* Etiquetas Geradas */}
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Etiquetas Processadas</Typography>
                                <Grid container spacing={2}>
                                    {order.etiquetas_urls?.map((url, idx) => (
                                        <Grid item xs={6} sm={4} key={idx}>
                                            <Paper
                                                onClick={() => setSelectedImage(url)}
                                                sx={{
                                                    p: 1,
                                                    borderRadius: 3,
                                                    cursor: 'pointer',
                                                    '&:hover': { opacity: 0.8 },
                                                    border: '1px solid #eee'
                                                }}
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Etiqueta ${idx}`}
                                                    style={{ width: '100%', height: 120, objectFit: 'contain' }}
                                                />
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>

            {/* Lightbox / Preview Modal */}
            <Dialog open={!!selectedImage} onClose={() => setSelectedImage(null)} maxWidth="lg">
                <Box sx={{ position: 'relative', p: 1, bgcolor: 'white' }}>
                    <IconButton
                        onClick={() => setSelectedImage(null)}
                        sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.7)', zIndex: 10 }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <img src={selectedImage} style={{ maxWidth: '100%', maxHeight: '85vh', display: 'block', borderRadius: '8px' }} alt="Preview" />
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={() => {
                                const a = document.createElement('a');
                                a.href = selectedImage;
                                a.download = `duetags_${orderId.slice(0, 8)}_${Date.now()}.png`;
                                a.click();
                            }}
                        >
                            Baixar Imagem
                        </Button>
                    </Box>
                </Box>
            </Dialog>

            {/* Metadata Dialog */}
            <Dialog open={metadataOpen} onClose={() => setMetadataOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                    Metadados Técnicos do Pedido
                    <IconButton onClick={() => setMetadataOpen(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Label Metadata:</Typography>
                        <pre style={{ margin: 0, fontSize: '12px', overflow: 'auto' }}>
                            {JSON.stringify(order.label_metadata, null, 2)}
                        </pre>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Customizations:</Typography>
                        <pre style={{ margin: 0, fontSize: '12px', overflow: 'auto' }}>
                            {JSON.stringify(order.customizations, null, 2)}
                        </pre>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        startIcon={<CopyIcon />}
                        onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(order, null, 2));
                            enqueueSnackbar('Metadados copiados para a área de transferência!', { variant: 'info' });
                        }}
                    >
                        Copiar Tudo
                    </Button>
                    <Button variant="contained" onClick={() => setMetadataOpen(false)}>Fechar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminOrderDetail;
