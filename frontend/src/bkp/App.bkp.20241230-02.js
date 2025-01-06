import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  TextField, FormControl, Select, MenuItem, InputLabel, 
  Button, Box, Typography, Snackbar, Alert, CircularProgress, Slider 
} from '@mui/material';
import webfontloader from 'webfontloader';
import html2canvas from 'html2canvas';

const Formulario = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background-color: #a7e0d6;
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
  background-color: #e5d3f2;
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

const EtiquetaContainer = styled.div`
  position: relative;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  background-image: url(${(props) => props.backgroundImage});
  background-size: cover;
  background-position: center;
  border: 1px dashed black;
  border-radius: ${(props) => (props.tipo === 'Redonda' ? '50%' : '5px')};
`;

const AreaDelimitada = styled.div`
  position: absolute;
  left: ${(props) => props.left}px;
  top: ${(props) => props.top}px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  border: 1px dashed red;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  overflow: hidden;
`;

const TextoContainer = styled.div`
  font-size: ${(props) => props.fontSize}px;
  font-family: ${(props) => props.fontFamily};
  color: ${(props) => props.textColor};
  text-align: center;
  word-break: break-word;
  max-width: 100%;
`;

function AjusteDinamicoTexto({ text, maxChars, areaWidth, areaHeight, fontFamily, fontSize, textColor, onFontSizeChange }) {
  const canvasRef = useRef(document.createElement('canvas'));
  const context = canvasRef.current.getContext('2d');

  useEffect(() => {
    adjustFontSize(text, areaWidth, areaHeight);
  }, [text, areaWidth, areaHeight]);

  const adjustFontSize = (text, maxWidth, maxHeight) => {
    context.font = `${fontSize}px ${fontFamily}`;
    let textWidth = context.measureText(text).width;
    let currentFontSize = fontSize;

    // Ajusta o tamanho até caber na área delimitada da etiqueta específica
    while ((textWidth > maxWidth || currentFontSize > maxHeight) && currentFontSize > 12) { // Tamanho mínimo de 12px
      currentFontSize -= 1;
      context.font = `${currentFontSize}px ${fontFamily}`;
      textWidth = context.measureText(text).width;
    }

    if (currentFontSize !== fontSize) {
      onFontSizeChange(currentFontSize);
    }
  };

  return (
    <TextoContainer fontSize={fontSize} fontFamily={fontFamily} textColor={textColor}>
      {text}
    </TextoContainer>
  );
}

  return (
    <TextoContainer fontSize={fontSize} fontFamily={fontFamily} textColor={textColor}>
      {text}
    </TextoContainer>
  );
}

function App() {
  const initialEtiquetas = [
    { 
      nome: 'Grande', 
      width: 8 * 37.8, // Convert cm to pixels
      height: 4 * 37.8, 
      borderRadius: 5, 
      tipo: 'Grande', 
      backgroundImage: 'images/lol-8x4-1.png',
      area: { left: 2.9 * 37.8, top: 0.20 * 37.8, width: 4.9 * 37.8, height: 3.5 * 37.8 },
      campos: ['nome', 'complemento', 'turma']
    },
    { 
      nome: 'Pequena', 
      width: 5 * 37.8, 
      height: 1 * 37.8, 
      borderRadius: 5, 
      tipo: 'Pequena', 
      backgroundImage: 'images/lol2-5x1.png',
      area: { left: 1.1 * 37.8, top: 0.08 * 37.8, width: 3.8 * 37.8, height: 0.8 * 37.8 },
      campos: ['nome']
    },
    { 
      nome: 'Intermediária', 
      width: 6 * 37.8, 
      height: 2.5 * 37.8, 
      borderRadius: 5, 
      tipo: 'Intermediária', 
      backgroundImage: 'images/lol2-6x2,5.png',
      area: { left: 1.5 * 37.8, top: 0.2 * 37.8, width: 4.3 * 37.8, height: 2.1 * 37.8 },
      campos: ['nome', 'complemento']
    },
    { 
      nome: 'Redonda', 
      width: 2.5 * 37.8, 
      height: 2.5 * 37.8, 
      borderRadius: 1.25, 
      tipo: 'Redonda', 
      backgroundImage: 'images/lol2-2,5x2,5.png',
      area: { left: 0.9 * 37.8, top: 0.52 * 37.8, width: 1.2 * 37.8, height: 1.5 * 37.8 },
      campos: ['nome']
    },
  ];

  const fontesDisponiveis = [
    'AgencyFB-Bold',
    'A4SPEEDBold',
    'BatmanForeverAlternate',
    'Dortmund-ExtraBold',
    'EdoSZ',
    'GROBOLD',
    'Gemstone-Regular',
    'JandaManateeSolid',
    'JumboSaleTrial',
    'KaBlam',
    'KomikaAxis',
    'Michland',
    'Odisean-One',
    'Potato_sans-Black',
    'Potato_sans-Bold',
    'Roboto',
    'SandlerTrial-Regular',
    'SmartKids',
    'SpongeboyMeBob',
    'Starborn',
    'SuperDessert',
    'SuperMarioGalaxy',
    'SuperMilk',
    'SuperOrganic',
    'WhiteOnBlack',
    'moon_get-Heavy',
  ];

  const [etiquetas] = useState(initialEtiquetas);
  const [nome, setNome] = useState('');
  const [complemento, setComplemento] = useState('');
  const [turma, setTurma] = useState('');
  const [fontFamily, setFontFamily] = useState('AgencyFB-Bold');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSizeNome, setFontSizeNome] = useState(16);
  const [fontSizeComplemento, setFontSizeComplemento] = useState(16);
  const [fontSizeTurma, setFontSizeTurma] = useState(16);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    webfontloader.load({
      custom: {
        families: fontesDisponiveis,
        urls: ['/fonts/fonts.css'],
      },
    });
  }, []);

  const handleReset = () => {
    setNome('');
    setComplemento('');
    setTurma('');
    setFontFamily('AgencyFB-Bold');
    setTextColor('#000000');
    setFontSizeNome(30);
    setFontSizeComplemento(16);
    setFontSizeTurma(16);
  };

  const handleFinalizar = async () => {
    setLoading(true);
    try {
      const etiquetasImages = await Promise.all(
        etiquetas.map(async (etiqueta, index) => {
          const element = document.getElementById(`etiqueta-${index}`);
          const canvas = await html2canvas(element, { scale: 2 });
          return canvas.toDataURL('image/png');
        })
      );

      const response = await fetch('http://localhost:5001/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          etiquetas: etiquetasImages,
          nome,
          complemento,
          turma,
          fontFamily,
          textColor,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar o PDF.');
      }

      const { path } = await response.json();
      setSnackbarSeverity('success');
      setSnackbarMessage(`PDF gerado com sucesso! Salvo em: ${path}`);
      handleReset();
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
      <Formulario>
        <Typography variant="h6">Preencha os campos:</Typography>
        <TextField
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          fullWidth
          inputProps={{ maxLength: 20 }}
        />
        <Typography variant="body2">Tamanho da Fonte do Nome:</Typography>
        <Slider
          value={fontSizeNome}
          onChange={(e, newValue) => setFontSizeNome(newValue)}
          min={8}
          max={32}
          step={1}
          valueLabelDisplay="auto"
        />
        <TextField
          label="Complemento"
          value={complemento}
          onChange={(e) => setComplemento(e.target.value)}
          fullWidth
          inputProps={{ maxLength: 20 }}
        />
        <Typography variant="body2">Tamanho da Fonte do Complemento:</Typography>
        <Slider
          value={fontSizeComplemento}
          onChange={(e, newValue) => setFontSizeComplemento(newValue)}
          min={8}
          max={32}
          step={1}
          valueLabelDisplay="auto"
        />
        <TextField
          label="Turma"
          value={turma}
          onChange={(e) => setTurma(e.target.value)}
          fullWidth
          inputProps={{ maxLength: 20 }}
        />
        <Typography variant="body2">Tamanho da Fonte da Turma:</Typography>
        <Slider
          value={fontSizeTurma}
          onChange={(e, newValue) => setFontSizeTurma(newValue)}
          min={8}
          max={32}
          step={1}
          valueLabelDisplay="auto"
        />
        <FormControl fullWidth>
          <InputLabel>Fonte</InputLabel>
          <Select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
            {fontesDisponiveis.map((fonte) => (
              <MenuItem key={fonte} value={fonte}>
                {fonte}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          type="color"
          label="Cor do Texto"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          style={{ backgroundColor: '#4CAF50', color: 'white' }}
          onClick={handleFinalizar}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Finalizar
        </Button>
        <Button
          variant="contained"
          onClick={handleReset}
        >
          Reset
        </Button>
      </Formulario>

      <EtiquetasContainer>
        {etiquetas.map((etiqueta, index) => (
          <EtiquetaContainer
            key={etiqueta.nome}
            id={`etiqueta-${index}`}
            width={etiqueta.width}
            height={etiqueta.height}
            tipo={etiqueta.tipo}
            backgroundImage={etiqueta.backgroundImage}
          >
            <AreaDelimitada
              left={etiqueta.area.left}
              top={etiqueta.area.top}
              width={etiqueta.area.width}
              height={etiqueta.area.height}
            >
              {etiqueta.campos.includes('nome') && (
                <AjusteDinamicoTexto
                  text={nome}
                  maxChars={20}
                  areaWidth={etiqueta.area.width}
                  areaHeight={etiqueta.area.height / etiqueta.campos.length}
                  fontFamily={fontFamily}
                  fontSize={fontSizeNome}
                  textColor={textColor}
                  onFontSizeChange={setFontSizeNome}
                />
              )}
              {etiqueta.campos.includes('complemento') && (
                <AjusteDinamicoTexto
                  text={complemento}
                  maxChars={20}
                  areaWidth={etiqueta.area.width}
                  areaHeight={etiqueta.area.height / etiqueta.campos.length}
                  fontFamily={fontFamily}
                  fontSize={fontSizeComplemento}
                  textColor={textColor}
                  onFontSizeChange={setFontSizeComplemento}
                />
              )}
              {etiqueta.campos.includes('turma') && (
                <AjusteDinamicoTexto
                  text={turma}
                  maxChars={20}
                  areaWidth={etiqueta.area.width}
                  areaHeight={etiqueta.area.height / etiqueta.campos.length}
                  fontFamily={fontFamily}
                  fontSize={fontSizeTurma}
                  textColor={textColor}
                  onFontSizeChange={setFontSizeTurma}
                />
              )}
            </AreaDelimitada>
          </EtiquetaContainer>
        ))}
      </EtiquetasContainer>

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