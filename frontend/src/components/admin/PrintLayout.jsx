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

    // Helper to divide labels into pages, STRICTLY grouping by size/ID
    const paginateLabels = () => {
        const MARGIN_CM = 1.0;
        const HEADER_HEIGHT_CM = 1.5; // Even more compact
        const FOOTER_HEIGHT_CM = 0.5;
        const GAP_CM = 0.15; // Tighter gap (1.5mm)
        const BLEED_CM = 0.2; // 2mm total (1mm per side)

        const usableWidth = currentFormat.widthCm - (MARGIN_CM * 2);
        const usableHeight = currentFormat.heightCm - (MARGIN_CM * 2) - HEADER_HEIGHT_CM - FOOTER_HEIGHT_CM;

        // 1. Group labels by their size ID
        const groupedLabels = {};
        order.etiquetas_urls?.forEach((url, index) => {
            const kitEtiqueta = kitInfo[index];
            const def = etiquetas.find(e => e.id === kitEtiqueta?.id);
            const sizeId = kitEtiqueta?.id || 'unknown';

            if (!groupedLabels[sizeId]) groupedLabels[sizeId] = [];

            const quantidade = kitEtiqueta?.quantidade || 1;
            const originalWidth = def?.width || 5;
            const originalHeight = def?.height || 3;
            const finalWidth = originalWidth + BLEED_CM;
            const finalHeight = originalHeight + BLEED_CM;

            // Get border radius from DB (handle percentage strings or numbers)
            let borderRadius = def?.border_radius;
            if (def?.tipo === 'redonda') borderRadius = '50%';
            else if (borderRadius && !String(borderRadius).includes('%')) borderRadius = `${borderRadius}mm`;
            else if (!borderRadius) borderRadius = '0';

            // Find background color for bleed
            const meta = order.label_metadata?.find(m => m.etiqueta_nome === def?.nome);
            const bgColor = meta?.background?.color || order.customizations?.corFundo || '#ffffff';

            for (let i = 0; i < quantidade; i++) {
                groupedLabels[sizeId].push({
                    url,
                    width: finalWidth,
                    height: finalHeight,
                    originalWidth,
                    originalHeight,
                    borderRadius,
                    bgColor,
                    tipo: def?.tipo,
                    nome: def?.nome || 'Etiqueta'
                });
            }
        });

        const pages = [];

        // 2. Process each size group into pages
        Object.keys(groupedLabels).forEach(sizeId => {
            const labelsOfThisSize = groupedLabels[sizeId];
            let currentPage = [];
            let currentY = 0;
            let currentRowH = 0;
            let currentRowW = 0;

            labelsOfThisSize.forEach((label) => {
                // Check if label fits in current row
                if (currentRowW + label.width + GAP_CM > usableWidth) {
                    currentY += currentRowH + GAP_CM;
                    currentRowW = 0;
                    currentRowH = 0;
                }

                // Check if label fits in current page
                if (currentY + label.height + GAP_CM > usableHeight) {
                    pages.push({ sizeName: label.nome, labels: currentPage });
                    currentPage = [];
                    currentY = 0;
                    currentRowW = 0;
                    currentRowH = 0;
                }

                currentPage.push(label);
                currentRowW += label.width + GAP_CM;
                currentRowH = Math.max(currentRowH, label.height);
            });

            if (currentPage.length > 0) {
                pages.push({ sizeName: labelsOfThisSize[0].nome, labels: currentPage });
            }
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
                {labelPages.map((pageData, pageIndex) => (
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
                            gap: '2mm', // Tighter gap for production
                            position: 'relative'
                        }}
                    >
                        {/* Ultra Compact Header Information */}
                        <Box sx={{ width: '100%', mb: 0.5, borderBottom: '1.2px solid #000', pb: 0.2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '0.85rem', lineHeight: 1 }}>DueTags - {pageData.sizeName} (+Bordas Sangria)</Typography>
                                <Typography variant="caption" sx={{ fontSize: '9px' }}>Pedido: #{order.id.slice(0, 8)} | Data: {new Date(order.created_at).toLocaleDateString()}</Typography>
                            </Box>
                            <Box textAlign="right">
                                <Typography variant="caption" display="block" sx={{ fontSize: '9px', lineHeight: 1 }}>Página {pageIndex + 1} de {labelPages.length}</Typography>
                                <Typography variant="caption" sx={{ fontSize: '9px' }}><strong>Cliente:</strong> {order.customer_email.split('@')[0]}</Typography>
                            </Box>
                        </Box>

                        {pageData.labels.map((label, lIdx) => (
                            <Box
                                key={`${pageIndex}-${lIdx}`}
                                sx={{
                                    width: `${label.width}cm`,
                                    height: `${label.height}cm`,
                                    position: 'relative',
                                    backgroundColor: label.bgColor, // Use extracted color for bleed area
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Professional CutContour (Corel style) - EXACTLY at original dimensions */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        width: `${label.originalWidth}cm`,
                                        height: `${label.originalHeight}cm`,
                                        border: '0.088mm solid #ff0080', // ~0.25pt Magenta/Red
                                        borderRadius: label.borderRadius,
                                        zIndex: 10,
                                        pointerEvents: 'none'
                                    }}
                                />
                                <img
                                    src={label.url}
                                    alt="Label"
                                    crossOrigin="anonymous"
                                    style={{
                                        width: `${label.originalWidth}cm`, // EXACT dimension to avoid shift
                                        height: `${label.originalHeight}cm`,
                                        objectFit: 'contain', // No crop, perfect fit
                                        borderRadius: label.borderRadius,
                                        display: 'block'
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
