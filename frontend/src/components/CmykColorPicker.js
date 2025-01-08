import React from 'react';
import { Box, Typography, Grid } from '@mui/material';

// Cores CMYK pré-definidas (em formato HEX para exibição)
const cmykColors = [
  { c: 0, m: 0, y: 0, k: 0, hex: '#FFFFFF' }, // Branco
  { c: 0, m: 0, y: 0, k: 100, hex: '#000000' }, // Preto
  { c: 100, m: 0, y: 0, k: 0, hex: '#00FFFF' }, // Ciano
  { c: 0, m: 100, y: 0, k: 0, hex: '#FF00FF' }, // Magenta
  { c: 0, m: 0, y: 100, k: 0, hex: '#FFFF00' }, // Amarelo
  { c: 100, m: 100, y: 0, k: 0, hex: '#00FFFF' }, // Ciano + Magenta
  { c: 100, m: 0, y: 100, k: 0, hex: '#00FF00' }, // Ciano + Amarelo
  { c: 0, m: 100, y: 100, k: 0, hex: '#FF0000' }, // Magenta + Amarelo
  { c: 100, m: 100, y: 100, k: 0, hex: '#0000FF' }, // Ciano + Magenta + Amarelo
  { c: 0, m: 0, y: 0, k: 50, hex: '#808080' }, // Cinza
];

function CmykColorPicker({ selectedColor, onColorSelect }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Selecione uma cor CMYK:
      </Typography>
      <Grid container spacing={2}>
        {cmykColors.map((color, index) => (
          <Grid item key={index}>
            <Box
              sx={{
                width: 50,
                height: 50,
                backgroundColor: color.hex,
                border: selectedColor === color.hex ? '3px solid #4CAF50' : '1px solid #ccc',
                borderRadius: '5px',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: '#4CAF50',
                },
              }}
              onClick={() => onColorSelect(color.hex, color)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default CmykColorPicker;