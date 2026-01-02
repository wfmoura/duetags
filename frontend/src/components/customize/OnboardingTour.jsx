import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, MobileStepper, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import OpenWithIcon from '@mui/icons-material/OpenWith';

const steps = [
    {
        label: 'Crie com IA ou Temas',
        description: 'Comece escolhendo um tema pronto ou use nossa IA para criar um personagem exclusivo apenas descrevendo o que você imagina.',
        icon: <AutoFixHighIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    },
    {
        label: 'Personalize Tudo',
        description: 'Altere nomes, fontes e cores. Nossa IA sugere as melhores combinações automaticamente para você.',
        icon: <TextFieldsIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
    },
    {
        label: 'Arraste e Ajuste',
        description: 'Toque nos elementos para mover, redimensionar ou girar. Você tem total liberdade para deixar do seu jeito!',
        icon: <OpenWithIcon sx={{ fontSize: 40, color: 'success.main' }} />,
    },
];

const OnboardingTour = ({ onComplete }) => {
    const [activeStep, setActiveStep] = useState(0);
    const theme = useTheme();

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            localStorage.setItem('hasSeenOnboarding', 'true');
            onComplete();
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    return (
        <Box sx={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            bgcolor: 'rgba(0,0,0,0.7)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            backdropFilter: 'blur(8px)'
        }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Paper elevation={10} sx={{
                        maxWidth: 400,
                        p: 4,
                        borderRadius: 4,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.05)', mb: 1 }}>
                            {steps[activeStep].icon}
                        </Box>

                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {steps[activeStep].label}
                        </Typography>

                        <Typography variant="body1" color="text.secondary">
                            {steps[activeStep].description}
                        </Typography>

                        <MobileStepper
                            variant="dots"
                            steps={steps.length}
                            position="static"
                            activeStep={activeStep}
                            sx={{ bgcolor: 'transparent', flexGrow: 1, mt: 2 }}
                            nextButton={
                                <Button size="large" onClick={handleNext} variant="contained" sx={{ borderRadius: 2, px: 4 }}>
                                    {activeStep === steps.length - 1 ? 'Começar Agora!' : 'Próximo'}
                                </Button>
                            }
                            backButton={null}
                        />
                    </Paper>
                </motion.div>
            </AnimatePresence>
        </Box>
    );
};

export default OnboardingTour;
