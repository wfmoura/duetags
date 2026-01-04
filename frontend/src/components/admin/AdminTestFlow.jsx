import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Divider,
    Stack,
    CircularProgress,
    Card,
    CardContent,
    Alert,
    Stepper,
    Step,
    StepLabel,
    Grid
} from '@mui/material';
import {
    Science as ScienceIcon,
    DeleteSweep as DeleteIcon,
    Email as EmailIcon,
    Storage as StorageIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import supabase from '../../utils/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useProduct } from '../../contexts/ProductContext';

const AdminTestFlow = () => {
    const { user } = useAuth();
    const { kits, temas } = useProduct();
    const { enqueueSnackbar } = useSnackbar();

    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(-1);
    const [testOrderId, setTestOrderId] = useState(null);
    const [logs, setLogs] = useState([]);

    const steps = [
        'Preparando Dados',
        'Simulando Upload de Arte',
        'Criando Registro no Banco',
        'Disparando E-mails de Produção',
        'Concluído'
    ];

    const addLog = (msg) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    };

    const runTestFlow = async () => {
        if (!kits.length || !temas.length) {
            enqueueSnackbar('Dados de produtos não carregados ainda.', { variant: 'error' });
            return;
        }

        setLoading(true);
        setLogs([]);
        setActiveStep(0);
        addLog('Iniciando teste de fluxo completo...');

        try {
            // 1. Prepare Data
            const testKit = kits[0];
            const testTema = temas[0];
            addLog(`Usando Kit: ${testKit.nome} e Tema: ${testTema.nome}`);
            await new Promise(r => setTimeout(r, 800));
            setActiveStep(1);

            // 2. Simulate Asset Upload (using a placeholder or existing asset)
            addLog('Simulando assets de produção...');
            const dummyImageUrl = testTema.thumbnail; // Use existing for test
            await new Promise(r => setTimeout(r, 800));
            setActiveStep(2);

            // 3. Create DB Entry
            addLog('Criando pedido de teste no banco...');
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    kit_id: String(testKit.id),
                    kit_nome: testKit.nome,
                    kit_preco: testKit.preco || 0,
                    total_amount: testKit.preco || 0,
                    tema_id: String(testTema.id),
                    tema_nome: testTema.nome,
                    original_asset_url: dummyImageUrl,
                    etiquetas_urls: [dummyImageUrl],
                    status: 'pending',
                    customer_email: user.email,
                    customer_name: `TESTE - ${user.name || 'Admin'}`,
                    customer_phone: user.phone || '999999999',
                    payment_method: 'pix',
                    is_test: true, // Marker for cleanup
                    customizations: {
                        nome: "ESTE É UM TESTE",
                        corFundo: "#FF0000",
                        textColor: "#FFFFFF"
                    }
                })
                .select()
                .single();

            if (orderError) throw orderError;
            setTestOrderId(order.id);
            addLog(`Pedido criado com ID: ${order.id}`);
            await new Promise(r => setTimeout(r, 800));
            setActiveStep(3);

            // 4. Trigger Email
            addLog('Disparando e-mail de produção (send-order-email)...');
            const { data: emailData, error: emailError } = await supabase.functions.invoke('send-order-email', {
                body: { orderId: order.id, target: 'production' }
            });

            if (emailError) throw emailError;
            addLog('E-mail enviado com sucesso!');
            await new Promise(r => setTimeout(r, 800));
            setActiveStep(4);

            enqueueSnackbar('Fluxo de teste concluído com sucesso!', { variant: 'success' });
        } catch (error) {
            console.error('Test Flow Error:', error);
            addLog(`ERRO: ${error.message}`);
            enqueueSnackbar('Falha no teste de fluxo.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const cleanupTestData = async () => {
        setLoading(true);
        addLog('Limpando dados de teste...');
        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('is_test', true);

            if (error) throw error;

            addLog('Todos os pedidos marcados como IS_TEST foram removidos.');
            setTestOrderId(null);
            setActiveStep(-1);
            enqueueSnackbar('Limpeza concluída!', { variant: 'success' });
        } catch (error) {
            addLog(`Erro na limpeza: ${error.message}`);
            enqueueSnackbar('Erro ao limpar dados.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Utilitário de Teste de Fluxo
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                Gere um pedido completo (Registro no Banco + E-mail de Produção) para validar o pipeline sem precisar passar pelo checkout do cliente.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 4, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Stepper activeStep={activeStep} orientation="vertical">
                            {steps.map((label, index) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        <Divider />

                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ScienceIcon />}
                                onClick={runTestFlow}
                                disabled={loading}
                                size="large"
                            >
                                Iniciar Teste Completo
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={cleanupTestData}
                                disabled={loading}
                            >
                                Limpar Dados de Teste
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Card sx={{ bgcolor: '#1e1e1e', color: '#00ff00', minHeight: 400, borderRadius: 4 }}>
                        <CardContent>
                            <Typography variant="subtitle2" sx={{ color: '#fff', mb: 2, borderBottom: '1px solid #333', pb: 1 }}>
                                LOG DO SISTEMA
                            </Typography>
                            <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
                                {logs.length === 0 && (
                                    <Typography variant="caption" sx={{ opacity: 0.5 }}>
                                        Aguardando início do teste...
                                    </Typography>
                                )}
                                {logs.map((log, i) => (
                                    <Typography key={i} variant="caption" component="div" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                                        {`> ${log}`}
                                    </Typography>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {testOrderId && !loading && activeStep === 4 && (
                <Alert icon={<CheckCircleIcon fontSize="inherit" />} severity="success" sx={{ mt: 3, borderRadius: 4 }}>
                    Teste concluído! O pedido gerado foi o <strong>#{testOrderId.slice(0, 8)}</strong>.
                    Você pode conferi-lo na aba "Início (Analytics)" ou na lista de pedidos geral.
                </Alert>
            )}
        </Box>
    );
};

export default AdminTestFlow;
