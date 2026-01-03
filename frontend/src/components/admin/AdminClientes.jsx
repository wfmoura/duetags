import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    TextField,
    InputAdornment,
    Chip,
    CircularProgress,
    Tooltip,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Divider,
    Button,
    Grid,
    FormControl,
    Select,
    InputLabel,
    FormControlLabel,
    MenuItem
} from '@mui/material';
import {
    Search as SearchIcon,
    WhatsApp as WhatsAppIcon,
    Visibility as ViewIcon,
    FilterList as FilterIcon,
    Email as EmailIcon,
    Smartphone as PhoneIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import supabase from '../../utils/supabaseClient';
import { useSnackbar } from 'notistack';
import MaskedInput from '../MaskedInput';

const AdminClientes = () => {
    const [clientes, setClientes] = useState([]);
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [clienteOrders, setClienteOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const [formState, setFormState] = useState({
        id: null,
        name: '',
        email: '',
        phone: '',
        cpf: '',
        address_cep: '',
        address_street: '',
        address_number: '',
        address_complement: '',
        address_neighborhood: '',
        address_city: '',
        address_state: '',
        password: '',
        role: 'user'
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('name');
            if (error) throw error;
            setClientes(data);
            setFilteredClientes(data);
        } catch (error) {
            console.error('Error loading clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const filtered = clientes.filter(c =>
            (c.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (c.phone?.includes(searchTerm)) ||
            (c.cpf?.includes(searchTerm))
        );
        setFilteredClientes(filtered);
    }, [searchTerm, clientes]);

    const handleViewDetails = async (cliente) => {
        setSelectedCliente(cliente);
        setLoadingOrders(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('id, created_at, status, total_amount')
                .eq('user_id', cliente.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setClienteOrders(data);
        } catch (err) {
            console.error('Error loading orders:', err);
        } finally {
            setLoadingOrders(false);
        }
    };

    const getWhatsAppLink = (phone) => {
        if (!phone) return null;
        const cleanPhone = phone.replace(/\D/g, '');
        const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
        return `https://api.whatsapp.com/send?phone=${finalPhone}`;
    };

    const handleOpenForm = (cliente = null) => {
        if (cliente) {
            setFormState({
                id: cliente.id,
                name: cliente.name || '',
                email: cliente.email || '',
                phone: cliente.phone || '',
                cpf: cliente.cpf || '',
                address_cep: cliente.address_cep || '',
                address_street: cliente.address_street || '',
                address_number: cliente.address_number || '',
                address_complement: cliente.address_complement || '',
                address_neighborhood: cliente.address_neighborhood || '',
                address_city: cliente.address_city || '',
                address_state: cliente.address_state || '',
                password: '',
                role: cliente.role || 'user'
            });
            setIsEditing(true);
        } else {
            setFormState({
                id: null,
                name: '',
                email: '',
                phone: '',
                cpf: '',
                address_cep: '',
                address_street: '',
                address_number: '',
                address_complement: '',
                address_neighborhood: '',
                address_city: '',
                address_state: '',
                password: '',
                role: 'user'
            });
            setIsEditing(false);
        }
        setOpenModal(true);
    };

    const handleSaveCliente = async () => {
        if (!formState.name || !formState.phone || !formState.email) {
            enqueueSnackbar('Nome, E-mail e Telefone são obrigatórios!', { variant: 'warning' });
            return;
        }

        if (!isEditing && !formState.password) {
            enqueueSnackbar('Senha é obrigatória para novos usuários!', { variant: 'warning' });
            return;
        }

        setSaving(true);
        try {
            const { password, role, id, ...profileData } = formState;

            // Call Edge Function to manage user and profile
            const { data, error } = await supabase.functions.invoke('admin-manage-user', {
                body: {
                    action: 'upsert_user',
                    userData: {
                        id: formState.id,
                        email: formState.email,
                        password: password || undefined,
                        role: role
                    },
                    profileData: profileData
                }
            });

            if (error) {
                console.error('Invoke error:', error);
                throw error;
            }
            if (data.error) throw new Error(data.error);

            enqueueSnackbar(`Cliente ${isEditing ? 'atualizado' : 'criado'} com sucesso!`, { variant: 'success' });
            setOpenModal(false);
            loadData();
        } catch (error) {
            console.error('Detailed error saving cliente:', error);
            const errorMsg = error.context?.error?.message || error.message || 'Erro inesperado ao salvar cliente.';
            enqueueSnackbar(errorMsg, { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCliente = async (e, id) => {
        if (e) e.stopPropagation();
        if (!window.confirm('Tem certeza que deseja excluir este cliente? Isso removerá o acesso e o perfil.')) return;
        try {
            const { data, error } = await supabase.functions.invoke('admin-manage-user', {
                body: {
                    action: 'delete_user',
                    userData: { id }
                }
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            enqueueSnackbar('Cliente e acesso excluídos com sucesso!', { variant: 'success' });
            loadData();
        } catch (error) {
            console.error('Error deleting cliente:', error);
            const errorMsg = error.message || 'Erro ao excluir cliente.';
            enqueueSnackbar(errorMsg, { variant: 'error' });
        }
    };

    const handleCEPBlur = async () => {
        const cep = formState.address_cep?.replace(/\D/g, '');
        if (cep?.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormState(prev => ({
                        ...prev,
                        address_street: data.logradouro,
                        address_neighborhood: data.bairro,
                        address_city: data.localidade,
                        address_state: data.uf
                    }));
                }
            } catch (err) {
                console.error('Erro ao buscar CEP:', err);
            }
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">Gestão de Clientes</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenForm(null)}
                    sx={{ bgcolor: '#2956a4', borderRadius: '8px' }}
                >
                    Novo Cliente
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', display: 'flex', gap: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar por nome, telefone ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>E-mail</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>CPF</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Telefone</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Cidade/Estado</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Papel</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : filteredClientes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                    Nenhum cliente encontrado.
                                </TableCell>
                            </TableRow>
                        ) : filteredClientes.map((cliente) => (
                            <TableRow key={cliente.id} hover>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <Avatar sx={{ bgcolor: '#2956a4', width: 32, height: 32, fontSize: '0.875rem' }}>
                                            {cliente.name?.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">{cliente.name}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption" color="textSecondary">{cliente.email}</Typography>
                                </TableCell>
                                <TableCell>{cliente.cpf || '-'}</TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <Typography variant="body2">{cliente.phone || '-'}</Typography>
                                        {cliente.phone && (
                                            <IconButton
                                                size="small"
                                                href={getWhatsAppLink(cliente.phone)}
                                                target="_blank"
                                                sx={{ color: '#25D366' }}
                                            >
                                                <WhatsAppIcon fontSize="inherit" />
                                            </IconButton>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {cliente.address_city || '-'}{cliente.address_state ? `/${cliente.address_state}` : ''}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={cliente.role?.toUpperCase()}
                                        size="small"
                                        color={cliente.role === 'admin' ? 'error' : 'primary'}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Box display="flex" justifyContent="flex-end" gap={0.5}>
                                        <Tooltip title="Ver Pedidos">
                                            <IconButton onClick={() => handleViewDetails(cliente)} color="primary" size="small">
                                                <ViewIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Editar Cadastro">
                                            <IconButton onClick={() => handleOpenForm(cliente)} color="info" size="small">
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Excluir Cliente">
                                            <IconButton onClick={(e) => handleDeleteCliente(e, cliente.id)} color="error" size="small">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de Detalhes */}
            <Dialog open={!!selectedCliente} onClose={() => setSelectedCliente(null)} maxWidth="sm" fullWidth>
                {selectedCliente && (
                    <>
                        <DialogTitle>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ bgcolor: '#2956a4' }}>{selectedCliente.name?.charAt(0).toUpperCase()}</Avatar>
                                <Box>
                                    <Typography variant="h6">{selectedCliente.name}</Typography>
                                    <Typography variant="caption" color="textSecondary">{selectedCliente.role === 'admin' ? 'Administrador' : 'Cliente'}</Typography>
                                </Box>
                            </Box>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Box display="flex" flexDirection="column" gap={2} mb={3}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <EmailIcon fontSize="small" color="action" />
                                    <Typography variant="body2">{selectedCliente.email}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <PhoneIcon fontSize="small" color="action" />
                                    <Typography variant="body2">{selectedCliente.phone || 'N/A'}</Typography>
                                </Box>
                                <Box sx={{ mt: 1, p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">Endereço de Entrega:</Typography>
                                    {selectedCliente.address_street ? (
                                        <Typography variant="body2">
                                            {selectedCliente.address_street}, {selectedCliente.address_number}<br />
                                            {selectedCliente.address_complement && `${selectedCliente.address_complement} - `}{selectedCliente.address_neighborhood}<br />
                                            {selectedCliente.address_city}/{selectedCliente.address_state} - CEP: {selectedCliente.address_cep}
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" color="textSecondary" fontStyle="italic">
                                            Nenhum endereço cadastrado.
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Histórico de Pedidos:</Typography>
                            {loadingOrders ? (
                                <Box display="flex" justifyContent="center" p={3}><CircularProgress size={24} /></Box>
                            ) : clienteOrders.length === 0 ? (
                                <Typography variant="body2" color="textSecondary">Nenhum pedido realizado.</Typography>
                            ) : (
                                <List disablePadding>
                                    {clienteOrders.map((order, index) => (
                                        <React.Fragment key={order.id}>
                                            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                                <ListItemText
                                                    primary={`Pedido #${order.id.slice(0, 8)}`}
                                                    secondary={
                                                        <>
                                                            <Typography component="span" variant="body2" color="textPrimary">
                                                                R$ {parseFloat(order.total_amount).toFixed(2)}
                                                            </Typography>
                                                            {` — ${new Date(order.created_at).toLocaleDateString()}`}
                                                            <Box mt={0.5}>
                                                                <Chip label={order.status.toUpperCase()} size="small" variant="outlined" sx={{ fontSize: '0.625rem' }} />
                                                            </Box>
                                                        </>
                                                    }
                                                />
                                            </ListItem>
                                            {index < clienteOrders.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </DialogContent>
                    </>
                )}
            </Dialog>

            {/* Modal de Cadastro/Edição */}
            <Dialog open={openModal} onClose={() => !saving && setOpenModal(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {isEditing ? `Editar Cliente: ${formState.name}` : 'Novo Cliente'}
                    <IconButton onClick={() => setOpenModal(false)} disabled={saving} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box component="form" sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>Dados Pessoais</Typography>
                        <Grid container spacing={2} mb={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="Nome Completo *" required
                                    value={formState.name}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="E-mail *" required
                                    value={formState.email}
                                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="Telefone *" required
                                    value={formState.phone}
                                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                                    helperText="Ex: 11999999999"
                                    InputProps={{
                                        inputComponent: MaskedInput,
                                        inputProps: { mask: '(00) 00000-0000' }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="CPF"
                                    value={formState.cpf}
                                    onChange={(e) => setFormState({ ...formState, cpf: e.target.value })}
                                    InputProps={{
                                        inputComponent: MaskedInput,
                                        inputProps: { mask: '000.000.000-00' }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Typography variant="subtitle2" color="secondary" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>Acesso ao Sistema</Typography>
                        <Grid container spacing={2} mb={4}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Papel / Perfil *</InputLabel>
                                    <Select
                                        value={formState.role}
                                        label="Papel / Perfil *"
                                        onChange={(e) => setFormState({ ...formState, role: e.target.value })}
                                    >
                                        <MenuItem value="user">Usuário Comum (Cliente)</MenuItem>
                                        <MenuItem value="admin">Administrador</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={isEditing ? "Nova Senha (opcional)" : "Senha *"}
                                    type="password"
                                    required={!isEditing}
                                    value={formState.password}
                                    onChange={(e) => setFormState({ ...formState, password: e.target.value })}
                                    helperText={isEditing ? "Deixe em branco para manter a atual" : "Mínimo 6 caracteres"}
                                />
                            </Grid>
                        </Grid>

                        <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>Endereço de Entrega (Opcional)</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth label="CEP"
                                    value={formState.address_cep}
                                    onChange={(e) => setFormState({ ...formState, address_cep: e.target.value })}
                                    onBlur={handleCEPBlur}
                                    InputProps={{
                                        inputComponent: MaskedInput,
                                        inputProps: { mask: '00000-000' }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    fullWidth label="Rua/Logradouro"
                                    value={formState.address_street}
                                    onChange={(e) => setFormState({ ...formState, address_street: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth label="Número"
                                    value={formState.address_number}
                                    onChange={(e) => setFormState({ ...formState, address_number: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth label="Bairro"
                                    value={formState.address_neighborhood}
                                    onChange={(e) => setFormState({ ...formState, address_neighborhood: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    fullWidth label="Complemento"
                                    value={formState.address_complement}
                                    onChange={(e) => setFormState({ ...formState, address_complement: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    fullWidth label="Cidade"
                                    value={formState.address_city}
                                    onChange={(e) => setFormState({ ...formState, address_city: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth label="Estado"
                                    value={formState.address_state}
                                    onChange={(e) => setFormState({ ...formState, address_state: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenModal(false)} disabled={saving}>Cancelar</Button>
                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                        onClick={handleSaveCliente}
                        disabled={saving}
                        sx={{ bgcolor: '#2956a4', borderRadius: '8px', px: 4 }}
                    >
                        {saving ? 'Salvando...' : 'Salvar Cliente'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminClientes;
