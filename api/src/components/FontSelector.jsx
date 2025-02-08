// components/FontSelector.jsx
import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const FontSelector = ({ fontesDisponiveis, selectedFont, onSelectFont }) => {
  // Verifica se fontesDisponiveis é um objeto válido
  if (!fontesDisponiveis || typeof fontesDisponiveis !== 'object') {
    return <Typography variant="body1">Nenhuma fonte disponível.</Typography>;
  }

  return (
    <Box display="flex" flexWrap="wrap" gap={2}>
      {Object.entries(fontesDisponiveis).map(([nomeFonte, valorFonte]) => (
        <Card
          key={nomeFonte}
          onClick={() => onSelectFont(valorFonte)}
          sx={{
            cursor: 'pointer',
            border: selectedFont === valorFonte ? '2px solid #4CAF50' : '1px solid #ccc',
            borderRadius: '8px',
            transition: 'border-color 0.2s, transform 0.2s',
            '&:hover': {
              transform: 'scale(1.05)',
              borderColor: '#4CAF50',
            },
            width: '100%',
            '@media (min-width: 768px)': {
              width: '200px',
            },
          }}
        >
          <CardContent>
            <Typography variant="body1" sx={{ fontFamily: valorFonte }}>
              {nomeFonte}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default FontSelector;