import React, { useState } from 'react';
import { Box, Typography, Button, Paper, ToggleButton, ToggleButtonGroup, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';

const MOCKUPS = {
    notebook: {
        name: 'Caderno Escolar',
        bg: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        shape: (labelUrl) => (
            <Box sx={{
                width: 320,
                height: 420,
                bgcolor: '#2c3e50',
                borderRadius: '4px 24px 24px 4px',
                position: 'relative',
                boxShadow: '0 30px 60px rgba(0,0,0,0.2), inset 0 0 100px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                borderLeft: '20px solid #1a252f',
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0, left: 20, right: 0, bottom: 0,
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 10%, transparent 90%, rgba(0,0,0,0.1) 100%)',
                    pointerEvents: 'none'
                }
            }}>
                {/* Spiral rings simulation */}
                <Box sx={{
                    position: 'absolute',
                    left: 4,
                    top: '5%',
                    bottom: '5%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                    zIndex: 2
                }}>
                    {[...Array(20)].map((_, i) => (
                        <Box key={i} sx={{ width: 12, height: 4, bgcolor: '#95a5a6', borderRadius: 2, boxShadow: '1px 1px 2px rgba(0,0,0,0.5)' }} />
                    ))}
                </Box>

                {/* The Label */}
                <Box sx={{
                    width: 200,
                    height: 140,
                    backgroundImage: `url(${labelUrl})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
                    transform: 'rotate(-1deg) translateY(20px)',
                    zIndex: 3,
                    borderRadius: '4px',
                }} />

                <Typography sx={{ position: 'absolute', bottom: 30, right: 30, color: 'white', opacity: 0.3, fontWeight: 900, fontSize: '1.5rem', letterSpacing: 2 }}>
                    NOTES
                </Typography>
            </Box>
        )
    },
    bottle: {
        name: 'Garrafa de Água',
        bg: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
        shape: (labelUrl) => (
            <Box sx={{
                width: 180,
                height: 480,
                bgcolor: '#ffffff',
                borderRadius: '60px 60px 20px 20px',
                position: 'relative',
                boxShadow: '0 40px 80px rgba(0,0,0,0.1), inset -10px 0 20px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.05)',
            }}>
                {/* Bottle Cap */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    width: 80,
                    height: 50,
                    bgcolor: '#34495e',
                    borderRadius: '10px 10px 2px 2px',
                    boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.3)',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 10, left: 10, right: 10, height: 2, bgcolor: 'rgba(255,255,255,0.1)'
                    }
                }} />

                {/* Neck */}
                <Box sx={{ position: 'absolute', top: 50, width: 70, height: 40, bgcolor: '#fdfdfd', borderBottom: '1px solid #eee' }} />

                {/* The Label (Wrapped look simulated) */}
                <Box sx={{
                    width: '100%',
                    height: 120,
                    backgroundImage: `url(${labelUrl})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    zIndex: 2,
                    mt: 8,
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0, left: 0, bottom: 0, width: '15%',
                        background: 'linear-gradient(to right, rgba(0,0,0,0.1), transparent)',
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0, right: 0, bottom: 0, width: '15%',
                        background: 'linear-gradient(to left, rgba(0,0,0,0.1), transparent)',
                    }
                }} />

                {/* Reflection Highlight */}
                <Box sx={{
                    position: 'absolute',
                    left: '25%',
                    top: '15%',
                    bottom: '10%',
                    width: 30,
                    background: 'linear-gradient(to right, rgba(255,255,255,0.8), transparent)',
                    zIndex: 1,
                    opacity: 0.6,
                    borderRadius: 50
                }} />
            </Box>
        )
    },
    pencilcase: {
        name: 'Estojo',
        bg: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
        shape: (labelUrl) => (
            <Box sx={{
                width: 380,
                height: 140,
                bgcolor: '#e53e3e',
                borderRadius: '40px',
                position: 'relative',
                boxShadow: '0 25px 50px rgba(229, 62, 62, 0.3), inset 0 0 40px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {/* Zipper simulation */}
                <Box sx={{
                    position: 'absolute',
                    top: '20%',
                    left: '10%',
                    right: '10%',
                    height: 4,
                    bgcolor: 'rgba(0,0,0,0.2)',
                    borderRadius: 2,
                }}>
                    <Box sx={{ position: 'absolute', left: '20%', top: -6, width: 20, height: 16, bgcolor: '#cbd5e0', borderRadius: 1 }} />
                </Box>

                {/* The Label */}
                <Box sx={{
                    width: 100,
                    height: 60,
                    backgroundImage: `url(${labelUrl})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    zIndex: 2,
                    borderRadius: '6px',
                    bgcolor: '#fff',
                    p: 0.5,
                    transform: 'rotate(2deg) translateY(10px)'
                }} />

                {/* Fabric texture hint */}
                <Box sx={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.05,
                    backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                    backgroundSize: '4px 4px',
                    pointerEvents: 'none',
                    borderRadius: '40px'
                }} />
            </Box>
        )
    }
};

const ScenePreview = ({ labelUrl, onClose }) => {
    const [activeMockup, setActiveMockup] = useState('notebook');

    return (
        <Box sx={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            bgcolor: 'rgba(255,255,255,0.95)',
            zIndex: 11000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            backdropFilter: 'blur(10px)'
        }}>
            <IconButton
                onClick={onClose}
                sx={{ position: 'absolute', top: 20, right: 20, bgcolor: 'rgba(0,0,0,0.05)' }}
            >
                <CloseIcon />
            </IconButton>

            <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                Preview Realista
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                Veja como sua etiqueta ficará aplicada nos objetos.
            </Typography>

            <ToggleButtonGroup
                value={activeMockup}
                exclusive
                onChange={(e, val) => val && setActiveMockup(val)}
                sx={{ mb: 6 }}
                color="primary"
            >
                <ToggleButton value="notebook">Caderno</ToggleButton>
                <ToggleButton value="bottle">Garrafa</ToggleButton>
                <ToggleButton value="pencilcase">Estojo</ToggleButton>
            </ToggleButtonGroup>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeMockup}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                >
                    <Box sx={{
                        p: 8,
                        borderRadius: 8,
                        bgcolor: MOCKUPS[activeMockup].bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 500,
                        minHeight: 500
                    }}>
                        {MOCKUPS[activeMockup].shape(labelUrl)}
                    </Box>
                </motion.div>
            </AnimatePresence>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                    * Representação ilustrativa. O resultado final pode variar dependendo do material.
                </Typography>
            </Box>
        </Box>
    );
};

export default ScenePreview;
