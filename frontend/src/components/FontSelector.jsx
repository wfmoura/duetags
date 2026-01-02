// components/FontSelector.jsx
import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const FontSelector = ({ fontesDisponiveis, selectedFont, onSelectFont }) => {
  // Verifica se fontesDisponiveis é um objeto válido
  if (!fontesDisponiveis || typeof fontesDisponiveis !== 'object') {
    return <Typography variant="body1">Nenhuma fonte disponível.</Typography>;
  }

  return (
    <Box display="flex" flexWrap="wrap" gap={1}>
      {Object.entries(fontesDisponiveis).map(([nomeFonte, valorFonte]) => (
        <Box
          key={nomeFonte}
          onClick={() => onSelectFont(valorFonte)}
          sx={{
            cursor: 'pointer',
            border: selectedFont === valorFonte ? '2px solid #4CAF50' : '1px solid #e0e0e0',
            borderRadius: '6px',
            padding: '6px 12px',
            backgroundColor: selectedFont === valorFonte ? '#f0f9f0' : '#fff',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: '#4CAF50',
              backgroundColor: '#f5f5f5',
            },
            minWidth: '80px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="body2" sx={{ fontFamily: valorFonte, fontSize: '1rem', lineHeight: 1.2 }}>
            {nomeFonte}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default FontSelector;