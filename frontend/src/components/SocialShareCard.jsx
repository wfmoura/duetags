import React, { useRef, useState } from 'react';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { Instagram as InstagramIcon, WhatsApp as WhatsAppIcon, Share as ShareIcon } from '@mui/icons-material';
import html2canvas from 'html2canvas';
import { useSnackbar } from 'notistack';

const SocialShareCard = ({ labelUrl, kitName, userName }) => {
    const cardRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const handleShare = async (platform) => {
        if (!cardRef.current) return;
        setIsGenerating(true);

        try {
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                scale: 2,
                backgroundColor: '#ffffff'
            });

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const file = new File([blob], 'minha-duetag.png', { type: 'image/png' });
            const shareText = `Olha que lindas as etiquetas que fiz para o ${userName || 'meu filho'}! Crie as suas também em: https://duetags.com.br`;

            if (platform === 'WhatsApp' && !(/Android|iPhone|iPad/i.test(navigator.userAgent))) {
                // Desktop WhatsApp Web Fallback
                const waUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
                window.open(waUrl, '_blank');
                enqueueSnackbar("Abrindo WhatsApp Web. Lembre-se de anexar a imagem baixada se desejar!", { variant: 'info' });
            } else if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Minhas novas DueTags!',
                    text: shareText,
                });
            } else {
                // Fallback: Download
                const url = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = 'minha-duetag.png';
                link.href = url;
                link.click();

                navigator.clipboard.writeText(shareText);
                alert("Imagem baixada e link copiado! Agora você pode compartilhar no " + platform + ".");
            }
        } catch (error) {
            console.error('Erro ao compartilhar:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            const canvas = await html2canvas(cardRef.current, { useCORS: true, scale: 2 });
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'minha-duetag.png';
            link.href = url;
            link.click();
        } catch (e) { console.error(e); }
        finally { setIsGenerating(false); }
    };

    return (
        <Box sx={{ maxWidth: 400, margin: '20px auto', textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#ff4081' }}>
                🎉 Gostou da sua etiqueta?
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Compartilhe com outras mamães e papais!
            </Typography>

            {/* Hidden Card for Capture */}
            <Box sx={{ position: 'fixed', left: '-9999px', top: 0 }}>
                <Paper
                    ref={cardRef}
                    elevation={0}
                    sx={{
                        width: 500,
                        height: 500,
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 3,
                        background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
                        position: 'relative',
                        border: '10px solid #fff'
                    }}
                >
                    <Typography variant="h4" sx={{ color: '#ff4081', fontWeight: 'bold' }}>DueTags</Typography>

                    <Box sx={{
                        width: 300,
                        height: 180,
                        bgcolor: 'white',
                        borderRadius: 4,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                        border: '1px solid #eee'
                    }}>
                        <img
                            src={labelUrl}
                            alt="Preview"
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                    </Box>

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>{kitName}</Typography>
                        <Typography variant="h6" color="textSecondary">Crie a sua igual em:</Typography>
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>DueTags.com.br</Typography>
                    </Box>

                    {/* Decorative elements */}
                    <Box sx={{ position: 'absolute', top: 20, right: 20, fontSize: 40 }}>✨</Box>
                    <Box sx={{ position: 'absolute', bottom: 20, left: 20, fontSize: 40 }}>🎨</Box>
                </Paper>
            </Box>

            {/* Preview Card */}
            <Paper elevation={2} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff5f8' }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                    <img src={labelUrl} alt="Label Preview" style={{ maxHeight: 100, borderRadius: 8 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <InstagramIcon />}
                        onClick={() => handleShare('Instagram')}
                        disabled={isGenerating}
                        sx={{ bgcolor: '#E1306C', '&:hover': { bgcolor: '#C13584' }, flexGrow: 1 }}
                    >
                        Instagram
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <WhatsAppIcon />}
                        onClick={() => handleShare('WhatsApp')}
                        disabled={isGenerating}
                        sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' }, flexGrow: 1 }}
                    >
                        WhatsApp
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <ShareIcon />}
                        onClick={handleDownload}
                        disabled={isGenerating}
                        sx={{ flexGrow: 1 }}
                    >
                        Baixar Foto
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default SocialShareCard;
