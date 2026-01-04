import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Paper,
    Divider,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Chip,
    Alert,
    Tabs,
    Tab
} from "@mui/material";
import {
    ContentCopy as ContentCopyIcon,
    Pix as PixIcon,
    CreditCard as CreditCardIcon,
    Share as ShareIcon,
    EmojiEvents as TrophyIcon,
    LocalOffer as TagIcon,
    CheckCircle as CheckCircleIcon,
    CloudUpload as CloudUploadIcon,
    AttachFile as AttachFileIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useProduct } from "../contexts/ProductContext";
import supabase from "../utils/supabaseClient";
import { useSnackbar } from 'notistack';
import SocialShareCard from "../components/SocialShareCard";

const OrderPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { kits } = useProduct();
    const { enqueueSnackbar } = useSnackbar();

    const [order, setOrder] = useState(null);
    const [kitPayment, setKitPayment] = useState(null);
    const [profile, setProfile] = useState(null);
    const [imageUrls, setImageUrls] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [error, setError] = useState(null);
    const [comprovanteUrl, setComprovanteUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [paymentTab, setPaymentTab] = useState(0); // 0 for Pix, 1 for Card

    // Fetch order data
    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) {
                setError("ID do pedido não encontrado.");
                setIsLoading(false);
                return;
            }

            try {
                const { data, error: fetchError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single();

                if (fetchError) throw fetchError;
                setOrder(data);
                if (data.payment_method === 'card') {
                    setPaymentTab(1);
                } else {
                    setPaymentTab(0);
                }

                // Fetch kit payment data
                if (data.kit_id) {
                    const { data: kitData, error: kitError } = await supabase
                        .from('kits')
                        .select('pix_code, pix_qrcode_url, payment_link')
                        .eq('id', data.kit_id)
                        .single();

                    if (kitData && !kitError) {
                        setKitPayment(kitData);
                    }
                }

                // Process image URLs
                if (data.etiquetas_urls && data.etiquetas_urls.length > 0) {
                    const processed = await Promise.all(data.etiquetas_urls.map(async (urlOrPath) => {
                        let filePath = urlOrPath;
                        const isFullUrl = urlOrPath.includes('supabase.co');

                        if (isFullUrl) {
                            const parts = urlOrPath.split('/etiquetas/');
                            if (parts.length > 1) {
                                filePath = parts[1];
                            } else {
                                return urlOrPath;
                            }
                        }

                        try {
                            const { data: signedData, error: signedError } = await supabase.storage
                                .from('etiquetas')
                                .createSignedUrl(filePath, 3600);

                            if (signedData && !signedError) {
                                return signedData.signedUrl;
                            }
                        } catch (e) {
                            console.warn("Erro ao gerar URL assinada:", e);
                        }
                        return urlOrPath;
                    }));
                    setImageUrls(processed);
                }
                if (data.comprovante_url) {
                    setComprovanteUrl(data.comprovante_url);
                }
            } catch (err) {
                console.error("Erro ao buscar pedido:", err);
                setError("Não foi possível carregar os dados do pedido.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    // Fetch user profile for referral code
    useEffect(() => {
        if (user) {
            const fetchProfile = async () => {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (data) setProfile(data);
            };
            fetchProfile();
        }
    }, [user]);

    // Generate recommendations
    useEffect(() => {
        if (order && kits && kits.length > 0) {
            const others = kits
                .filter(k => String(k.id) !== String(order.kit_id))
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);
            setRecommendations(others);
        }
    }, [order, kits]);

    const calculatePixPrice = (basePrice) => {
        return basePrice * 0.95;
    };

    const purchaseDate = order?.created_at
        ? new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '---';

    // Realtime subscription for order status updates
    useEffect(() => {
        if (!orderId) return;

        const channel = supabase
            .channel(`order-${orderId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `id=eq.${orderId}`
            }, (payload) => {
                setOrder(payload.new);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [orderId]);



    const isPending = order?.status === 'pending';
    const isReview = order?.status === 'review';
    const isCompleted = order?.status === 'completed';

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography color="textSecondary">Carregando pedido...</Typography>
            </Box>
        );
    }

    if (error || !order) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error || "Pedido não encontrado."}</Alert>
                <Button variant="contained" onClick={() => navigate('/')}>Voltar ao Início</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {isCompleted ? "✨ Pedido em Produção!" : "📝 Detalhes do seu Pedido"}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    {isCompleted
                        ? "Tudo pronto! Suas etiquetas já estão sendo preparadas com carinho."
                        : `Oi ${order.customer_name?.split(' ')[0] || 'cliente'}, confira abaixo o que preparamos para você.`}
                </Typography>
            </Box>

            {/* Order Summary Card */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: '24px', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                            📋 Resumo do Pedido
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="textSecondary">Identificador:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>#{order.id.slice(0, 8).toUpperCase()}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="textSecondary">Kit Escolhido:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{order.kit_nome}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="textSecondary">Tema:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{order.tema_nome}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="textSecondary">Data:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{purchaseDate}</Typography>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Total:</Typography>
                                <Typography variant="h5" color="primary" sx={{ fontWeight: 900 }}>
                                    R$ {order.total_amount?.toFixed(2).replace('.', ',')}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                            📍 Entrega
                        </Typography>
                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                {order.delivery_method === 'pickup' ? '📦 Retirada' : '🛵 Envio por Uber'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ lineHeight: 1.4, display: 'block' }}>
                                {order.delivery_method === 'pickup'
                                    ? 'Local: Setor Noroeste. Entraremos em contato via WhatsApp para agendar sua retirada assim que estiver pronto!'
                                    : 'A entrega será feita via Uber flash. Solicitamos a coleta assim que a produção for finalizada.'}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Etiquetas Preview */}
                {imageUrls.length > 0 && (
                    <Box sx={{ mt: 5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, textAlign: 'center' }}>
                            🎨 Suas Etiquetas Personalizadas
                        </Typography>
                        <Grid container spacing={2} justifyContent="center">
                            {imageUrls.map((url, index) => (
                                <Grid item xs={6} sm={4} md={2.4} key={index}>
                                    <Box
                                        sx={{
                                            p: 1,
                                            bgcolor: 'white',
                                            borderRadius: '16px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                            transition: 'transform 0.2s',
                                            '&:hover': { transform: 'scale(1.05)' }
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={url}
                                            sx={{
                                                width: '100%',
                                                height: 'auto',
                                                borderRadius: '8px',
                                                display: 'block'
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}
            </Paper>



            {/* Success Content (Only for Completed Orders) */}
            {isCompleted && (
                <Grid container spacing={4} sx={{ mb: 4 }}>
                    {/* Sharing Section */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={2} sx={{ p: 3, borderRadius: '16px', height: '100%' }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ShareIcon color="primary" /> Espalhe a novidade!
                            </Typography>
                            <SocialShareCard
                                labelUrl={order.etiquetas_urls?.[0]}
                                kitName={order.kit_nome}
                                userName={profile?.name || user?.user_metadata?.name}
                            />
                        </Paper>
                    </Grid>

                    {/* Referral Section */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3, height: '100%', bgcolor: '#f3e5f5', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                            <TrophyIcon sx={{ fontSize: 50, color: '#7b1fa2', mb: 2, margin: '0 auto' }} />
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Indique e Ganhe!</Typography>
                            <Typography variant="body2" paragraph>
                                Compartilhe seu código e ganhe <strong>R$ 5,00 de desconto</strong> na próxima compra!
                            </Typography>
                            <Box sx={{ bgcolor: '#fff', p: 2, borderRadius: 2, border: '2px dashed #ab47bc', mb: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', letterSpacing: 2 }}>
                                    {profile?.referral_code || '------'}
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => {
                                    const text = `Oi! Use meu código ${profile?.referral_code} para desconto na DueTags! https://duetags.com.br`;
                                    navigator.clipboard.writeText(text);
                                    enqueueSnackbar("Convite copiado!", { variant: 'success' });
                                }}
                            >
                                Copiar Convite
                            </Button>
                        </Paper>
                    </Grid>

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }}>
                                <Chip label="Aproveite também" icon={<TagIcon />} sx={{ px: 2, fontWeight: 'bold' }} />
                            </Divider>
                            <Grid container spacing={2}>
                                {recommendations.map((kit) => (
                                    <Grid item xs={12} sm={4} key={kit.id}>
                                        <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}>
                                            <Box sx={{
                                                position: 'relative',
                                                width: '100%',
                                                pt: '65%',
                                                bgcolor: '#f0f2f5',
                                                borderRadius: '8px 8px 0 0',
                                                overflow: 'hidden'
                                            }}>
                                                {kit.thumbnail ? (
                                                    <CardMedia
                                                        component="img"
                                                        image={kit.thumbnail}
                                                        alt={kit.nome}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'contain',
                                                            p: 1
                                                        }}
                                                    />
                                                ) : (
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        background: 'linear-gradient(135deg, #81c784 0%, #4db6ac 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#fff'
                                                    }}>
                                                        <TagIcon sx={{ fontSize: 50, opacity: 0.8 }} />
                                                    </Box>
                                                )}
                                            </Box>
                                            <CardContent>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{kit.nome}</Typography>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    fullWidth
                                                    sx={{ mt: 1 }}
                                                    onClick={() => navigate('/Customize', { state: { selectedKit: kit } })}
                                                >
                                                    Ver Detalhes
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            )}
            {/* Footer Navigation */}
            <Box sx={{ textAlign: 'center', mt: 4, mb: 8 }}>
                <Button variant="text" onClick={() => navigate('/')}>
                    Criar Nova Etiqueta

                </Button>
            </Box>
        </Box>
    );
};

export default OrderPage;
