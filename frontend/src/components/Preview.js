import React, { useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { AppContext } from '../contexts/AppContext';
import Etiquetas from './Etiquetas';

function Preview() {
  const { selectedKit, selectedTheme, customizations } = useContext(AppContext);

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Prévia das Etiquetas</Typography>
      {selectedKit && selectedTheme ? (
        <Etiquetas kit={selectedKit} theme={selectedTheme} customizations={customizations} zoom={1.5} />
      ) : (
        <Typography variant="body1">Nenhum kit ou tema selecionado.</Typography>
      )}
    </Box>
  );
}

export default Preview;