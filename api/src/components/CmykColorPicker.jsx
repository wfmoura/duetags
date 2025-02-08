import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import tinycolor from 'tinycolor2';

// Cores CMYK pré-definidas (em formato HEX para exibição)
const cmykColors = [
  { c: 0, m: 0, y: 0, k: 0, hex: '#FFFFFF', label: '' }, // Branco
  { c: 0, m: 0, y: 0, k: 100, hex: '#000000', label: '' }, // Preto
  { c: 0, m: 40, y: 0, k: 0, hex: '#f6adcd', label: '' }, // Ciano
  { c: 0, m: 40, y: 20, k: 0, hex: '#f8abad', label: '' }, // Magenta
  { c: 0, m: 60, y: 40, k: 0, hex: '#f48580', label: '' }, // Amarelo
  { c: 91, m: 74, y: 2, k: 0, hex: '#2956A4', label: '' }, // Ciano + Magenta
  { c: 1, m: 33, y: 7, k: 0, hex: '#f6bac8', label: '' }, // Ciano + Amarelo
  { c: 0, m: 21, y: 47, k: 0, hex: '#ffcd90', label: '' }, // Magenta + Amarelo
  { c: 36, m: 47, y: 0, k: 0, hex: '#a68cc3', label: '' }, // Ciano + Magenta + Amarelo
  { c: 6, m: 4, y: 53, k: 0, hex: '#f3e893', label: '' }, // Cinza
  { c: 53, m: 15, y: 83, k: 1, hex: '#86ad56', label: '' }, // Cinza
];

function CmykColorPicker({ selectedColor, onColorSelect, title }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {cmykColors.map((color, index) => (
          <Grid item key={index} xs={4} sm={3} md={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                backgroundColor: color.hex,
                border: selectedColor === color.hex ? '3px solid #4CAF50' : '1px solid #ccc',
                borderRadius: '50%',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: '#4CAF50',
                },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tinycolor(color.hex).isLight() ? 'black' : 'white',
              }}
              onClick={() => onColorSelect(color.hex, color)}
            >
              <Typography variant="body2" sx={{ fontSize: '0.75rem', textAlign: 'center' }}>
                {color.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default CmykColorPicker;