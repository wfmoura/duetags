import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip,
    Alert,
    InputAdornment
} from '@mui/material';
import {
    AutoAwesome as AutoAwesomeIcon,
    Refresh as RefreshIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    ArrowBack as BackIcon,
    Create as CreateIcon
} from '@mui/icons-material';
import { generateThemeImages } from '../../services/aiService';
import { useSnackbar } from 'notistack';
import { useProduct } from '../../contexts/ProductContext';
import supabase from '../../utils/supabaseClient';

function AdminCreateThemeAI({ onBack }) {
    const { enqueueSnackbar } = useSnackbar();
    const { categorias, refreshData } = useProduct();

    // Generation State
    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState([]);
    const [baseSeed, setBaseSeed] = useState(null);
    const [individualGenerating, setIndividualGenerating] = useState({});

    // Save Dialog State
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [saving, setSaving] = useState(false);
    const [themeForm, setThemeForm] = useState({
        nome: '',
        categoria_id: ''
    });

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setGenerating(true);
        setGeneratedImages([]);
        const seed = Math.floor(Math.random() * 2147483647);
        setBaseSeed(seed);
        try {
            const images = await generateThemeImages(prompt, seed);
            setGeneratedImages(images);
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        } finally {
            setGenerating(false);
        }
    };

    const handleRefine = async (index, refinement) => {
        if (!refinement) return;
        const originalBase = generatedImages[index]?.prompt || prompt;
        const promptToUse = `Refine o tema "${originalBase}": ${refinement}. Mantenha rigorosamente o estilo visual, cores e a composição.`;
        const seedToUse = generatedImages[index]?.seed || baseSeed;

        setIndividualGenerating(prev => ({ ...prev, [index]: true }));
        try {
            const result = await generateThemeImages(promptToUse, seedToUse);
            if (result && result.length > 0) {
                setGeneratedImages(prev => {
                    const newList = [...prev];
                    newList[index] = { ...result[0], prompt: promptToUse };
                    return newList;
                });
            }
        } catch (error) {
            enqueueSnackbar("Erro ao refinar imagem.", { variant: 'error' });
        } finally {
            setIndividualGenerating(prev => ({ ...prev, [index]: false }));
        }
    };

    const handleOpenSaveDialog = (image) => {
        setSelectedImage(image);
        // Suggest a name based on the prompt (capitalized first word or limited length)
        const suggestedName = prompt.split(' ').slice(0, 3).join(' ').replace(/[^\w\s]/gi, '').split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        setThemeForm({
            nome: suggestedName || 'Novo Tema IA',
            categoria_id: categorias[0]?.id || ''
        });
        setSaveDialogOpen(true);
    };

    const handleSaveTheme = async () => {
        if (!themeForm.nome || !themeForm.categoria_id || !selectedImage) return;
        setSaving(true);
        try {
            // 1. Convert base64 to Blob
            const response = await fetch(selectedImage.url);
            const blob = await response.blob();

            // 2. Upload to Supabase Storage
            const fileName = `generated/${Date.now()}_theme.png`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('original_assets')
                .upload(fileName, blob, { contentType: 'image/png' });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('original_assets')
                .getPublicUrl(uploadData.path);

            // 3. Insert into public.temas
            const themeId = `ai_theme_${Date.now()}`;
            const { error: dbError } = await supabase
                .from('temas')
                .insert({
                    id: themeId,
                    nome: themeForm.nome,
                    thumbnail: publicUrl,
                    original_asset_url: publicUrl,
                    categoria_id: themeForm.categoria_id,
                    is_ai_generated: true,
                    is_active: true
                });

            if (dbError) throw dbError;

            enqueueSnackbar('Tema criado com sucesso e adicionado à galeria!', { variant: 'success' });
            setSaveDialogOpen(false);
            refreshData();
        } catch (error) {
            enqueueSnackbar('Erro ao salvar tema: ' + error.message, { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Box display="flex" alignItems="center" gap={2} mb={4}>
                <IconButton onClick={onBack}>
                    <BackIcon />
                </IconButton>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Criar Novo Tema com IA</Typography>
            </Box>

            <Paper sx={{ p: 4, borderRadius: '24px', mb: 4, bgcolor: '#f3e5f5', border: '1px solid #e1bee7' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                    O que você gostaria de criar hoje?
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Ex: Astronauta fofo no espaço com planetas coloridos"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                        disabled={generating}
                        variant="outlined"
                        sx={{ bgcolor: 'white', borderRadius: '12px', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleGenerate}
                        disabled={generating || !prompt.trim()}
                        startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                        sx={{
                            px: 4,
                            borderRadius: '12px',
                            bgcolor: '#9c27b0',
                            '&:hover': { bgcolor: '#7b1fa2' },
                            textTransform: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        {generating ? 'Gerando...' : 'Gerar Tema'}
                    </Button>
                </Box>
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                    Dica: Seja específico com cores e estilo para melhores resultados. O fundo será automaticamente removido.
                </Typography>
            </Paper>

            <Grid container spacing={3}>
                {generatedImages.map((image, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Card sx={{ borderRadius: '20px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{
                                height: 350,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: '#f5f5f5',
                                position: 'relative'
                            }}>
                                <img
                                    src={image.url}
                                    alt="Generated Theme"
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                                {individualGenerating[index] && (
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0, left: 0, right: 0, bottom: 0,
                                        bgcolor: 'rgba(255,255,255,0.7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 2
                                    }}>
                                        <CircularProgress color="secondary" />
                                    </Box>
                                )}
                            </Box>
                            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Refinar este design (ex: mude as cores para azul)..."
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                            handleRefine(index, e.target.value.trim());
                                            e.target.value = '';
                                        }
                                    }}
                                    disabled={individualGenerating[index]}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton size="small" component="span" onClick={() => {
                                                    // This would need a ref or state for the input
                                                }}>
                                                    <RefreshIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: '10px' }
                                    }}
                                />
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    startIcon={<CreateIcon />}
                                    onClick={() => handleOpenSaveDialog(image)}
                                    disabled={individualGenerating[index]}
                                    sx={{ borderRadius: '10px', py: 1.5, fontWeight: 'bold' }}
                                >
                                    Criar Novo Tema
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Save Theme Dialog */}
            <Dialog open={saveDialogOpen} onClose={() => !saving && setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Salvar Novo Tema na Galeria</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ width: '100%', paddingTop: '100%', position: 'relative', borderRadius: '12px', overflow: 'hidden', bgcolor: '#f5f5f5', border: '1px solid #eee' }}>
                                <img src={selectedImage?.url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Nome do Tema"
                                    value={themeForm.nome}
                                    onChange={(e) => setThemeForm(prev => ({ ...prev, nome: e.target.value }))}
                                />
                                <FormControl fullWidth>
                                    <InputLabel>Categoria</InputLabel>
                                    <Select
                                        value={themeForm.categoria_id}
                                        label="Categoria"
                                        onChange={(e) => setThemeForm(prev => ({ ...prev, categoria_id: e.target.value }))}
                                    >
                                        {categorias.map(cat => (
                                            <MenuItem key={cat.id} value={cat.id}>{cat.nome}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setSaveDialogOpen(false)} disabled={saving}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveTheme}
                        disabled={saving || !themeForm.nome || !themeForm.categoria_id}
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        sx={{ px: 4, borderRadius: '10px' }}
                    >
                        {saving ? 'Publicando...' : 'Publicar na Galeria'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default AdminCreateThemeAI;
