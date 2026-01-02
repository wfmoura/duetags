import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Divider,
    ToggleButtonGroup,
    ToggleButton,
    Tooltip,
    IconButton,
    Alert,
    Slider,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    FormControlLabel,
    Switch
} from '@mui/material';
import {
    FormatBold as FormatBoldIcon,
    FormatItalic as FormatItalicIcon,
    Info as InfoIcon,
    RestartAlt as ResetIcon,
    TextIncrease as TextSizeIcon,
    Inventory as KitIcon,
    Palette as ThemeIcon,
    ExpandMore as ExpandMoreIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import Etiquetas from '../Etiquetas';
import { calculateFontSize } from '../../utils/labelUtils';
import FontSelector from '../FontSelector';
import ModernColorPicker from '../CmykColorPicker';
import { useAuth } from '../../contexts/AuthContext';

const CustomizationStep = ({
    selectedKit,
    selectedTheme,
    customizations,
    setCustomizations,
    camposNecessarios,
    errors,
    labelPositions,
    handleLabelPositionChange,
    fontesDisponiveis,
    onChangeStep,
    setSelectedKit,
    etiquetas
}) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [showLimitAlert, setShowLimitAlert] = React.useState(false);

    const handleFormatChange = (event, newFormats) => {
        setCustomizations({
            ...customizations,
            isBold: newFormats.includes('bold'),
            isItalic: newFormats.includes('italic'),
        });
    };

    const validateAndSetField = (fieldName, value) => {
        if (!selectedKit || !selectedKit.etiquetas) {
            setCustomizations({ ...customizations, [fieldName]: value });
            return;
        }

        // Se está deletando, sempre permite
        if (value.length < (customizations[fieldName]?.length || 0)) {
            setCustomizations({ ...customizations, [fieldName]: value });
            setShowLimitAlert(false);
            return;
        }

        let canAdd = true;
        for (const etiqueta of selectedKit.etiquetas) {
            if (!etiqueta.area_delimitada) continue;
            if (!etiqueta.campos?.includes(fieldName)) continue;

            const fields = etiqueta.campos || [];
            const activeFieldsCount = fields.filter(f =>
                f === fieldName ? (value.length > 0) : (customizations[f]?.length > 0)
            ).length;

            const maxHeightCm = (etiqueta.area_delimitada.height || 1) / (activeFieldsCount || 1);
            const maxWidthCm = etiqueta.area_delimitada.width || 1;

            const fontSize = calculateFontSize(
                value,
                maxWidthCm,
                maxHeightCm,
                fieldName,
                etiqueta[`max_font_size_${fieldName}`] || etiqueta.maxFontSize?.[fieldName] || 40,
                customizations.fontSizeScale || 1,
                etiqueta.escala_extra_fonte || 1,
                etiqueta.tipo
            );

            // Se o tamanho da fonte chegou no mínimo E o texto ainda estoura a largura, bloqueia
            const charWidthRatio = 0.52; // Mesma heurística do calculateFontSize
            const estimatedWidthCm = value.length * fontSize * charWidthRatio / 37.8;

            if (fontSize <= 10.1 && estimatedWidthCm > (maxWidthCm * 0.95)) {
                canAdd = false;
                break;
            }
        }

        if (canAdd) {
            setCustomizations({ ...customizations, [fieldName]: value });
            setShowLimitAlert(false);
        } else {
            setShowLimitAlert(true);
            // Hide alert after 3 seconds
            setTimeout(() => setShowLimitAlert(false), 3000);
        }
    };

    return (
        <Grid container spacing={4}>
            {/* Left Column: Controls */}
            <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ p: 3, position: { xs: 'relative', md: 'sticky' }, top: { md: 20 } }}>
                    <Typography variant="h6" gutterBottom>
                        Suas Escolhas
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                            <Button
                                fullWidth
                                size="large"
                                variant="contained"
                                startIcon={<KitIcon />}
                                onClick={() => {
                                    setSelectedKit(null);
                                    onChangeStep(0);
                                }}
                                sx={{
                                    flexDirection: 'column', py: 1.5, fontSize: '0.75rem',
                                    bgcolor: 'rgba(0,0,0,0.05)', color: 'text.primary',
                                    borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)',
                                    '&:hover': { bgcolor: 'primary.main', color: 'white' },
                                    boxShadow: 'none'
                                }}
                            >
                                Alterar Kit
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                fullWidth
                                size="large"
                                variant="contained"
                                startIcon={<ThemeIcon />}
                                onClick={() => onChangeStep(0)}
                                sx={{
                                    flexDirection: 'column', py: 1.5, fontSize: '0.75rem',
                                    bgcolor: 'rgba(0,0,0,0.05)', color: 'text.primary',
                                    borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)',
                                    '&:hover': { bgcolor: 'secondary.main', color: 'white' },
                                    boxShadow: 'none'
                                }}
                            >
                                Alterar Tema
                            </Button>
                        </Grid>
                    </Grid>

                    <Divider sx={{ mb: 2 }} />

                    <Typography variant="h6" gutterBottom>
                        Edite suas informações
                    </Typography>

                    {showLimitAlert && (
                        <Alert severity="warning" sx={{ mb: 2, borderRadius: '8px' }}>
                            Limite de caracteres atingido para este formato de etiqueta.
                        </Alert>
                    )}

                    {camposNecessarios.includes("nome") && (
                        <TextField
                            label="Nome (Linha1)"
                            value={customizations.nome}
                            onChange={(e) => validateAndSetField('nome', e.target.value)}
                            fullWidth
                            margin="normal"
                            error={!!errors.nome}
                            helperText={errors.nome}
                            required
                        />
                    )}

                    {camposNecessarios.includes("complemento") && (
                        <TextField
                            label="Linha 2 (opcional)"
                            value={customizations.complemento}
                            onChange={(e) => validateAndSetField('complemento', e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                    )}

                    {camposNecessarios.includes("turma") && (
                        <TextField
                            label="Linha 3 (opcional)"
                            value={customizations.turma}
                            onChange={(e) => validateAndSetField('turma', e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" gutterBottom>Estilo do Texto</Typography>
                    <Box mb={2}>
                        <ToggleButtonGroup
                            value={[
                                customizations.isBold ? 'bold' : null,
                                customizations.isItalic ? 'italic' : null
                            ].filter(Boolean)}
                            onChange={handleFormatChange}
                            aria-label="text formatting"
                            size="small"
                        >
                            <ToggleButton value="bold" aria-label="bold">
                                <FormatBoldIcon />
                            </ToggleButton>
                            <ToggleButton value="italic" aria-label="italic">
                                <FormatItalicIcon />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                    <FontSelector
                        fontesDisponiveis={fontesDisponiveis}
                        selectedFont={customizations.fontFamily}
                        onSelectFont={(font) => setCustomizations({ ...customizations, fontFamily: font })}
                    />

                    <Box mt={3}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TextSizeIcon fontSize="small" /> Tamanho do Texto
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {Math.round((customizations.fontSizeScale || 1) * 100)}%
                            </Typography>
                        </Box>
                        <Slider
                            value={customizations.fontSizeScale || 1}
                            min={0.5}
                            max={2.5}
                            step={0.05}
                            onChange={(e, newValue) => setCustomizations({ ...customizations, fontSizeScale: newValue })}
                            sx={{ color: 'primary.main' }}
                        />
                        {isAdmin && (
                            <Button
                                size="small"
                                startIcon={<ResetIcon />}
                                onClick={() => {
                                    // Reset positions and scale
                                    setCustomizations({ ...customizations, fontSizeScale: 1 });
                                    // Reset all field positions to null to force recalculated defaults
                                    Object.keys(labelPositions).forEach(key => {
                                        handleLabelPositionChange(key, 'nome', null);
                                        handleLabelPositionChange(key, 'complemento', null);
                                        handleLabelPositionChange(key, 'turma', null);
                                    });
                                }}
                                sx={{ mt: 1, textTransform: 'none' }}
                            >
                                Resetar posição e tamanho
                            </Button>
                        )}
                    </Box>

                    <Box mt={3}>
                        <ModernColorPicker
                            title="Cor de Fundo da Etiqueta"
                            selectedColor={customizations.corFundo}
                            onColorSelect={(color) => setCustomizations({ ...customizations, corFundo: color })}
                        />
                    </Box>

                    <Box mt={3}>
                        <ModernColorPicker
                            title="Cor dos Textos"
                            selectedColor={customizations.textColor}
                            onColorSelect={(color) => setCustomizations({ ...customizations, textColor: color })}
                        />
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {isAdmin && (
                        <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon fontSize="small" />}
                                sx={{ px: 0, minHeight: 0, '& .MuiAccordionSummary-content': { my: 1 } }}
                            >
                                <Box display="flex" alignItems="center" gap={1}>
                                    <SettingsIcon fontSize="small" color="action" />
                                    <Typography variant="subtitle2" color="textSecondary">Opções Avançadas</Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 0 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            size="small"
                                            checked={customizations.enableAura || false}
                                            onChange={(e) => setCustomizations({ ...customizations, enableAura: e.target.checked })}
                                        />
                                    }
                                    label={<Typography variant="body2">Efeito de Background (Aura)</Typography>}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            size="small"
                                            checked={customizations.showAreaBorder || false}
                                            onChange={(e) => setCustomizations({ ...customizations, showAreaBorder: e.target.checked })}
                                        />
                                    }
                                    label={<Typography variant="body2">Mostrar Área de Movimentação</Typography>}
                                />
                                <Typography variant="caption" display="block" color="textSecondary" sx={{ ml: 6 }}>
                                    Ativa guias visuais para a área segura de texto e efeitos especiais.
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    )}
                </Paper>
            </Grid>

            {/* Right Column: Live Preview */}
            <Grid item xs={12} md={8}>
                <Box sx={{ bgcolor: '#f5f5f5', p: { xs: 2, md: 3 }, borderRadius: 2, minHeight: '500px' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography variant="h6" color="textSecondary">
                            Prévia em Tempo Real
                        </Typography>
                        <Tooltip title="O texto é posicionado automaticamente no centro para garantir a qualidade. Use o slider de tamanho para ajustes.">
                            <IconButton size="small">
                                <InfoIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Box id="etiquetas-preview-container" display="flex" flexDirection="column" alignItems="center" sx={{ width: '100%', overflowX: 'auto' }}>
                        <Box sx={{ mb: 2, p: 1.5, bgcolor: '#e3f2fd', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #bbdefb', width: '100%' }}>
                            <InfoIcon color="primary" fontSize="small" />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                                💡 Dica: Você pode arrastar o texto ou a imagem nas etiquetas acima para ajustar a posição!
                            </Typography>
                        </Box>
                        <Etiquetas
                            kit={selectedKit}
                            theme={selectedTheme}
                            customizations={customizations}
                            zoom={window.innerWidth < 640 ? 1.0 : 1.5}
                            positions={labelPositions}
                            onPositionChange={handleLabelPositionChange}
                            etiquetas={etiquetas}
                        />
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
};

export default CustomizationStep;
