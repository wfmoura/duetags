import React, { useContext } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { AppContext } from '../contexts/AppContext';

const temas = [
  { id: 1, nome: 'Tema 1', backgroundImage: 'images/tema1.png' },
  { id: 2, nome: 'Tema 2', backgroundImage: 'images/tema2.png' },
  // Adicione mais temas conforme necessário...
];

function ThemeSelection() {
  const { setSelectedTheme } = useContext(AppContext);

  const handleThemeSelection = (theme) => {
    setSelectedTheme(theme);
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Escolha o tema das suas etiquetas</Typography>
      {temas.map((theme) => (
        <Box key={theme.id} mb={2}>
          <Button variant="contained" onClick={() => handleThemeSelection(theme)}>
            {theme.nome}
          </Button>
        </Box>
      ))}
    </Box>
  );
}

export default ThemeSelection;