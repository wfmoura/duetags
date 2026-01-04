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
    Tooltip,
    Alert,
    FormControlLabel,
    Switch
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import supabase from '../../utils/supabaseClient';

function AdminEtiquetas() {
    const [etiquetas, setEtiquetas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchEtiquetas = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('etiquetas')
            .select('*')
            .order('nome');

        if (error) setError(error.message);
        else setEtiquetas(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchEtiquetas();
    }, []);

    const handleOpenEdit = (item) => {
        setEditItem(item || {
            nome: '',
            width: 5,
            height: 3,
            tipo: 'Retangular',
            border_radius: 0,
            max_font_size_nome: 20,
            max_font_size_complemento: 16,
            max_font_size_turma: 12,
            proporcao_personagem: 0.8,
            distancia_do_rodape: 0,
            distancia_horizontal: 0.2,
            distancia_entre_linhas: 0,
            escala_extra_fonte: 1,
            imagem: true,
            campos: ['nome', 'complemento'],
            area_delimitada: { top: 0.2, left: 1.5, width: 3.3, height: 2.6 }
        });
        setOpenDialog(true);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const { error: saveError } = await supabase
                .from('etiquetas')
                .upsert(editItem);

            if (saveError) throw saveError;

            setOpenDialog(false);
            fetchEtiquetas();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setEditItem(prev => ({ ...prev, [field]: value }));
    };

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            const { error: deleteError } = await supabase.from('etiquetas').delete().eq('id', itemToDelete);
            if (deleteError) throw deleteError;
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
            fetchEtiquetas();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleJsonChange = (field, value) => {
        try {
            const parsed = JSON.parse(value);
            setEditItem(prev => ({ ...prev, [field]: parsed }));
        } catch (e) {
            // Keep as string for editing
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Modelos de Etiquetas</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenEdit(null)}
                    sx={{ borderRadius: '8px' }}
                >
                    Novo Modelo
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Nome</TableCell>
                            <TableCell>Dimensões (cm)</TableCell>
                            <TableCell>Radius (mm)</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell align="right">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {etiquetas.map((e) => (
                            <TableRow key={e.id} hover>
                                <TableCell sx={{ fontWeight: 'bold' }}>{e.id}</TableCell>
                                <TableCell>{e.nome}</TableCell>
                                <TableCell>{e.width} x {e.height}</TableCell>
                                <TableCell>{e.border_radius}mm</TableCell>
                                <TableCell>{e.tipo}</TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Editar Atributos">
                                        <IconButton onClick={() => handleOpenEdit(e)} color="primary">
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Excluir Modelo">
                                        <IconButton onClick={() => handleDeleteClick(e.id)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editItem?.id ? `Editar Modelo: ${editItem.nome}` : 'Novo Modelo de Etiqueta'}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="ID (Slug)"
                                disabled={!!editItem?.id_db} // Assuming we might want to change slug? Actually better keep unique.
                                value={editItem?.id || ''}
                                onChange={(e) => handleChange('id', e.target.value)}
                                helperText="Ex: grande, pequena, redonda"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nome"
                                value={editItem?.nome || ''}
                                onChange={(e) => handleChange('nome', e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth type="number"
                                label="Largura (cm)"
                                value={editItem?.width || ''}
                                onChange={(e) => handleChange('width', parseFloat(e.target.value))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth type="number"
                                label="Altura (cm)"
                                value={editItem?.height || ''}
                                onChange={(e) => handleChange('height', parseFloat(e.target.value))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth type="number"
                                label="Border Radius (mm)"
                                value={editItem?.border_radius || ''}
                                onChange={(e) => handleChange('border_radius', parseFloat(e.target.value))}
                            />
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth type="number"
                                label="Max Font Nome"
                                value={editItem?.max_font_size_nome || ''}
                                onChange={(e) => handleChange('max_font_size_nome', parseInt(e.target.value))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth type="number"
                                label="Max Font Compl."
                                value={editItem?.max_font_size_complemento || ''}
                                onChange={(e) => handleChange('max_font_size_complemento', parseInt(e.target.value))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth type="number"
                                label="Prop. Personagem"
                                value={editItem?.proporcao_personagem || ''}
                                onChange={(e) => handleChange('proporcao_personagem', parseFloat(e.target.value))}
                                inputProps={{ step: 0.1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editItem?.imagem !== false}
                                        onChange={(e) => handleChange('imagem', e.target.checked)}
                                    />
                                }
                                label="Permite Imagem"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Área Delimitada (JSON)"
                                value={JSON.stringify(editItem?.area_delimitada, null, 2)}
                                onChange={(e) => handleJsonChange('area_delimitada', e.target.value)}
                                helperText="Define o retângulo onde o conteúdo pode ser arrastado inicialmente."
                            />
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
                        Salvar Alterações
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteConfirmOpen} onClose={() => !isDeleting && setDeleteConfirmOpen(false)}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Excluir Modelo</DialogTitle>
                <DialogContent>
                    <Typography>Tem certeza que deseja excluir este modelo de etiqueta? Esta ação não pode ser desfeita.</Typography>
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

export default AdminEtiquetas;
