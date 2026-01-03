import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Switch,
    FormControlLabel,
    Chip,
    CircularProgress,
    Tooltip,
    Autocomplete
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Refresh as RefreshIcon,
    Person as PersonIcon,
    Public as PublicIcon
} from '@mui/icons-material';
import supabase from '../../utils/supabaseClient';
import { useSnackbar } from 'notistack';

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const { enqueueSnackbar } = useSnackbar();

    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percentage',
        value: 0,
        expires_at: '',
        active: true,
        user_id: null,
        max_uses: '',
        description: ''
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [couponsResponse, profilesResponse] = await Promise.all([
                supabase.from('coupons').select('*, profiles(name, phone)').order('created_at', { ascending: false }),
                supabase.from('profiles').select('id, name, phone, cpf')
            ]);

            if (couponsResponse.error) throw couponsResponse.error;
            if (profilesResponse.error) throw profilesResponse.error;

            setCoupons(couponsResponse.data);
            setProfiles(profilesResponse.data);
        } catch (error) {
            console.error('Error loading coupons:', error);
            enqueueSnackbar('Erro ao carregar cupons', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenDialog = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code,
                discount_type: coupon.discount_type,
                value: coupon.value,
                expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : '',
                active: coupon.active,
                user_id: coupon.user_id,
                max_uses: coupon.max_uses || '',
                description: coupon.description || ''
            });
        } else {
            setEditingCoupon(null);
            setFormData({
                code: '',
                discount_type: 'percentage',
                value: 0,
                expires_at: '',
                active: true,
                user_id: null,
                max_uses: '',
                description: ''
            });
        }
        setOpenDialog(true);
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                code: formData.code.toUpperCase(),
                max_uses: formData.max_uses === '' ? null : parseInt(formData.max_uses),
                expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null
            };

            if (editingCoupon) {
                const { error } = await supabase
                    .from('coupons')
                    .update(payload)
                    .eq('id', editingCoupon.id);
                if (error) throw error;
                enqueueSnackbar('Cupom atualizado com sucesso', { variant: 'success' });
            } else {
                const { error } = await supabase
                    .from('coupons')
                    .insert([payload]);
                if (error) throw error;
                enqueueSnackbar('Cupom criado com sucesso', { variant: 'success' });
            }
            setOpenDialog(false);
            loadData();
        } catch (error) {
            console.error('Error saving coupon:', error);
            enqueueSnackbar('Erro ao salvar cupom', { variant: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este cupom?')) return;
        try {
            const { error } = await supabase.from('coupons').delete().eq('id', id);
            if (error) throw error;
            enqueueSnackbar('Cupom excluído com sucesso', { variant: 'success' });
            loadData();
        } catch (error) {
            console.error('Error deleting coupon:', error);
            enqueueSnackbar('Erro ao excluir cupom', { variant: 'error' });
        }
    };

    const toggleActive = async (coupon) => {
        try {
            const { error } = await supabase
                .from('coupons')
                .update({ active: !coupon.active })
                .eq('id', coupon.id);
            if (error) throw error;
            loadData();
        } catch (error) {
            console.error('Error toggling active status:', error);
            enqueueSnackbar('Erro ao alterar status', { variant: 'error' });
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">Gestão de Cupons</Typography>
                <Box>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={loadData}
                        sx={{ mr: 1 }}
                    >
                        Atualizar
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        sx={{ bgcolor: '#2956a4', '&:hover': { bgcolor: '#1a3a73' } }}
                    >
                        Novo Cupom
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tipo / Valor</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Destinatário</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Limite de Uso</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Expiração</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : coupons.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                    Nenhum cupom encontrado.
                                </TableCell>
                            </TableRow>
                        ) : coupons.map((coupon) => (
                            <TableRow key={coupon.id} hover>
                                <TableCell>
                                    <Typography variant="body1" fontWeight="bold" sx={{ color: '#2956a4' }}>
                                        {coupon.code}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {coupon.description}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={coupon.discount_type === 'percentage' ? `${coupon.value}%` : `R$ ${coupon.value}`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    {coupon.user_id ? (
                                        <Tooltip title={`CPF: ${coupon.profiles?.cpf || 'N/A'}`}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <PersonIcon fontSize="small" color="action" />
                                                <Typography variant="body2">{coupon.profiles?.name || 'Cliente'}</Typography>
                                            </Box>
                                        </Tooltip>
                                    ) : (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <PublicIcon fontSize="small" color="action" />
                                            <Typography variant="body2">Público Geral</Typography>
                                        </Box>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Box>
                                        <Typography variant="body2">{coupon.usage_count} / {coupon.max_uses || '∞'}</Typography>
                                        {coupon.max_uses && (
                                            <Box sx={{ width: '100%', bgcolor: '#eee', height: 4, borderRadius: 2, mt: 0.5 }}>
                                                <Box
                                                    sx={{
                                                        width: `${Math.min((coupon.usage_count / coupon.max_uses) * 100, 100)}%`,
                                                        bgcolor: (coupon.usage_count >= coupon.max_uses) ? '#f44336' : '#4caf50',
                                                        height: '100%',
                                                        borderRadius: 2
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Sem Expiração'}
                                </TableCell>
                                <TableCell>
                                    <Switch
                                        checked={coupon.active}
                                        onChange={() => toggleActive(coupon)}
                                        color="primary"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpenDialog(coupon)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(coupon.id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Código do Cupom"
                            fullWidth
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="EX: DUETAGS10"
                        />
                        <TextField
                            label="Descrição"
                            fullWidth
                            multiline
                            rows={2}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                select
                                label="Tipo de Desconto"
                                value={formData.discount_type}
                                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                sx={{ flex: 1 }}
                            >
                                <MenuItem value="percentage">Porcentagem (%)</MenuItem>
                                <MenuItem value="fixed">Valor Fixo (R$)</MenuItem>
                            </TextField>
                            <TextField
                                label="Valor"
                                type="number"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                                sx={{ flex: 1 }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Data de Expiração"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={formData.expires_at}
                                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                            />
                            <TextField
                                label="Limite de Uso"
                                type="number"
                                fullWidth
                                value={formData.max_uses}
                                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                                placeholder="Vazio para ilimitado"
                            />
                        </Box>

                        <Autocomplete
                            options={profiles}
                            getOptionLabel={(option) => `${option.name} (${option.phone || 'Sem Telefone'})`}
                            value={profiles.find(p => p.id === formData.user_id) || null}
                            onChange={(event, newValue) => {
                                setFormData({ ...formData, user_id: newValue ? newValue.id : null });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Cliente Específico (Opcional)"
                                    placeholder="Deixe vazio para cupom público"
                                />
                            )}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                />
                            }
                            label="Cupom Ativo"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={!formData.code || formData.value <= 0}
                        sx={{ bgcolor: '#2956a4' }}
                    >
                        Salvar Cupom
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminCoupons;
