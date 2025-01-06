import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import {
  TextField, FormControl, Select, MenuItem, InputLabel,
  Button, Box, Typography, Snackbar, Alert, CircularProgress, Slider,
  Tabs, Tab, AppBar, Grid
} from '@mui/material';
import html2canvas from 'html2canvas';

// Imports das imagens

const temas = [
  {
    nome: 'Tema 1',
    imagens: {
      grande: imageImports.lol8x4Tema1,
      pequena: imageImports.lol2_5x1Tema1,
      intermediaria: imageImports.lol2_6x2_5Tema1,
      redonda: imageImports.lol2_2_5x2_5Tema1,
    }
  },
  {
    nome: 'Tema 2',
    imagens: {
      grande: imageImports.lol8x4Tema2,
      pequena: imageImports.lol2_5x1Tema2,
      intermediaria: imageImports.lol2_6x2_5Tema2,
      redonda: imageImports.lol2_2_5x2_5Tema2,
    }
  },
  {
    nome: 'Tema 3',
    imagens: {
      grande: imageImports.lol8x4Tema3,
      pequena: imageImports.lol2_5x1Tema3,
      intermediaria: imageImports.lol2_6x2_5Tema3,
      redonda: imageImports.lol2_2_5x2_5Tema3,
    }
  },
];
// Canvas global para otimização
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

const Formulario = styled.div
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background-color: #a7e0d6;
  border: 1px solid #ccc;
  border-radius: 10px;
  width: 100%;
  max-width: 350px;
;

const EtiquetasContainer = styled.div
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;
  background-color: #e5d3f2;
  padding: 20px;
  border-radius: 3px;
;

const Container = styled.div
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
;

const EtiquetaContainer = styled.div
  position: relative;
  width: ${(props) => props.width}px;
  height: <span class="math-inline">\{\(props\) \=\> props\.height\}px;
background\-image\: url\(</span>{(props) => props.backgroundImage});
  background-size: cover;
  background-position: center;
  border: 1px dashed black;
  border-radius: ${(props) => (props.tipo === 'Redonda' ? '50%' : '5px')};
;

const AreaDelimitada = styled.div
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
;

const TextoContainer = styled.div
  font-size: ${({ fontSize }) => fontSize}px;
  font-family: ${({ fontFamily }) => fontFamily};
  color: ${({ textColor }) => textColor};
  text-align: center;
  word-break: break-word;
  max-width: 100%;
  white-space: pre-wrap;
  word-wrap: break-word;
;

function AjusteDinamicoTexto({ text, areaWidth, areaHeight, fontFamily, fontSize, textColor, onFontSizeChange }) {
  const adjustedFontSize = useRef(fontSize);

  const adjustFontSize = useCallback((text, maxWidth, maxHeight) => {
    if (!context) return;

    let low = 8;
    let high = 32;
    let mid;

    if (!text) {
      adjustedFontSize.current = fontSize;
      onFontSizeChange(fontSize);
      return;
    }

    while (low <= high) {
      mid = Math.floor((low + high) / 2);
      context.font = ${mid}px ${fontFamily};
      const metrics = context.measureText(text);
      const textWidth = metrics.width;
      const textHeight = metrics.actualBoundingBoxDescent + metrics.actualBoundingBoxAscent;

      if (textWidth > maxWidth || textHeight > maxHeight) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    adjustedFontSize.current = high;
    onFontSizeChange(high);
  }, [fontFamily, fontSize, onFontSizeChange]);

  useEffect(() => {
    adjustFontSize(text, areaWidth, areaHeight);
  }, [text, areaWidth, areaHeight, adjustFontSize]);

  return (
    <TextoContainer fontSize={adjustedFontSize.current} fontFamily={fontFamily} textColor={textColor}>
      {text}
    </TextoContainer>
  );
}

function SelecaoTema({ onTemaSelecionado }) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} padding={4}>
      <Typography variant="h4">Escolha um Tema</Typography>
      <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
        {temas.map((tema, index) => (
          <Button key={index} variant="contained" onClick={() => onTemaSelecionado(tema)}>
            {tema.nome}
          </Button>
        ))}
      </Box>
    </Box>
  );
}

function App() {
  const cmToPx = (cm) => cm * 37.8;

  const initialEtiquetas = [
    {
      nome: 'Grande',
      width: cmToPx(16),
      height: cmToPx(8),
      tipo: 'Grande',
      getBackgroundImage: (tema) => tema.imagens.grande,
      area: { left: cmToPx(5.8), top: cmToPx(1.4), width: cmToPx(9), height: cmToPx(5) },
      campos: ['nome', 'complemento', 'turma']
    },
    {
      nome: 'Pequena',
      width: cmToPx(10),
      height: cmToPx(2),
      tipo: 'Pequena',
      getBackgroundImage: (tema) => tema.imagens.pequena,
      area: { left: cmToPx(2.2), top: cmToPx(0.16), width: cmToPx(7),
      height: cmToPx(1.6) },
      campos: ['nome']
    },
    {
      nome: 'Intermediária',
      width: cmToPx(12),
      height: cmToPx(5),
      tipo: 'Intermediária',
      getBackgroundImage: (tema) => tema.imagens.intermediaria,
      area: { left: cmToPx(0.75 * 5), top: cmToPx(0.75 * 0.4), width: cmToPx(0.75 * 8.0), height: cmToPx(4.2) },
      campos: ['nome', 'complemento']
    },
    {
      nome: 'Redonda',
      width: cmToPx(5),
      height: cmToPx(5),
      tipo: 'Redonda',
      getBackgroundImage: (tema) => tema.imagens.redonda,
      area: { left: cmToPx(0.7), top: cmToPx(0.8), width: cmToPx(3.6), height: cmToPx(2.0) },
      campos: ['nome', 'complemento']
    },
  ];

  const fontesDisponiveis = [
    'AgencyFB-Bold',
    'Delius-Regular',
    'Borel-Regular',
  ];

  const [etiquetas, setEtiquetas] = useState(initialEtiquetas);
  const [fontFamily, setFontFamily] = useState('AgencyFB-Bold');
  const [textColor, setTextColor] = useState('#000000');
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [zoom, setZoom] = useState(1.5);
  const [abaAtual, setAbaAtual] = useState(0);
  const [temaSelecionado, setTemaSelecionado] = useState(null);

  const [formValues, setFormValues] = useState({
    nome: '',
    complemento: '',
    turma: '',
  });

  const [fontSizes, setFontSizes] = useState({
    nome: 16,
    complemento: 16,
    turma: 16,
  });

  const verificarImagem = (caminho) => {
    const img = new Image();
    img.src = caminho;
    img.onload = () => console.log(Imagem carregada: ${caminho});
    img.onerror = () => console.error(Erro ao carregar imagem: ${caminho});
  };

  useEffect(() => {
    if (temaSelecionado) {
      initialEtiquetas.forEach(etiqueta => verificarImagem(etiqueta.getBackgroundImage(temaSelecionado)));
    }
  }, [initialEtiquetas, temaSelecionado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleFontSizeChange = (campo, newValue) => {
    setFontSizes({ ...fontSizes, [campo]: newValue });
  };

  const handleReset = () => {
    setFormValues({
      nome: '',
      complemento: '',
      turma: '',
    });
    setFontFamily('AgencyFB-Bold');
    setTextColor('#000000');
    setFontSizes({
      nome: 16,
      complemento: 16,
      turma: 16,
    });
    setZoom(1.5);
  };

  const handleFinalizar = async () => {
    setLoading(true);
    try {
      const etiquetasImages = await Promise.all(
        etiquetas.map(async (etiqueta, index) => {
          const element = document.getElementById(etiqueta-${index});
          const canvas = await html2canvas(element, { scale: 2 });
          return canvas.toDataURL('image/png');
        })
      );

      console.log('Etiquetas geradas:', etiquetasImages);
      setSnackbarSeverity('success');
      setSnackbarMessage('Etiquetas geradas com sucesso!');
    } catch (error) {
      setSnackbarSeverity('error');
      setSnackbarMessage(Erro ao gerar etiquetas: ${error.message});
    } finally {
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  const pixelsParaCm = (pixels) => {
    return (pixels / 37.8).toFixed(2);
  };

  const zoomAplicado = zoom * 0.5;

  const handleTemaSelecionado = (tema) => {
    setTemaSelecionado(tema);
    setAbaAtual(1);
  };

  return (
    <Container>
      <AppBar position="static">
        <Tabs
          value={abaAtual}
          onChange={(e, newValue) => setAbaAtual(newValue)}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
        >
          <Tab
            label="Escolher Tema"
            sx={{
              backgroundColor: abaAtual === 0 ? '#4CAF50' : '#e0e0e0',
              color: abaAtual === 0 ? 'white' : 'black',
            }}
          />
          <Tab
            label="Personalizar Etiquetas"
            disabled={!temaSelecionado}
            sx={{
              backgroundColor: abaAtual === 1 ? '#2196F3' : '#e0e0e0',
              color: abaAtual === 1 ? 'white' : 'black',
            }}
          />
        </Tabs>
      </AppBar>
      {abaAtual === 0 && <SelecaoTema onTemaSelecionado={handleTemaSelecionado} />}
      {abaAtual === 1 && (
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Formulario>
              <Typography variant="h6">Preencha os campos:</Typography>
              <TextField
                label="Nome"
                name="nome"
                value={formValues.nome}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: 20 }}
              />

              <TextField
                label="Complemento"
                name="complemento"
                value={formValues.complemento}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: 20 }}
              />

              <TextField
                label="Turma"
                name="turma"
                value={formValues.turma}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: 20 }}
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
              <Button
                variant="contained"
                style={{ backgroundColor: '#4CAF50', color: 'white' }}
                onClick={handleFinalizar}
              >
                Finalizar
              </Button>
              <Button
                variant="contained"
                style={{ backgroundColor: '#f44336', color: 'white' }}
                onClick={handleReset}
              >
                Resetar
              </Button>
            </Formulario>
          </Grid>
          <Grid item xs={12} md={8}>
            <EtiquetasContainer>
              {etiquetas.map((etiqueta, index) => (
                <EtiquetaContainer
                  key={index}
                  id={etiqueta-${index}}
                  width={etiqueta.width * zoomAplicado}
                  height={etiqueta.height * zoomAplicado}
                  backgroundImage={temaSelecionado ? etiqueta.getBackgroundImage(temaSelecionado) : null}
                  tipo={etiqueta.tipo}
                >
                  <AreaDelimitada
                    left={etiqueta.area.left * zoomAplicado}
                    top={etiqueta.area.top * zoomAplicado}
                    width={etiqueta.area.width * zoomAplicado}
                    height={etiqueta.area.height * zoomAplicado}
                  >
                    {etiqueta.campos.map((campo, i) => (
                      <AjusteDinamicoTexto
                        key={i}
                        text={formValues[campo]}
                        areaWidth={etiqueta.area.width * zoomAplicado}
                        areaHeight={etiqueta.area.height * zoomAplicado}
                        fontFamily={fontFamily}
                        fontSize={fontSizes[campo]}
                        textColor={textColor}
                        onFontSizeChange={(newValue) => handleFontSizeChange(campo, newValue)}
                      />
                    ))}
                  </AreaDelimitada>
                </EtiquetaContainer>
              ))}
            </EtiquetasContainer>
          </Grid>
        </Grid>
      )}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
}

export default App;