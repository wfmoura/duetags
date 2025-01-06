import React, { useContext } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { AppContext } from '../contexts/AppContext';

const kits = [
  {
    id: 1,
    nome: 'KIT 1',
    etiquetas: [
      { nome: 'Grande', width: 16 * 37.8, height: 8 * 37.8, tipo: 'Grande', area: { left: 5.8 * 37.8, top: 1.4 * 37.8, width: 9 * 37.8, height: 5 * 37.8 }, campos: ['nome', 'complemento', 'turma'] },
      { nome: 'Pequena', width: 10 * 37.8, height: 2 * 37.8, tipo: 'Pequena', area: { left: 2.2 * 37.8, top: 0.16 * 37.8, width: 7 * 37.8, height: 1.6 * 37.8 }, campos: ['nome'] },
    ],
  },
  {
    id: 2,
    nome: 'KIT 2',
    etiquetas: [
      { nome: 'Intermediária', width: 12 * 37.8, height: 5 * 37.8, tipo: 'Intermediária', area: { left: 0.75 * 5 * 37.8, top: 0.75 * 0.4 * 37.8, width: 0.75 * 8.0 * 37.8, height: 4.2 * 37.8 }, campos: ['nome', 'complemento'] },
      { nome: 'Redonda', width: 5 * 37.8, height: 5 * 37.8, tipo: 'Redonda', area: { left: 0.7 * 37.8, top: 0.8 * 37.8, width: 3.6 * 37.8, height: 2.0 * 37.8 }, campos: ['nome', 'complemento'] },
    ],
  },
  // Adicione mais kits conforme necessário...
];

function KitSelection() {
  const { setSelectedKit } = useContext(AppContext);

  const handleKitSelection = (kit) => {
    setSelectedKit(kit);
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Escolha seu kit de etiquetas</Typography>
      {kits.map((kit) => (
        <Box key={kit.id} mb={2}>
          <Button variant="contained" onClick={() => handleKitSelection(kit)}>
            {kit.nome}
          </Button>
        </Box>
      ))}
    </Box>
  );
}

export default KitSelection;