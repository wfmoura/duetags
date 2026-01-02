import React, { useState } from 'react';
import { Box, Typography, Button, ToggleButton, ToggleButtonGroup, Paper } from '@mui/material';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const FORMATS = {
    A4: { name: 'A4', width: '210mm', height: '297mm', widthCm: 21, heightCm: 29.7 },
    SUPERB: { name: '13x19 (Super B)', width: '330mm', height: '482mm', widthCm: 33, heightCm: 48.2 }
};

const PrintLayout = ({ order, etiquetas, kits, onClose }) => {
    const [format, setFormat] = useState('A4');
    const [loading, setLoading] = useState(false);

    if (!order || !kits || !etiquetas) return null;

    const currentKit = kits.find(k => String(k.id) === String(order.kit_id));
    const kitInfo = currentKit?.etiquetas || [];
    const currentFormat = FORMATS[format];

    // Helper to divide labels into pages
    const paginateLabels = () => {
        const MARGIN_CM = 2.0; // 10mm each side + safe area
        const HEADER_HEIGHT_CM = 3.5;
        const FOOTER_HEIGHT_CM = 1.0;
        const GAP_CM = 0.3; // 3mm gap

        const usableWidth = currentFormat.widthCm - MARGIN_CM;
        const usableHeight = currentFormat.heightCm - MARGIN_CM - HEADER_HEIGHT_CM - FOOTER_HEIGHT_CM;

        const allLabels = [];
        order.etiquetas_urls?.forEach((url, index) => {
            const kitEtiqueta = kitInfo[index];
            const def = etiquetas.find(e => e.id === kitEtiqueta?.id);
            const quantidade = kitEtiqueta?.quantidade || 1;
            const w = def?.width || 5;
            const h = def?.height || 3;

            for (let i = 0; i < quantidade; i++) {
                allLabels.push({ url, width: w, height: h, tipo: def?.tipo, id: kitEtiqueta?.id });
            }
        });

        const pages = [[]];
        let currentY = 0;
        let currentRowH = 0;
        let currentRowW = 0;

        allLabels.forEach((label) => {
            // Check if label fits in current row
            if (currentRowW + label.width + GAP_CM > usableWidth) {
                // Next row
                currentY += currentRowH + GAP_CM;
                currentRowW = 0;
                currentRowH = 0;
            }

            // Check if label fits in current page
            if (currentY + label.height + GAP_CM > usableHeight) {
                // Next page
                pages.push([]);
                currentY = 0;
                currentRowW = 0;
                currentRowH = 0;
            }

            pages[pages.length - 1].push(label);
            currentRowW += label.width + GAP_CM;
            currentRowH = Math.max(currentRowH, label.height);
        });

        return pages;
    };

    const labelPages = paginateLabels();

    const handleExportPDF = async () => {
        setLoading(true);
        try {
            const pdf = new jsPDF({
                orientation: currentFormat.widthCm > currentFormat.heightCm ? 'l' : 'p',
                unit: 'mm',
                format: [currentFormat.widthCm * 10, currentFormat.heightCm * 10]
            });

            for (let i = 0; i < labelPages.length; i++) {
                const element = document.getElementById(`print-page-${i}`);
                if (!element) continue;

                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.95);

                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, 0, currentFormat.widthCm * 10, currentFormat.heightCm * 10);
            }

            pdf.save(`producao_pedido_${order.id}_${format}.pdf`);
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            bgcolor: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 4,
            overflow: 'auto',
            backdropFilter: 'blur(5px)'
        }}>
            <Paper sx={{ p: 2, mb: 3, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', width: 'fit-content' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Configuração de Impressão</Typography>

                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <Box>
                        <Typography variant="caption" display="block" gutterBottom>TAMANHO DA FOLHA</Typography>
                        <ToggleButtonGroup
                            value={format}
                            exclusive
                            onChange={(e, val) => val && setFormat(val)}
                            size="small"
                        >
                            <ToggleButton value="A4">A4 (Standard)</ToggleButton>
                            <ToggleButton value="SUPERB">13x19 (Gráfica)</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleExportPDF}
                            disabled={loading}
                        >
                            {loading ? 'Gerando...' : 'Baixar PDF para Corte'}
                        </Button>
                        <Button variant="outlined" color="inherit" onClick={onClose}>
                            Fechar
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Sheet Simulation (Multiple Pages) */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {labelPages.map((pageLabels, pageIndex) => (
                    <Box
                        key={pageIndex}
                        id={`print-page-${pageIndex}`}
                        sx={{
                            width: currentFormat.width,
                            height: currentFormat.height,
                            bgcolor: 'white',
                            p: '10mm',
                            boxShadow: '0 0 40px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignContent: 'flex-start',
                            gap: '3mm',
                            position: 'relative'
                        }}
                    >
                        {/* Header Information (Repeated on each page for clarity) */}
                        <Box sx={{ width: '100%', mb: 2, borderBottom: '2px solid #000', pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>DueTags - Ordem de Produção</Typography>
                                <Typography variant="body2">Pedido: #{order.id.slice(0, 8)} | Data: {new Date(order.created_at).toLocaleDateString()}</Typography>
                            </Box>
                            <Box textAlign="right">
                                <Typography variant="body2">Página {pageIndex + 1} de {labelPages.length}</Typography>
                                <Typography variant="body2"><strong>Cliente:</strong> {order.customer_email}</Typography>
                            </Box>
                        </Box>

                        {pageLabels.map((label, lIdx) => (
                            <Box
                                key={`${pageIndex}-${lIdx}`}
                                sx={{
                                    width: `${label.width}cm`,
                                    height: `${label.height}cm`,
                                    position: 'relative',
                                    border: '0.1mm dashed #ccc',
                                    '&::before, &::after': {
                                        content: '""',
                                        position: 'absolute',
                                        width: '2mm',
                                        height: '2mm',
                                        border: '0.2mm solid #000',
                                        opacity: 0.3
                                    },
                                    '&::before': { top: '-1mm', left: '-1mm', borderRight: 0, borderBottom: 0 },
                                    '&::after': { bottom: '-1mm', right: '-1mm', borderLeft: 0, borderTop: 0 }
                                }}
                            >
                                <img
                                    src={label.url}
                                    alt="Label"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        borderRadius: label.tipo === 'redonda' ? '50%' : '1mm'
                                    }}
                                />
                            </Box>
                        ))}

                        {/* Footer Mark */}
                        <Box sx={{
                            position: 'absolute',
                            bottom: '5mm',
                            right: '10mm',
                            opacity: 0.5
                        }}>
                            <Typography variant="caption">Gerado por Antigravity Production System | DueTags.com.br</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default PrintLayout;
