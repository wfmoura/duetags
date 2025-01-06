import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import {
  TextField, FormControl, Select, MenuItem, InputLabel,
  Button, Box, Typography, Snackbar, Alert, CircularProgress, Slider,
  Zoom
} from '@mui/material';
import html2canvas from 'html2canvas';
import '../../src/fonts.css'; // Importe o arquivo de .src/fontes

// Canvas global para otimização
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

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
  font-size: ${({ fontSize }) => fontSize}px;
  font-family: ${({ fontFamily }) => fontFamily};
  color: ${({ textColor }) => textColor};
  text-align: center;
  word-break: break-word;
  max-width: 100%;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

function AjusteDinamicoTexto({ text, areaWidth, areaHeight, fontFamily, fontSize, textColor, onFontSizeChange }) {
  const adjustedFontSize = useRef(fontSize);

  const adjustFontSize = useCallback((text, maxWidth, maxHeight) => {
    if (!context) return;

    let low = 8; // Tamanho mínimo da fonte
    let high = 32; // Tamanho máximo da fonte
    let mid;

    if (!text) {
      adjustedFontSize.current = fontSize;
      onFontSizeChange(fontSize);
      return;
    }

    while (low <= high) {
      mid = Math.floor((low + high) / 2);
      context.font = `${mid}px ${fontFamily}`;
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
  }, [text, areaWidth, areaHeight]);

  return (
    <TextoContainer fontSize={adjustedFontSize.current} fontFamily={fontFamily} textColor={textColor}>
      {text}
    </TextoContainer>
  );
}

function App() {
  const initialEtiquetas = [
    {
      nome: 'Grande',
      width: 16 * 37.8,
      height: 8 * 37.8,
      tipo: 'Grande',
      backgroundImage: 'images/lol-8x4-1.png',
      area: { left: 5.8 * 37.8, top: 1.4 * 37.8, width: 9 * 37.8, height: 5 * 37.8 },
      campos: ['nome', 'complemento', 'turma']
    },
    {
      nome: 'Pequena',
      width: 10 * 37.8,
      height: 2 * 37.8,
      tipo: 'Pequena',
      backgroundImage: 'images/lol2-5x1.png',
      area: { left: 2.2 * 37.8, top: 0.16 * 37.8, width: 7 * 37.8, height: 1.6 * 37.8 },
      campos: ['nome']
    },
    {
      nome: 'Intermediária',
      width: 12 * 37.8,
      height: 5 * 37.8,
      tipo: 'Intermediária',
      backgroundImage: 'images/lol2-6x2,5.png',
      area: { left: 0.75 * 5 * 37.8, top: 0.75 * 0.4 * 37.8, width: 0.75 * 8.0 * 37.8, height: 4.2 * 37.8 },
      campos: ['nome', 'complemento']
    },
    {
      nome: 'Redonda',
      width: 5 * 37.8,
      height: 5 * 37.8,
      tipo: 'Redonda',
      backgroundImage: 'images/lol2-2,5x2,5.png',
      area: { left: 0.7 * 37.8, top: 0.8 * 37.8, width: 3.6 * 37.8, height: 2.0 * 37.8 },
      campos: ['nome', 'complemento']
    },
  ];

  const fontesDisponiveis = [
    'AgencyFB-Bold',
    'Delius-Regular', // Nova fonte
    'Borel-Regular', // Nova fonte
  ];

  const [etiquetas] = useState(initialEtiquetas);
  const [fontFamily, setFontFamily] = useState('AgencyFB-Bold');
  const [textColor, setTextColor] = useState('#000000');
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [zoom, setZoom] = useState(1.5); // Valor padrão do slide é 1.5

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
    setZoom(1.5); // Resetar o zoom para 1.5
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

      console.log('Etiquetas geradas:', etiquetasImages);
      setSnackbarSeverity('success');
      setSnackbarMessage('Etiquetas geradas com sucesso!');
    } catch (error) {
      setSnackbarSeverity('error');
      setSnackbarMessage(`Erro ao gerar etiquetas: ${error.message}`);
    } finally {
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  // Função para converter pixels em centímetros
  const pixelsParaCm = (pixels) => {
    return (pixels / 37.8).toFixed(2);
  };

  // Aplicação do zoom: metade dos valores das propriedades corresponde a 100% do slide
  const zoomAplicado = zoom * 0.5;

  return (
    <Container>
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
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Finalizar
        </Button>
        <Button variant="contained" onClick={handleReset}>
          Reset
        </Button>
      </Formulario>

      <EtiquetasContainer>
        {etiquetas.map((etiqueta, index) => (
          <Box key={etiqueta.nome} display="flex" flexDirection="column" alignItems="center">
            <EtiquetaContainer
              id={`etiqueta-${index}`}
              width={etiqueta.width * zoomAplicado}
              height={etiqueta.height * zoomAplicado}
              tipo={etiqueta.tipo}
              backgroundImage={etiqueta.backgroundImage}
            >
              <AreaDelimitada
                left={etiqueta.area.left * zoomAplicado}
                top={etiqueta.area.top * zoomAplicado}
                width={etiqueta.area.width * zoomAplicado}
                height={etiqueta.area.height * zoomAplicado}
              >
                {etiqueta.campos.map((campo) => {
                  let text;
                  if (etiqueta.tipo === 'Pequena' && campo === 'nome') {
                    text = `${formValues.nome} ${formValues.complemento}`.trim();
                  } else {
                    text = formValues[campo];
                  }

                  return (
                    <AjusteDinamicoTexto
                      key={campo}
                      text={text}
                      areaWidth={etiqueta.area.width * zoomAplicado}
                      areaHeight={etiqueta.area.height * zoomAplicado / etiqueta.campos.length}
                      fontFamily={fontFamily}
                      fontSize={fontSizes[campo]}
                      textColor={textColor}
                      onFontSizeChange={(newSize) => handleFontSizeChange(campo, newSize)}
                    />
                  );
                })}
              </AreaDelimitada>
            </EtiquetaContainer>
            <Typography variant="body2" mt={1}>
              {etiqueta.nome} ({pixelsParaCm(etiqueta.width * zoomAplicado)}x{pixelsParaCm(etiqueta.height * zoomAplicado)} cm)
            </Typography>
          </Box>
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