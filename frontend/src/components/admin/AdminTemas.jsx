import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Button,
    IconButton,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Tooltip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Collapse
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoveToInbox as MoveIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Category as CategoryIcon,
    AutoAwesome as AutoAwesomeIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import supabase from '../../utils/supabaseClient';
import { useProduct } from '../../contexts/ProductContext';
import { useSnackbar } from 'notistack';

function AdminTemas({ onGoToAiCreation }) {
    const { temas, categorias, refreshData } = useProduct();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);

    // UI State
    const [expandedCategories, setExpandedCategories] = useState({});
    const [selectedThemes, setSelectedThemes] = useState([]);

    // Category Dialog
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({ nome: '', slug: '' });

    // Move Themes Dialog
    const [moveDialogOpen, setMoveDialogOpen] = useState(false);
    const [targetCategoryId, setTargetCategoryId] = useState('');

    const toggleCategory = (catId) => {
        setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
    };

    const handleSelectTheme = (themeId) => {
        setSelectedThemes(prev =>
            prev.includes(themeId) ? prev.filter(id => id !== themeId) : [...prev, themeId]
        );
    };

    const handleSelectAllInCategory = (catId, themes) => {
        const catThemeIds = themes.filter(t => t.categoria_id === catId).map(t => t.id);
        const allSelected = catThemeIds.every(id => selectedThemes.includes(id));

        if (allSelected) {
            setSelectedThemes(prev => prev.filter(id => !catThemeIds.includes(id)));
        } else {
            setSelectedThemes(prev => [...new Set([...prev, ...catThemeIds])]);
        }
    };

    const handleOpenCategoryDialog = (cat = null) => {
        if (cat) {
            setEditingCategory(cat);
            setCategoryForm({ nome: cat.nome, slug: cat.slug || '' });
        } else {
            setEditingCategory(null);
            setCategoryForm({ nome: '', slug: '' });
        }
        setCategoryDialogOpen(true);
    };

    const handleSaveCategory = async () => {
        if (!categoryForm.nome) return;
        setLoading(true);
        try {
            const slug = categoryForm.slug || categoryForm.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');

            if (editingCategory) {
                const { error } = await supabase.from('tema_categorias').update({ nome: categoryForm.nome, slug }).eq('id', editingCategory.id);
                if (error) throw error;
                enqueueSnackbar('Categoria atualizada!', { variant: 'success' });
            } else {
                const { error } = await supabase.from('tema_categorias').insert({ nome: categoryForm.nome, slug });
                if (error) throw error;
                enqueueSnackbar('Categoria criada!', { variant: 'success' });
            }
            setCategoryDialogOpen(false);
            refreshData();
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (catId) => {
        if (!window.confirm('Tem certeza? Temas nesta categoria ficarão sem categoria.')) return;
        try {
            const { error } = await supabase.from('tema_categorias').delete().eq('id', catId);
            if (error) throw error;
            enqueueSnackbar('Categoria excluída!', { variant: 'success' });
            refreshData();
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        }
    };

    const handleMoveThemes = async () => {
        if (!targetCategoryId || selectedThemes.length === 0) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('temas')
                .update({ categoria_id: targetCategoryId })
                .in('id', selectedThemes);

            if (error) throw error;
            enqueueSnackbar(`${selectedThemes.length} tema(s) movido(s)!`, { variant: 'success' });
            setSelectedThemes([]);
            setMoveDialogOpen(false);
            refreshData();
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Gerenciar Temas</Typography>
                <Box gap={2} display="flex">
                    <Button
                        variant="outlined"
                        startIcon={<CategoryIcon />}
                        onClick={() => handleOpenCategoryDialog()}
                    >
                        Nova Categoria
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<AutoAwesomeIcon />}
                        onClick={onGoToAiCreation}
                    >
                        Criar com IA
                    </Button>
                </Box>
            </Box>

            {selectedThemes.length > 0 && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                        {selectedThemes.length} tema(s) selecionado(s)
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<MoveIcon />}
                        onClick={() => setMoveDialogOpen(true)}
                    >
                        Mover para Categoria
                    </Button>
                </Paper>
            )}

            <Grid container spacing={3}>
                {categorias.map(cat => {
                    const catThemes = temas.filter(t => t.categoria_id === cat.id);
                    const isExpanded = expandedCategories[cat.id] !== false; // Default expanded

                    return (
                        <Grid item xs={12} key={cat.id}>
                            <Paper sx={{ borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden' }}>
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: '#f8f9fa',
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => toggleCategory(cat.id)}
                                >
                                    <Checkbox
                                        checked={catThemes.length > 0 && catThemes.every(t => selectedThemes.includes(t.id))}
                                        indeterminate={catThemes.some(t => selectedThemes.includes(t.id)) && !catThemes.every(t => selectedThemes.includes(t.id))}
                                        onClick={(e) => { e.stopPropagation(); handleSelectAllInCategory(cat.id, temas); }}
                                    />
                                    <Typography variant="h6" sx={{ flexGrow: 1, ml: 1, fontWeight: 700 }}>
                                        {cat.nome} <Typography component="span" color="textSecondary" variant="body2">({catThemes.length} temas)</Typography>
                                    </Typography>
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenCategoryDialog(cat); }}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton sx={{ ml: 1 }}>
                                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                </Box>
                                <Collapse in={isExpanded}>
                                    <Divider />
                                    <Box sx={{ p: 2 }}>
                                        <Grid container spacing={2}>
                                            {catThemes.map(theme => (
                                                <Grid item xs={6} sm={4} md={3} lg={2} key={theme.id}>
                                                    <Card
                                                        sx={{
                                                            position: 'relative',
                                                            borderRadius: '12px',
                                                            border: selectedThemes.includes(theme.id) ? '2px solid #1976d2' : '1px solid #eee',
                                                            transition: '0.2s',
                                                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{ position: 'absolute', top: 5, left: 5, zIndex: 1, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: '50%' }}
                                                            onClick={(e) => { e.stopPropagation(); handleSelectTheme(theme.id); }}
                                                        >
                                                            <Checkbox size="small" checked={selectedThemes.includes(theme.id)} />
                                                        </Box>
                                                        <Box sx={{ height: 120, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                                                            <img src={theme.thumbnail} alt={theme.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </Box>
                                                        <Box sx={{ p: 1, textAlign: 'center' }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {theme.nome}
                                                            </Typography>
                                                        </Box>
                                                    </Card>
                                                </Grid>
                                            ))}
                                            {catThemes.length === 0 && (
                                                <Grid item xs={12}>
                                                    <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
                                                        Nenhum tema nesta categoria. Move temas ou crie novos!
                                                    </Typography>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Box>
                                </Collapse>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Temas sem categoria */}
            {temas.filter(t => !t.categoria_id).length > 0 && (
                <Box mt={4}>
                    <Typography variant="h6" gutterBottom>Temas sem Categoria</Typography>
                    <Grid container spacing={2}>
                        {temas.filter(t => !t.categoria_id).map(theme => (
                            <Grid item xs={6} sm={4} md={3} lg={2} key={theme.id}>
                                <Card sx={{ border: selectedThemes.includes(theme.id) ? '2px solid #1976d2' : '1px solid #eee', position: 'relative' }}>
                                    <Box
                                        sx={{ position: 'absolute', top: 5, left: 5, zIndex: 1, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: '50%' }}
                                        onClick={() => handleSelectTheme(theme.id)}
                                    >
                                        <Checkbox size="small" checked={selectedThemes.includes(theme.id)} />
                                    </Box>
                                    <Box sx={{ height: 120, overflow: 'hidden' }}>
                                        <img src={theme.thumbnail} alt={theme.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </Box>
                                    <Box sx={{ p: 1, textAlign: 'center' }}>
                                        <Typography variant="caption" fontWeight="bold">{theme.nome}</Typography>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Category Edit Dialog */}
            <Dialog open={categoryDialogOpen} onClose={() => !loading && setCategoryDialogOpen(false)}>
                <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
                        <TextField
                            fullWidth
                            label="Nome da Categoria"
                            value={categoryForm.nome}
                            onChange={(e) => setCategoryForm(prev => ({ ...prev, nome: e.target.value }))}
                        />
                        <TextField
                            fullWidth
                            label="Slug (opcional)"
                            placeholder="festa-infantil"
                            value={categoryForm.slug}
                            onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                            helperText="Deixe em branco para gerar automaticamente"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setCategoryDialogOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveCategory} disabled={loading || !categoryForm.nome}>
                        {loading ? <CircularProgress size={24} /> : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Move Themes Dialog */}
            <Dialog open={moveDialogOpen} onClose={() => !loading && setMoveDialogOpen(false)}>
                <DialogTitle>Mover {selectedThemes.length} tema(s)</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, minWidth: 300 }}>
                        <FormControl fullWidth>
                            <InputLabel>Categoria Destino</InputLabel>
                            <Select
                                value={targetCategoryId}
                                label="Categoria Destino"
                                onChange={(e) => setTargetCategoryId(e.target.value)}
                            >
                                {categorias.map(cat => (
                                    <MenuItem key={cat.id} value={cat.id}>{cat.nome}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setMoveDialogOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleMoveThemes} disabled={loading || !targetCategoryId}>
                        {loading ? <CircularProgress size={24} /> : 'Mover Agora'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default AdminTemas;
