import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    CircularProgress,
    Alert,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    InputAdornment
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PercentIcon from '@mui/icons-material/Percent';
import supabase from '../../utils/supabaseClient';

function AdminSettings() {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [newEmail, setNewEmail] = useState('');

    const fetchSettings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('system_settings')
            .select('*');

        if (!error) {
            const mapped = data.reduce((acc, curr) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {});
            setSettings(mapped);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async (key, value) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('system_settings')
                .upsert({ key, value, updated_at: new Date().toISOString() });

            if (error) throw error;
            setMessage({ type: 'success', text: 'Configuração salva!' });
            fetchSettings();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const addEmail = () => {
        if (!newEmail || !newEmail.includes('@')) return;
        const currentEmails = settings.order_notification_emails || [];
        if (currentEmails.includes(newEmail)) return;

        const updated = [...currentEmails, newEmail];
        handleSave('order_notification_emails', updated);
        setNewEmail('');
    };

    const removeEmail = (email) => {
        const updated = (settings.order_notification_emails || []).filter(e => e !== email);
        handleSave('order_notification_emails', updated);
    };

    if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;

    return (
        <Box maxWidth="md">
            <Typography variant="h6" gutterBottom>Configurações do Sistema</Typography>

            {message && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

            <Grid container spacing={4}>
                {/* PIX Discount */}
                <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #eee', borderRadius: '12px' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Desconto para Pagamento via PIX
                        </Typography>
                        <Box display="flex" gap={2} alignItems="center">
                            <TextField
                                label="Percentual"
                                type="number"
                                size="small"
                                value={settings.pix_discount_percent || 0}
                                onChange={(e) => setSettings({ ...settings, pix_discount_percent: e.target.value })}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    startAdornment: <InputAdornment position="start"><PercentIcon /></InputAdornment>
                                }}
                                sx={{ maxWidth: '150px' }}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<SaveIcon />}
                                onClick={() => handleSave('pix_discount_percent', settings.pix_discount_percent)}
                                disabled={saving}
                            >
                                Aplicar
                            </Button>
                        </Box>
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                            Este valor será aplicado automaticamente no checkout quando o cliente selecionar PIX.
                        </Typography>
                    </Paper>
                </Grid>

                {/* Notification Emails */}
                <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #eee', borderRadius: '12px' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                            E-mails de Notificação de Pedidos
                        </Typography>

                        <Box display="flex" gap={2} sx={{ mb: 2 }}>
                            <TextField
                                fullWidth
                                label="Novo E-mail"
                                size="small"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="exemplo@vendas.com"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>
                                }}
                            />
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={addEmail}
                                disabled={saving}
                            >
                                Adicionar
                            </Button>
                        </Box>

                        <List dense sx={{ bgcolor: '#fafafa', borderRadius: '8px' }}>
                            {(settings.order_notification_emails || []).map((email) => (
                                <ListItem key={email}>
                                    <ListItemText primary={email} />
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" onClick={() => removeEmail(email)} color="error">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                            {(settings.order_notification_emails || []).length === 0 && (
                                <ListItem><ListItemText secondary="Nenhum e-mail configurado." /></ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>

                {/* API Keys & External Services */}
                <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #eee', borderRadius: '12px', opacity: 0.7 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Integrações Externas (Telegram / Zap)
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            As notificações via bot estão configuradas via variáveis de ambiente para segurança.
                        </Typography>
                        <Box display="flex" gap={1}>
                            <Chip label="Telegram Ativo" color="success" size="small" variant="outlined" />
                            <Chip label="SMTP Google Ativo" color="success" size="small" variant="outlined" />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default AdminSettings;
