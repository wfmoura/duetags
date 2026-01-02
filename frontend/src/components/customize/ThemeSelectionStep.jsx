import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon, ChevronLeft as BackIcon } from '@mui/icons-material';

const ThemeSelectionStep = ({ temas, selectedTheme, onSelectTheme, onOpenAiModal, onBackToKits }) => {
    return (
        <Box>
            <Box display="flex" justifyContent="center" mb={3}>
                <Button
                    startIcon={<BackIcon />}
                    onClick={onBackToKits}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    Voltar e trocar o Kit selecionado
                </Button>
            </Box>
            <Typography variant="h6" gutterBottom align="center">
                Escolha um Tema
            </Typography>
            <Box display="flex" flexWrap="wrap" justifyContent="center" gap={3}>
                {/* Card para Criar com IA */}
                <Card
                    onClick={onOpenAiModal}
                    sx={{
                        cursor: "pointer",
                        border: "2px dashed #9c27b0",
                        borderRadius: "12px",
                        width: "200px",
                        transition: "all 0.2s",
                        backgroundColor: "#f3e5f5",
                        "&:hover": { transform: "scale(1.05)", borderColor: "#7b1fa2", backgroundColor: "#e1bee7" },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '200px'
                    }}
                >
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <AutoAwesomeIcon sx={{ fontSize: 60, color: "#9c27b0", mb: 2 }} />
                        <Typography variant="h6" color="primary" sx={{ color: "#9c27b0", fontWeight: 'bold' }}>
                            Criar com IA
                        </Typography>
                        <Typography variant="caption" display="block" color="textSecondary">
                            (Beta)
                        </Typography>
                    </CardContent>
                </Card>

                {temas.map((theme) => (
                    <Card
                        key={theme.id}
                        onClick={() => onSelectTheme(theme)}
                        sx={{
                            cursor: "pointer",
                            border: selectedTheme?.id === theme.id ? "3px solid #4CAF50" : "1px solid #eee",
                            borderRadius: "12px",
                            width: "200px",
                            transition: "all 0.2s",
                            "&:hover": { transform: "scale(1.05)", borderColor: "#4CAF50" },
                        }}
                    >
                        <CardContent sx={{ p: 2 }}>
                            <img
                                src={theme.thumbnail}
                                alt={theme.nome}
                                style={{ width: "100%", borderRadius: "8px", height: "auto" }}
                            />
                            <Typography variant="subtitle1" align="center" mt={1}>
                                {theme.nome}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
};

export default ThemeSelectionStep;
