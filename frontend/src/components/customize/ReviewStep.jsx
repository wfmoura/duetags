import React, { useState } from 'react';
import { Box, Typography, Paper, Divider, Button, CircularProgress, Checkbox, FormControlLabel, Radio, RadioGroup, FormControl, FormLabel, TextField } from '@mui/material';
import Etiquetas from '../Etiquetas';
import ScenePreview from './ScenePreview';
import html2canvas from 'html2canvas';
import supabase from '../../utils/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import StoreIcon from '@mui/icons-material/Store';
import { Grid, InputAdornment } from '@mui/material';
import MaskedInput from '../MaskedInput';

const ReviewStep = ({
    selectedKit,
    selectedTheme,
    customizations,
    labelPositions = {},
    isSaving,
    onSaveRascunho,
    onFinalizar,
    onShare,
    etiquetas,
    deliveryInfo,
    setDeliveryInfo,
    deliveryMethod,
    setDeliveryMethod,
    paymentMethod,
    setPaymentMethod,
    acceptedTerms,
    setAcceptedTerms,
    appliedCoupon,
    setAppliedCoupon
}) => {
    const [previewUrl, setPreviewUrl] = React.useState(null);
    const [showScene, setShowScene] = React.useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false);
    const { user } = useAuth();

    const handleCepChange = async (e) => {
        const cep = e.target.value.replace(/\D/g, '');
        setDeliveryInfo({ ...deliveryInfo, cep });

        if (cep.length === 8) {
            setLoadingCep(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();

                if (!data.erro) {
                    setDeliveryInfo({
                        ...deliveryInfo,
                        cep,
                        rua: data.logradouro,
                        bairro: data.bairro,
                        cidade: data.localidade,
                        estado: data.uf
                    });
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            } finally {
                setLoadingCep(false);
            }
        }
    };

    const handleAddressChange = (field) => (e) => {
        setDeliveryInfo({ ...deliveryInfo, [field]: e.target.value });
    };

    const basePrice = selectedKit?.preco || 0;

    const calculateTotal = () => {
        let total = basePrice; // No payment method discount at this stage, selected on next page
        if (appliedCoupon) {
            if (appliedCoupon.discount_type === 'percentage') {
                total = total * (1 - appliedCoupon.value / 100);
            } else {
                total = Math.max(0, total - appliedCoupon.value);
            }
        }
        return total;
    };

    const finalPrice = calculateTotal();

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplyingCoupon(true);
        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase())
                .eq('active', true)
                .single();

            if (error || !data) {
                alert("Cupom inválido ou expirado");
                setAppliedCoupon(null);
            } else {
                // Check Expiration
                if (data.expires_at && new Date(data.expires_at) < new Date()) {
                    alert("Este cupom já expirou");
                    return;
                }

                // Check Usage Limit
                if (data.max_uses !== null && data.usage_count >= data.max_uses) {
                    alert("Este cupom atingiu o limite de usos");
                    return;
                }

                // Check User restriction
                if (data.user_id && data.user_id !== user?.id) {
                    alert("Este cupom é exclusivo para outro cliente");
                    return;
                }

                setAppliedCoupon(data);
                setCouponCode("");
            }
        } catch (err) {
            console.error("Error applying coupon:", err);
            alert("Erro ao aplicar cupom");
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={3} sx={{ pb: 8 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Revisão e Termos</Typography>
            <Typography variant="body1" color="textSecondary" textAlign="center">
                Confira os detalhes do seu pedido e aceite os termos para finalizar.
            </Typography>

            <Paper elevation={2} sx={{ p: 3, bgcolor: '#fff', maxWidth: '800px', width: '100%', borderRadius: '16px' }}>
                {/* 1. Resumo do Design */}
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    🎨 Resumo do Design
                </Typography>
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" mb={1} gap={1}>
                    <Typography variant="body2"><strong>Kit:</strong> {selectedKit?.nome}</Typography>
                    <Typography variant="body2"><strong>Tema:</strong> {selectedTheme?.nome}</Typography>
                </Box>
                <Box mb={2}>
                    <Typography variant="body2"><strong>Texto:</strong> {customizations.nome} {customizations.complemento && `| ${customizations.complemento}`}</Typography>
                </Box>

                <Box sx={{ mt: 3, bgcolor: '#f5f5f5', p: 3, borderRadius: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="h6" color="textSecondary">
                            Suas Etiquetas
                        </Typography>
                    </Box>
                    <Box id="etiquetas-review-preview" display="flex" flexDirection="column" alignItems="center">
                        <Etiquetas
                            kit={selectedKit}
                            theme={selectedTheme}
                            customizations={customizations}
                            zoom={window.innerWidth < 600 ? 1.0 : 1.5}
                            positions={labelPositions}
                            etiquetas={etiquetas}
                            isExport={true}
                        />
                    </Box>
                    <Box sx={{ textAlign: 'center', mt: 1 }}>
                        <Button
                            variant="text"
                            size="small"
                            onClick={async () => {
                                const element = document.getElementById('etiquetas-review-preview');
                                if (!element) return;
                                try {
                                    const canvas = await html2canvas(element, { backgroundColor: null, scale: 2 });
                                    setPreviewUrl(canvas.toDataURL());
                                    setShowScene(true);
                                } catch (err) {
                                    console.error("Erro ao capturar prévia:", err);
                                }
                            }}
                            sx={{ textTransform: 'none' }}
                        >
                            Ver em cenário real
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* 2. Resumo da Entrega */}
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    🚚 Opções de Entrega
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                        <Box
                            onClick={() => setDeliveryMethod('pickup')}
                            sx={{
                                p: 2,
                                border: '2px solid',
                                borderColor: deliveryMethod === 'pickup' ? 'primary.main' : 'rgba(0,0,0,0.08)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                bgcolor: deliveryMethod === 'pickup' ? 'rgba(41, 86, 164, 0.05)' : 'white',
                                transition: 'all 0.2s',
                                textAlign: 'center'
                            }}
                        >
                            <StoreIcon color={deliveryMethod === 'pickup' ? 'primary' : 'disabled'} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Retirada Grátis</Typography>
                            <Typography variant="caption" color="textSecondary">Setor Noroeste - Brasília-DF</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box
                            onClick={() => setDeliveryMethod('uber')}
                            sx={{
                                p: 2,
                                border: '2px solid',
                                borderColor: deliveryMethod === 'uber' ? 'primary.main' : 'rgba(0,0,0,0.08)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                bgcolor: deliveryMethod === 'uber' ? 'rgba(41, 86, 164, 0.05)' : 'white',
                                transition: 'all 0.2s',
                                textAlign: 'center'
                            }}
                        >
                            <DirectionsCarIcon color={deliveryMethod === 'uber' ? 'primary' : 'disabled'} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Entrega via Uber</Typography>
                            <Typography variant="caption" color="textSecondary">Frete a combinar</Typography>
                        </Box>
                    </Grid>
                </Grid>

                {deliveryMethod === 'uber' && (
                    <Box sx={{ mt: 2, p: 2, border: '1px solid #eee', borderRadius: '12px', bgcolor: '#fcfcfc' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="CEP"
                                    value={deliveryInfo.cep || ''}
                                    onChange={handleCepChange}
                                    placeholder="00000-000"
                                    InputProps={{
                                        inputComponent: MaskedInput,
                                        inputProps: { mask: '00000-000' },
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {loadingCep ? <CircularProgress size={20} /> : <SearchIcon color="action" fontSize="small" />}
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} />
                            <Grid item xs={12} sm={9}>
                                <TextField fullWidth size="small" label="Logradouro" value={deliveryInfo.rua || ''} onChange={handleAddressChange('rua')} />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField fullWidth size="small" label="Nº" value={deliveryInfo.numero || ''} onChange={handleAddressChange('numero')} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth size="small" label="Bairro" value={deliveryInfo.bairro || ''} onChange={handleAddressChange('bairro')} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth size="small" label="Cidade" value={deliveryInfo.cidade || ''} onChange={handleAddressChange('cidade')} />
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {deliveryMethod === 'pickup' && (
                    <Box sx={{ mt: 2, p: 2, border: '1px solid #e3f2fd', borderRadius: '12px', bgcolor: '#f0f7ff' }}>
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                            Local de Retirada:
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            SQNW 103 Bloco A, Brasília - DF. <br />
                            Combinar horário após a produção.
                        </Typography>
                    </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <Divider sx={{ my: 3 }} />

                {/* 3. Resumo Financeiro (Sem escolha aqui) */}
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    💳 Resumo Financeiro
                </Typography>

                {/* Coupon Section */}
                <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                        size="small"
                        label="Cupom de Desconto"
                        variant="outlined"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={!!appliedCoupon || isApplyingCoupon}
                        sx={{ flexGrow: 1 }}
                    />
                    <Button
                        variant="outlined"
                        onClick={handleApplyCoupon}
                        disabled={!couponCode || !!appliedCoupon || isApplyingCoupon}
                        sx={{ borderRadius: '8px' }}
                    >
                        {isApplyingCoupon ? <CircularProgress size={20} /> : "Aplicar"}
                    </Button>
                </Box>
                {appliedCoupon && (
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'success.main' }}>
                        <Typography variant="caption">Cupom <strong>{appliedCoupon.code}</strong> aplicado!</Typography>
                        <Button size="small" color="error" onClick={() => setAppliedCoupon(null)} sx={{ textTransform: 'none', height: '24px', minWidth: 'auto' }}>
                            Remover
                        </Button>
                    </Box>
                )}

                <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f7ff', borderRadius: '12px', textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        Total: R$ {finalPrice.toFixed(2).replace('.', ',')}
                    </Typography>
                    {appliedCoupon && (
                        <Typography variant="caption" color="success.main" display="block">
                            Desconto do cupom incluso!
                        </Typography>
                    )}
                    <Typography variant="caption" color="textSecondary">
                        * Escolha a forma de pagamento na próxima página
                    </Typography>
                </Box>

                <Box sx={{ mt: 3, p: 2, bgcolor: '#fff9e6', borderRadius: '12px', border: '1px solid #ffeeba' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Termos e Condições</Typography>
                    <Box sx={{ maxHeight: '100px', overflowY: 'auto', mb: 1 }}>
                        <Typography variant="caption" color="textSecondary" component="div">
                            1. Confirmo que as informações de personalização estão corretas. <br />
                            2. Entendo que o prazo de produção é de 3 a 5 dias úteis. <br />
                            3. Estou ciente de que as cores podem sofrer pequenas variações da tela para o impresso. <br />
                            4. Em caso de entrega via Uber, o custo é por conta do cliente.
                        </Typography>
                    </Box>
                    <FormControlLabel
                        control={<Checkbox checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} color="primary" />}
                        label={<Typography variant="caption" sx={{ fontWeight: 600 }}>Li e concordo com os termos e confirmo meu design.</Typography>}
                    />
                </Box>

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={!acceptedTerms || isSaving}
                        onClick={onFinalizar}
                        sx={{
                            py: 2.5,
                            borderRadius: '16px',
                            fontSize: '1.25rem',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            background: 'linear-gradient(45deg, #00b894, #55efc4)',
                            boxShadow: '0 8px 32px rgba(0, 184, 148, 0.3)',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #00a082, #48dbb4)',
                                transform: 'translateY(-4px) scale(1.02)',
                                boxShadow: '0 12px 40px rgba(0, 184, 148, 0.4)',
                            },
                            '&:active': {
                                transform: 'translateY(1px) scale(0.98)',
                            },
                            '&.Mui-disabled': {
                                opacity: 0.6,
                                background: '#e0e0e0',
                                boxShadow: 'none'
                            },
                            animation: acceptedTerms ? 'pulse-button 2s infinite' : 'none',
                        }}
                    >
                        {isSaving ? <CircularProgress size={28} color="inherit" /> : '🚀 Fechar o Pedido Agora'}
                    </Button>
                    <style>
                        {`
                        @keyframes pulse-button {
                            0% { box-shadow: 0 0 0 0 rgba(0, 184, 148, 0.4); }
                            70% { box-shadow: 0 0 0 15px rgba(0, 184, 148, 0); }
                            100% { box-shadow: 0 0 0 0 rgba(0, 184, 148, 0); }
                        }
                        `}
                    </style>
                </Box>
            </Paper>

            {showScene && (
                <ScenePreview labelUrl={previewUrl} onClose={() => setShowScene(false)} />
            )}
        </Box>
    );
};

export default ReviewStep;
