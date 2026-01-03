import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Tabs, Tab, Fade } from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon, ChevronLeft as BackIcon } from '@mui/icons-material';

const ThemeSelectionStep = ({ temas, categorias, selectedTheme, onSelectTheme, onOpenAiModal, onBackToKits }) => {
    const [activeTab, setActiveTab] = useState('all');

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const filteredTemas = activeTab === 'all'
        ? temas
        : temas.filter(t => t.categoria_id === activeTab || t.categoria?.slug === activeTab);

    return (
        <Box>
            <Box display="flex" justifyContent="center" mb={1}>
                <Button
                    startIcon={<BackIcon />}
                    onClick={onBackToKits}
                    sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
                >
                    Voltar e trocar o Kit
                </Button>
            </Box>

            <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 800, mb: 4, color: '#1a237e' }}>
                Escolha o Tema das etiquetas
            </Typography>

            {/* Categorias Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4, display: 'flex', justifyContent: 'center' }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTab-root': { fontWeight: 'bold', textTransform: 'none', fontSize: '1rem' }
                    }}
                >
                    <Tab label="Todos" value="all" />
                    {categorias.map(cat => (
                        <Tab key={cat.id} label={cat.nome} value={cat.id} />
                    ))}
                </Tabs>
            </Box>

            <Box display="flex" flexWrap="wrap" justifyContent="center" gap={3}>
                {/* Card para Criar com IA - Sempre visível no início ou em todos */}
                {(activeTab === 'all' || activeTab === 'ia') && (
                    <Card
                        onClick={onOpenAiModal}
                        sx={{
                            cursor: "pointer",
                            border: "2px dashed #9c27b0",
                            borderRadius: "16px",
                            width: "200px",
                            transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                            backgroundColor: "#f3e5f5",
                            "&:hover": {
                                transform: "scale(1.05) translateY(-5px)",
                                borderColor: "#7b1fa2",
                                backgroundColor: "#e1bee7",
                                boxShadow: '0 12px 24px rgba(156, 39, 176, 0.2)'
                            },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '220px'
                        }}
                    >
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                            <AutoAwesomeIcon sx={{ fontSize: 60, color: "#9c27b0", mb: 2 }} />
                            <Typography variant="h6" color="primary" sx={{ color: "#9c27b0", fontWeight: 'bold' }}>
                                Criar com IA
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
                                Design único em segundos
                            </Typography>
                        </CardContent>
                    </Card>
                )}

                {filteredTemas.map((theme) => (
                    <Fade in={true} key={theme.id}>
                        <Card
                            onClick={() => onSelectTheme(theme)}
                            sx={{
                                cursor: "pointer",
                                border: selectedTheme?.id === theme.id ? "3px solid #1a237e" : "1px solid #eee",
                                borderRadius: "16px",
                                width: "200px",
                                transition: "all 0.3s",
                                overflow: 'hidden',
                                position: 'relative',
                                "&:hover": {
                                    transform: "scale(1.05) translateY(-5px)",
                                    borderColor: "#1a237e",
                                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                                },
                            }}
                        >
                            <Box sx={{ height: '150px', overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                                <img
                                    src={theme.thumbnail}
                                    alt={theme.nome}
                                    style={{ width: "100%", height: '100%', objectFit: 'cover' }}
                                />
                                {theme.is_ai_generated && (
                                    <Box sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(156, 39, 176, 0.9)', color: 'white', px: 1, borderRadius: 1, fontSize: '10px', fontWeight: 'bold' }}>
                                        IA
                                    </Box>
                                )}
                            </Box>
                            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333' }}>
                                    {theme.nome}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Fade>
                ))}
            </Box>
        </Box>
    );
};

export default ThemeSelectionStep;
