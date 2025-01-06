import React, { useContext, useState } from 'react';
import { Box, TextField, Slider, Typography, Button } from '@mui/material';
import { AppContext } from '../contexts/AppContext';
import Etiquetas from '../components/Etiquetas';
import Navigation from '../components/Navigation';

function Customize() {
  const { selectedKit, selectedTheme, customizations, setCustomizations } = useContext(AppContext);
  const [zoom, setZoom] = useState(1.5);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomizations({ ...customizations, [name]: value });
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Personalize suas etiquetas</Typography>
      <Box mb={4}>
        <TextField
          label="Nome"
          name="nome"
          value={customizations.nome}
          onChange={handleChange}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 20 }}
        />
        <TextField
          label="Complemento"
          name="complemento"
          value={customizations.complemento}
          onChange={handleChange}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 20 }}
        />
        <TextField
          label="Turma"
          name="turma"
          value={customizations.turma}
          onChange={handleChange}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 20 }}
        />
      </Box>
      <Typography id="zoom-slider" gutterBottom>
        Zoom
      </Typography>
      <Slider
        value={zoom}
        onChange={(e, newValue) => setZoom(newValue)}
        min={1}
        max={2}
        step={0.1}
        aria-labelledby="zoom-slider"
        valueLabelDisplay="auto"
      />
      <Etiquetas kit={selectedKit} theme={selectedTheme} customizations={customizations} zoom={zoom} />
      <Navigation prevRoute="/theme" nextRoute="/checkout" />
    </Box>
  );
}

export default Customize;