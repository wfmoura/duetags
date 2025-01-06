import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Etiqueta from './components/Etiqueta';
import { 
  TextField, FormControl, Select, MenuItem, InputLabel, 
  Button, Box, Typography, Slider, Snackbar, Alert, CircularProgress 
} from '@mui/material';
import webfontloader from 'webfontloader';

const Formulario = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background-color: #a7e0d6; /* Verde água */
  border: 1px solid #ccc;
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
`;

const EtiquetasContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;
  background-color: #e5d3f2; /* Lilás */
  padding: 20px;
  border-radius: 3px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

function App() {
  const initialEtiquetas = [
    { nome: 'Grande', width: 8, height: 4, borderRadius: 5, tipo: 'Grande' },
    { nome: 'Pequena', width: 5, height: 1, borderRadius: 5, tipo: 'Pequena' },
    { nome: 'Intermediária', width: 6, height: 2.5, borderRadius: 5, tipo: 'Intermediária' },
    { nome: 'Redonda', width: 2.5, height: 2.5, borderRadius: 1.25, tipo: 'Redonda' },
  ];

  const [etiquetas] = useState(initialEtiquetas);
  const [nome, setNome] = useState('');
  const [complemento, setComplemento] = useState('');
  const [turma, setTurma] = useState('');
  const [fontFamily, setFontFamily] = useState('Roboto');
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState('#000000');
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [missingFields, setMissingFields] = useState({});

  useEffect(() => {
    webfontloader.load({
      google: {
        families: ['Roboto:300,400,500,700', 'Oswald', 'Lobster', 'Pacifico', 'Poppins'],
      },
    });
  }, []);

  const validateFields = () => {
    const fields = { nome, complemento, turma };
    const missing = {};

    Object.keys(fields).forEach((key) => {
      if (!fields[key]) {
        missing[key] = true;
      }
    });

    setMissingFields(missing);
    return Object.keys(missing).length === 0;
  };

  const handleFinalizar = async () => {
    if (!validateFields()) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Por favor, preencha todos os campos obrigatórios.');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          etiquetas.map((etiqueta) => ({
            ...etiqueta,
            nomeCampo: nome,
            complementoCampo: etiqueta.tipo === 'Pequena' || etiqueta.tipo === 'Redonda' ? '' : complemento,
            turmaCampo: etiqueta.tipo === 'Pequena' || etiqueta.tipo === 'Redonda' ? '' : turma,
            fontFamily,
            fontSize,
            textColor,
          }))
        ),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar o PDF.');
      }

      const { path } = await response.json();
      setSnackbarSeverity('success');
      setSnackbarMessage(`PDF gerado com sucesso! Salvo em: ${path}`);
    } catch (error) {
      setSnackbarSeverity('error');
      setSnackbarMessage(`Erro ao gerar o PDF: ${error.message}`);
    } finally {
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  return (
    <Container>
      {/* Área do formulário */}
      <Formulario>
        <Typography variant="h6">Preencha os campos:</Typography>
        <TextField
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          error={!!missingFields.nome}
          helperText={missingFields.nome ? 'Campo obrigatório.' : ''}
          fullWidth
        />
        <TextField
          label="Complemento"
          value={complemento}
          onChange={(e) => setComplemento(e.target.value)}
          error={!!missingFields.complemento}
          helperText={missingFields.complemento ? 'Campo obrigatório.' : ''}
          fullWidth
        />
        <TextField
          label="Turma"
          value={turma}
          onChange={(e) => setTurma(e.target.value)}
          error={!!missingFields.turma}
          helperText={missingFields.turma ? 'Campo obrigatório.' : ''}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel>Fonte</InputLabel>
          <Select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
            {['Roboto', 'Oswald', 'Lobster', 'Pacifico', 'Poppins'].map((fonte) => (
              <MenuItem key={fonte} value={fonte}>
                {fonte}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Slider
          value={fontSize}
          onChange={(e, newValue) => setFontSize(newValue)}
          valueLabelDisplay="auto"
          min={8}
          max={72}
        />
        <TextField
          type="color"
          label="Cor do Texto"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleFinalizar}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Finalizar
        </Button>
      </Formulario>

      {/* Área das etiquetas */}
      <EtiquetasContainer>
        {etiquetas.map((etiqueta) => (
          <Box key={etiqueta.nome}>
            <Etiqueta
              width={etiqueta.width}
              height={etiqueta.height}
              borderRadius={etiqueta.borderRadius}
              fontFamily={fontFamily}
              fontSize={fontSize}
              textColor={textColor}
              linha1={nome}
              linha2={etiqueta.tipo === 'Pequena' || etiqueta.tipo === 'Redonda' ? '' : complemento}
              textoExclusivo={etiqueta.tipo === 'Pequena' || etiqueta.tipo === 'Redonda' ? '' : turma}
              padding={5} // Adicionando padding para limitar o texto
            />
            <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
              {etiqueta.nome} - {etiqueta.width}cm x {etiqueta.height}cm
            </Typography>
          </Box>
        ))}
      </EtiquetasContainer>

      {/* Snackbar de feedback */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
