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

    const handleTabChange = async (event, newValue) => {
        setPaymentTab(newValue);
        const method = newValue === 0 ? 'pix' : 'card';

        // Calcular novo total baseado no método
        const basePrice = order.kit_preco || 0;
        const newTotal = method === 'pix' ? calculatePixPrice(basePrice) : basePrice;

        // Sync with DB
        try {
            const { error: updateError } = await supabase
                .from('orders')
                .update({
                    payment_method: method,
                    total_amount: newTotal
                })
                .eq('id', order.id);

            if (updateError) throw updateError;
            // O realtime cuidará de atualizar o estado 'order' localmente
        } catch (err) {
            console.error("Erro ao atualizar método de pagamento:", err);
            enqueueSnackbar("Erro ao atualizar preço. Tente novamente.", { variant: 'error' });
        }
    };

    const handleUploadComprovante = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validar tamanho (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            enqueueSnackbar("Arquivo muito grande. Máximo 5MB.", { variant: 'error' });
            return;
        }

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `comprovante_${order.id}_${Date.now()}.${fileExt}`;
            const filePath = `comprovantes/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('etiquetas') // Using existing bucket for now, or instructions to create 'comprovantes'
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('etiquetas')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('orders')
                .update({
                    comprovante_url: publicUrl,
                    status: 'review'
                })
                .eq('id', order.id);

            if (updateError) throw updateError;

            setComprovanteUrl(publicUrl);
            setOrder(prev => ({ ...prev, status: 'review', comprovante_url: publicUrl }));
            enqueueSnackbar("Comprovante enviado com sucesso! Aguarde a conferência.", { variant: 'success' });
        } catch (err) {
            console.error("Erro no upload:", err);
            enqueueSnackbar("Erro ao enviar comprovante. Tente novamente.", { variant: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

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
                <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    {isCompleted ? <CheckCircleIcon color="success" fontSize="large" /> : (isReview ? "⏳" : "🎉")}
                    {isCompleted ? "Pedido Confirmado!" : (isReview ? "Pagamento em Análise" : "Pedido Recebido!")}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    {isCompleted
                        ? "Obrigado! Seu pedido está em produção."
                        : (isReview
                            ? "Recebemos seu comprovante. Nossa equipe irá conferir em instantes."
                            : "Seu pedido foi registrado e está aguardando o pagamento.")}
                </Typography>
            </Box>

            {/* Order Summary Card */}
            <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: '16px' }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'center', sm: 'flex-start' },
                    textAlign: { xs: 'center', sm: 'left' },
                    mb: 2,
                    gap: 2
                }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            Resumo do Pedido #{order.id.slice(0, 8)}
                        </Typography>
                        <Typography variant="body2"><strong>Kit:</strong> {order.kit_nome}</Typography>
                        <Typography variant="body2" color="textSecondary"><strong>Tema:</strong> {order.tema_nome}</Typography>
                        <Typography variant="body2" color="textSecondary">
                            <strong>Entrega:</strong> {order.delivery_method === 'pickup' ? 'Retirada (Setor Noroeste)' : 'Uber (por conta do cliente)'}
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                            R$ {order.total_amount?.toFixed(2).replace('.', ',')}
                        </Typography>
                        {order.payment_method === 'pix' && (
                            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, display: 'block' }}>
                                (5% de desconto PIX aplicado)
                            </Typography>
                        )}
                    </Box>
                </Box>

            </Paper>

            {/* Payment Selection & Instructions */}
            {(isPending || isReview) && (
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 800, textAlign: 'center', mb: 3 }}>
                        Escolha como deseja pagar:
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        {/* Pix Option Card */}
                        <Grid item xs={12} sm={6}>
                            <Paper
                                onClick={() => !isReview && handleTabChange(null, 0)}
                                elevation={paymentTab === 0 ? 8 : 1}
                                sx={{
                                    p: 3,
                                    borderRadius: '20px',
                                    cursor: isReview ? 'default' : 'pointer',
                                    border: '3px solid',
                                    borderColor: paymentTab === 0 ? 'primary.main' : 'transparent',
                                    bgcolor: paymentTab === 0 ? 'rgba(41, 86, 164, 0.03)' : 'white',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&:hover': {
                                        transform: isReview ? 'none' : 'translateY(-4px)',
                                        boxShadow: isReview ? 'none' : 4
                                    }
                                }}
                            >
                                {paymentTab === 0 && (
                                    <Box sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'primary.main', color: 'white', p: 1, borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CheckCircleIcon fontSize="small" />
                                    </Box>
                                )}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                    <Box sx={{ p: 1.5, bgcolor: '#e8f5e9', borderRadius: '12px', color: '#2e7d32' }}>
                                        <PixIcon fontSize="large" />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>PIX</Typography>
                                        <Chip
                                            label="-5% DE DESCONTO"
                                            size="small"
                                            color="success"
                                            sx={{ fontWeight: 900, fontSize: '0.65rem', height: 20 }}
                                        />
                                    </Box>
                                </Box>
                                <Typography variant="caption" color="textSecondary">
                                    Aprovação instantânea e o melhor preço para você.
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* Card Option Card */}
                        <Grid item xs={12} sm={6}>
                            <Paper
                                onClick={() => !isReview && handleTabChange(null, 1)}
                                elevation={paymentTab === 1 ? 8 : 1}
                                sx={{
                                    p: 3,
                                    borderRadius: '20px',
                                    cursor: isReview ? 'default' : 'pointer',
                                    border: '3px solid',
                                    borderColor: paymentTab === 1 ? 'primary.main' : 'transparent',
                                    bgcolor: paymentTab === 1 ? 'rgba(41, 86, 164, 0.03)' : 'white',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&:hover': {
                                        transform: isReview ? 'none' : 'translateY(-4px)',
                                        boxShadow: isReview ? 'none' : 4
                                    }
                                }}
                            >
                                {paymentTab === 1 && (
                                    <Box sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'primary.main', color: 'white', p: 1, borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CheckCircleIcon fontSize="small" />
                                    </Box>
                                )}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                    <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: '12px', color: '#1976d2' }}>
                                        <CreditCardIcon fontSize="large" />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Cartão</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block' }}>Valor Integral</Typography>
                                    </Box>
                                </Box>
                                <Typography variant="caption" color="textSecondary">
                                    Pague com segurança via Mercado Pago ou similar.
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Unified Action Area */}
                    <Paper
                        elevation={4}
                        sx={{
                            p: { xs: 3, md: 5 },
                            borderRadius: '30px',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                            border: '1px solid #e1e8f5',
                            position: 'relative'
                        }}
                    >
                        {paymentTab === 0 ? (
                            /* Modern PIX Area */
                            <Box>
                                {isReview ? (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Box sx={{ mb: 2, display: 'inline-flex', p: 2, bgcolor: '#fff4e5', borderRadius: '50%' }}>
                                            <Typography variant="h3">⏳</Typography>
                                        </Box>
                                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>Estamos conferindo!</Typography>
                                        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                                            Seu comprovante foi enviado com sucesso. Nossa equipe confirmará o pagamento em breve.
                                        </Typography>
                                        {comprovanteUrl && (
                                            <Button
                                                variant="outlined"
                                                startIcon={<AttachFileIcon />}
                                                href={comprovanteUrl}
                                                target="_blank"
                                                sx={{ borderRadius: '12px' }}
                                            >
                                                Ver Comprovante Enviado
                                            </Button>
                                        )}
                                    </Box>
                                ) : (
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h5" sx={{ fontWeight: 900, color: 'success.main', mb: 3 }}>
                                            🚀 Finalize com PIX agora
                                        </Typography>

                                        <Grid container spacing={4} alignItems="center">
                                            <Grid item xs={12} md={5}>
                                                {kitPayment?.pix_qrcode_url ? (
                                                    <Box sx={{
                                                        p: 2,
                                                        bgcolor: 'white',
                                                        borderRadius: '20px',
                                                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                                        display: 'inline-block',
                                                        mx: 'auto'
                                                    }}>
                                                        <Box component="img" src={kitPayment.pix_qrcode_url} sx={{ width: '100%', maxWidth: 220, borderRadius: '12px' }} />
                                                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>Escaneie no app do banco</Typography>
                                                    </Box>
                                                ) : (
                                                    <Box sx={{ p: 4, bgcolor: '#f5f5f5', borderRadius: '20px', textAlign: 'center', maxWidth: 220, mx: 'auto' }}>
                                                        <PixIcon sx={{ fontSize: 60, color: 'grey.300' }} />
                                                        <Typography variant="body2" color="textSecondary">QR Code indisponível</Typography>
                                                    </Box>
                                                )}
                                            </Grid>

                                            <Grid item xs={12} md={7} sx={{ textAlign: 'left' }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Código Copia e Cola:</Typography>
                                                <Box sx={{
                                                    p: 2,
                                                    bgcolor: '#f1f8e9',
                                                    borderRadius: '15px',
                                                    border: '2px dashed #81c784',
                                                    mb: 3,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 2
                                                }}>
                                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', fontSize: '0.8rem', lineHeight: 1.4, textAlign: 'center' }}>
                                                        {kitPayment?.pix_code || "Código indisponível"}
                                                    </Typography>
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        color="success"
                                                        startIcon={<ContentCopyIcon />}
                                                        onClick={() => {
                                                            if (kitPayment?.pix_code) {
                                                                navigator.clipboard.writeText(kitPayment.pix_code);
                                                                enqueueSnackbar("Código PIX copiado!", { variant: 'success' });
                                                            }
                                                        }}
                                                        sx={{ borderRadius: '10px', py: { xs: 1.2, sm: 1.5 }, fontWeight: 800 }}
                                                    >
                                                        Copiar Código PIX
                                                    </Button>
                                                </Box>


                                            </Grid>
                                        </Grid>
                                    </Box>
                                )}
                            </Box>
                        ) : (
                            /* Modern Card Area */
                            <Box sx={{ textAlign: 'center', py: { xs: 2, md: 4 } }}>
                                <Box sx={{ mb: 3, display: 'inline-flex', p: 3, bgcolor: 'rgba(25, 118, 210, 0.1)', borderRadius: '50%' }}>
                                    <CreditCardIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>Quase lá!</Typography>
                                <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: '500px', mx: 'auto' }}>
                                    Você será redirecionado para o nosso ambiente de pagamento seguro. Lá poderá parcelar sua compra e usar diversas bandeiras.
                                </Typography>

                                {kitPayment?.payment_link ? (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        href={`${kitPayment.payment_link}${kitPayment.payment_link.includes('?') ? '&' : '?'}external_reference=${order.id}`}
                                        target="_blank"
                                        sx={{
                                            borderRadius: '20px',
                                            px: { xs: 4, md: 10 },
                                            py: 2.5,
                                            fontSize: '1.2rem',
                                            fontWeight: 900,
                                            boxShadow: '0 15px 35px rgba(25, 118, 210, 0.3)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: '0 20px 45px rgba(25, 118, 210, 0.4)',
                                            }
                                        }}
                                    >
                                        Ir para o Pagamento Seguro 💳
                                    </Button>
                                ) : (
                                    <Alert severity="error" sx={{ borderRadius: '15px' }}>Link de pagamento indisponível para este kit.</Alert>
                                )}

                                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, opacity: 0.6 }}>
                                    <Box component="img" src="https://logospng.org/download/visa/logo-visa-4096.png" sx={{ height: 15 }} />
                                    <Box component="img" src="https://logospng.org/download/mastercard/logo-mastercard-2048.png" sx={{ height: 15 }} />
                                    <Box component="img" src="https://logospng.org/download/elo/logo-elo-2048.png" sx={{ height: 15 }} />
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Box>
            )}

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
