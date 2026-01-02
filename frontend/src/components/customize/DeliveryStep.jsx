import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Grid,
    CircularProgress,
    InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import StoreIcon from '@mui/icons-material/Store';

const DeliveryStep = ({ deliveryInfo, onUpdate, deliveryMethod, onUpdateMethod }) => {
    const [loadingCep, setLoadingCep] = useState(false);

    const handleCepChange = async (e) => {
        const cep = e.target.value.replace(/\D/g, '');
        onUpdate({ ...deliveryInfo, cep });

        if (cep.length === 8) {
            setLoadingCep(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();

                if (!data.erro) {
                    onUpdate({
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

    const handleChange = (field) => (e) => {
        onUpdate({ ...deliveryInfo, [field]: e.target.value });
    };

    return (
        <Box sx={{ maxWidth: '600px', mx: 'auto', p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                Opções de Entrega
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Como você deseja receber suas etiquetas?
            </Typography>

            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                    <Box
                        onClick={() => onUpdateMethod('pickup')}
                        sx={{
                            p: 3,
                            border: '2px solid',
                            borderColor: deliveryMethod === 'pickup' ? 'primary.main' : 'rgba(0,0,0,0.08)',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            bgcolor: deliveryMethod === 'pickup' ? 'rgba(41, 86, 164, 0.05)' : 'white',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' }
                        }}
                    >
                        <StoreIcon color={deliveryMethod === 'pickup' ? 'primary' : 'disabled'} sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Retirada Grátis</Typography>
                        <Typography variant="caption" color="textSecondary">
                            Brasília - Setor Noroeste<br />SQNW 103 Bloco A
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Box
                        onClick={() => onUpdateMethod('uber')}
                        sx={{
                            p: 3,
                            border: '2px solid',
                            borderColor: deliveryMethod === 'uber' ? 'primary.main' : 'rgba(0,0,0,0.08)',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            bgcolor: deliveryMethod === 'uber' ? 'rgba(41, 86, 164, 0.05)' : 'white',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' }
                        }}
                    >
                        <DirectionsCarIcon color={deliveryMethod === 'uber' ? 'primary' : 'disabled'} sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Entrega via Uber</Typography>
                        <Typography variant="caption" color="textSecondary">
                            A pedido do cliente.<br />Frete a combinar.
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            {deliveryMethod === 'uber' && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                        Endereço de Entrega
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="CEP"
                                value={deliveryInfo.cep || ''}
                                onChange={handleCepChange}
                                placeholder="00000-000"
                                variant="outlined"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {loadingCep ? <CircularProgress size={20} /> : <SearchIcon color="action" />}
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} />
                        <Grid item xs={12} sm={9}>
                            <TextField
                                fullWidth
                                label="Rua / Logradouro"
                                value={deliveryInfo.rua || ''}
                                onChange={handleChange('rua')}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="Número"
                                value={deliveryInfo.numero || ''}
                                onChange={handleChange('numero')}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Complemento"
                                value={deliveryInfo.complemento || ''}
                                onChange={handleChange('complemento')}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Bairro"
                                value={deliveryInfo.bairro || ''}
                                onChange={handleChange('bairro')}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Cidade"
                                value={deliveryInfo.cidade || ''}
                                onChange={handleChange('cidade')}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField
                                fullWidth
                                label="UF"
                                value={deliveryInfo.estado || ''}
                                onChange={handleChange('estado')}
                                variant="outlined"
                                inputProps={{ maxLength: 2 }}
                            />
                        </Grid>
                    </Grid>
                </Box>
            )}
        </Box>
    );
};

export default DeliveryStep;
