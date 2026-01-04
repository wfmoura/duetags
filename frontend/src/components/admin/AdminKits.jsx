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
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    CircularProgress,
    Alert,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import supabase from '../../utils/supabaseClient';

function AdminKits() {
    const [kits, setKits] = useState([]);
    const [etiquetas, setEtiquetas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: kitsData } = await supabase.from('kits').select('*').order('id');
            const { data: etiData } = await supabase.from('etiquetas').select('id, nome');

            // Fetch kit contents
            const { data: contents } = await supabase.from('kit_etiquetas').select('*');

            const kitsWithContents = (kitsData || []).map(k => ({
                ...k,
                etiquetas: (contents || []).filter(c => c.kit_id === k.id)
            }));

            setKits(kitsWithContents);
            setEtiquetas(etiData || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenEdit = (item) => {
        setEditItem(item || {
            nome: '',
            preco: 0,
            thumbnail: '',
            etiquetas: []
        });
        setOpenDialog(true);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const { id, etiquetas: kitEtiquetas, ...kitData } = editItem;

            let kitId = id;
            if (!id) {
                const { data, error: insertError } = await supabase
                    .from('kits')
                    .insert(kitData)
                    .select()
                    .single();
                if (insertError) throw insertError;
                kitId = data.id;
            } else {
                const { error: updateError } = await supabase
                    .from('kits')
                    .update(kitData)
                    .eq('id', id);
                if (updateError) throw updateError;
            }

            // Update associations
            // Delete old ones
            await supabase.from('kit_etiquetas').delete().eq('kit_id', kitId);

            // Insert new ones
            if (kitEtiquetas.length > 0) {
                const toInsert = kitEtiquetas.map(ke => ({
                    kit_id: kitId,
                    etiqueta_id: ke.etiqueta_id,
                    quantidade: ke.quantidade
                }));
                const { error: assocError } = await supabase.from('kit_etiquetas').insert(toInsert);
                if (assocError) throw assocError;
            }

            setOpenDialog(false);
            fetchData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const addEtiquetaRow = () => {
        setEditItem(prev => ({
            ...prev,
            etiquetas: [...prev.etiquetas, { etiqueta_id: etiquetas[0]?.id, quantidade: 1 }]
        }));
    };

    const removeEtiquetaRow = (index) => {
        setEditItem(prev => ({
            ...prev,
            etiquetas: prev.etiquetas.filter((_, i) => i !== index)
        }));
    };

    const updateEtiquetaRow = (index, field, value) => {
        const updated = [...editItem.etiquetas];
        updated[index] = { ...updated[index], [field]: value };
        setEditItem({ ...editItem, etiquetas: updated });
    };

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            const { error: deleteError } = await supabase.from('kits').delete().eq('id', itemToDelete);
            if (deleteError) throw deleteError;
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
            fetchData();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Configuração de Kits</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenEdit(null)}
                >
                    Novo Kit
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Nome</TableCell>
                            <TableCell>Preço</TableCell>
                            <TableCell>Etiquetas Inclusas</TableCell>
                            <TableCell align="right">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {kits.map((k) => (
                            <TableRow key={k.id} hover>
                                <TableCell>{k.id}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{k.nome}</TableCell>
                                <TableCell>R$ {k.preco}</TableCell>
                                <TableCell>
                                    <Box display="flex" gap={0.5} flexWrap="wrap">
                                        {k.etiquetas?.map(e => (
                                            <Chip
                                                key={e.etiqueta_id}
                                                label={`${e.quantidade}x ${e.etiqueta_id}`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpenEdit(k)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteClick(k.id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editItem?.id ? `Editar Kit: ${editItem.nome}` : 'Novo Kit'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={8}>
                            <TextField
                                fullWidth label="Nome do Kit"
                                value={editItem?.nome || ''}
                                onChange={(e) => setEditItem({ ...editItem, nome: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth label="Preço (R$)" type="number"
                                value={editItem?.preco || ''}
                                onChange={(e) => setEditItem({ ...editItem, preco: parseFloat(e.target.value) })}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }}><Chip label="Etiquetas no Kit" size="small" /></Divider>
                        </Grid>

                        {editItem?.etiquetas?.map((row, index) => (
                            <React.Fragment key={index}>
                                <Grid item xs={7}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Etiqueta</InputLabel>
                                        <Select
                                            value={row.etiqueta_id}
                                            label="Etiqueta"
                                            onChange={(e) => updateEtiquetaRow(index, 'etiqueta_id', e.target.value)}
                                        >
                                            {etiquetas.map(e => (
                                                <MenuItem key={e.id} value={e.id}>{e.nome} ({e.id})</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        fullWidth label="Qtd" type="number" size="small"
                                        value={row.quantidade}
                                        onChange={(e) => updateEtiquetaRow(index, 'quantidade', parseInt(e.target.value))}
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <IconButton color="error" onClick={() => removeEtiquetaRow(index)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Grid>
                            </React.Fragment>
                        ))}

                        <Grid item xs={12}>
                            <Button startIcon={<AddIcon />} onClick={addEtiquetaRow} fullWidth variant="dashed" sx={{ border: '1px dashed #ccc' }}>
                                Adicionar Etiqueta
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                        Salvar Kit
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteConfirmOpen} onClose={() => !isDeleting && setDeleteConfirmOpen(false)}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Excluir Kit</DialogTitle>
                <DialogContent>
                    <Typography>Tem certeza que deseja excluir este kit? Esta ação não pode ser desfeita.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>Cancelar</Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        disabled={isDeleting}
                        startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                    >
                        Excluir
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default AdminKits;
