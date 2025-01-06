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
    width: ${(props) => props.width}cm;
    height: ${(props) => props.height}cm;
    border: 1px dashed black;
    border-radius: ${(props) => (props.tipo === 'Redonda' ? '50%' : `${props.borderRadius || 5}px`)};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: ${(props) => props.padding}px;
    font-family: ${(props) => props.fontFamily || 'AgencyFB-Bold'};
    color: ${(props) => props.textColor};
    font-size: ${(props) => props.fontSize}px;
    background-image: url(${(props) => props.backgroundImage});
    background-size: cover;
    background-position: center;
    position: relative;
    overflow: hidden;
`;

const AreaDelimitada = styled.div`
    position: absolute;
    left: ${(props) => props.left}cm;
    top: ${(props) => props.top}cm;
    width: ${(props) => props.width}cm;
    height: ${(props) => props.height}cm;
    border: 1px dashed red;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
`;

const TextoContainer = styled.div`
    position: absolute;
    cursor: grab;
    text-align: center;
    user-select: none;
`;

const ButtonReset = styled(Button)`
  background-color: #ff0000;
  color: white;
  &:hover {
    background-color: #cc0000;
  }
`;

function App() {
  const initialEtiquetas = [
    { 
      nome: 'Grande', 
      width: 8, 
      height: 4, 
      borderRadius: 5, 
      tipo: 'Grande', 
      backgroundImage: 'images/lol-8x4-1.png',
      area: { left: 3, top: 0.5, width: 4.5, height: 3.3 }
    },
    { 
      nome: 'Pequena', 
      width: 5, 
      height: 1, 
      borderRadius: 5, 
      tipo: 'Pequena', 
      backgroundImage: 'images/lol2-5x1.png',
      area: { left: 1.2, top: 0.2, width: 4, height: 0.8 }
    },
    { 
      nome: 'Intermediária', 
      width: 6, 
      height: 2.5, 
      borderRadius: 5, 
      tipo: 'Intermediária', 
      backgroundImage: 'images/lol2-6x2,5.png',
      area: { left: 1.5, top: 0.3, width: 4.5, height: 2.1 }
    },
    { 
      nome: 'Redonda', 
      width: 2.5, 
      height: 2.5, 
      borderRadius: 1.25, 
      tipo: 'Redonda', 
      backgroundImage: 'images/lol2-2,5x2,5.png',
      area: { left: 1, top: 0.5, width: 1.3, height: 1.8 }
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
  const [missingFields, setMissingFields] = useState({});
  const [posicoes, setPosicoes] = useState({});

  useEffect(() => {
    webfontloader.load({
      custom: {
        families: fontesDisponiveis,
        urls: ['/fonts/fonts.css'],
      },
    });
  }, []);

  const handleMouseDown = (etiquetaId, campo, e) => {
    const offsetX = e.clientX - (posicoes[etiquetaId]?.[campo]?.x || 0);
    const offsetY = e.clientY - (posicoes[etiquetaId]?.[campo]?.y || 0);

    const handleMouseMove = (e) => {
      const novaPosicaoX = e.clientX - offsetX;
      const novaPosicaoY = e.clientY - offsetY;

      const area = etiquetas.find(etiqueta => etiqueta.nome === etiquetaId).area;
      const limiteX = area.width * 37.8; // 1cm ≈ 37.8 pixels
      const limiteY = area.height * 37.8;

      //const x = Math.min(Math.max(novaPosicaoX, 0), limiteX);
      //const y = Math.min(Math.max(novaPosicaoY, 0), limiteY);
      const x = novaPosicaoX;
      const y = novaPosicaoY;

      setPosicoes((prev) => ({
        ...prev,
        [etiquetaId]: {
          ...prev[etiquetaId],
          [campo]: { x, y },
        },
      }));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const validateFields = () => {
    const fields = { nome, complemento, turma };
    const missing = {};

    Object.keys(fields).forEach((key) => {
      if (!fields[key] || fields[key].length > 20) {
        missing[key] = true;
      }
    });

    setMissingFields(missing);
    return Object.keys(missing).length === 0;
  };

  const handleReset = () => {
    setNome('');
    setComplemento('');
    setTurma('');
    setFontFamily('AgencyFB-Bold');
    setTextColor('#000000');
    setFontSizeNome(16);
    setFontSizeComplemento(16);
    setFontSizeTurma(16);
    setMissingFields({});
    setPosicoes({});
  };

  const handleFinalizar = async () => {
    if (!validateFields()) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Por favor, preencha todos os campos obrigatórios (máximo de 20 caracteres).');
      setOpenSnackbar(true);
      return;
    }

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
          fontSizeNome,
          fontSizeComplemento,
          fontSizeTurma,
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
          error={!!missingFields.nome}
          helperText={missingFields.nome ? 'Campo obrigatório (máximo de 20 caracteres).' : ''}
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
          error={!!missingFields.complemento}
          helperText={missingFields.complemento ? 'Campo obrigatório (máximo de 20 caracteres).' : ''}
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
          error={!!missingFields.turma}
          helperText={missingFields.turma ? 'Campo obrigatório (máximo de 20 caracteres).' : ''}
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
        <ButtonReset
          variant="contained"
          onClick={handleReset}
        >
          Reset
        </ButtonReset>
      </Formulario>

      <EtiquetasContainer>
        {etiquetas.map((etiqueta, index) => (
          <Box key={etiqueta.nome} id={`etiqueta-${index}`}>
            <EtiquetaContainer
              width={etiqueta.width}
              height={etiqueta.height}
              borderRadius={etiqueta.borderRadius}
              fontFamily={fontFamily}
              fontSize={16}
              textColor={textColor}
              padding={5}
              tipo={etiqueta.tipo}
              backgroundImage={etiqueta.backgroundImage}
            >
              <AreaDelimitada
                left={etiqueta.area.left}
                top={etiqueta.area.top}
                width={etiqueta.area.width}
                height={etiqueta.area.height}
              >
                {etiqueta.tipo === 'Pequena' || etiqueta.tipo === 'Redonda' ? (
                  <TextoContainer
                    style={{ 
                      left: posicoes[etiqueta.nome]?.nome?.x || (etiqueta.area.width * 37.8 - (nome.length * fontSizeNome * 0.6)) / 2, 
                      top: posicoes[etiqueta.nome]?.nome?.y || (etiqueta.area.height * 37.8 - fontSizeNome) / 2 
                    }}
                    onMouseDown={(e) => handleMouseDown(etiqueta.nome, 'nome', e)}
                  >
                    <div style={{ fontSize: fontSizeNome }}>{nome}</div>
                  </TextoContainer>
                ) : (
                  <>
                    <TextoContainer
                      style={{ 
                        left: posicoes[etiqueta.nome]?.nome?.x || (etiqueta.area.width * 37.8 - (nome.length * fontSizeNome * 0.6)) / 2, 
                        top: posicoes[etiqueta.nome]?.nome?.y || (etiqueta.area.height * 37.8 / 4 - fontSizeNome / 2) 
                      }}
                      onMouseDown={(e) => handleMouseDown(etiqueta.nome, 'nome', e)}
                    >
                      <div style={{ fontSize: fontSizeNome }}>{nome}</div>
                    </TextoContainer>
                    <TextoContainer
                      style={{ 
                        left: posicoes[etiqueta.nome]?.complemento?.x || (etiqueta.area.width * 37.8 - (complemento.length * fontSizeComplemento * 0.6)) / 2, 
                        top: posicoes[etiqueta.nome]?.complemento?.y || (etiqueta.area.height * 37.8 / 2 - fontSizeComplemento / 2) 
                      }}
                      onMouseDown={(e) => handleMouseDown(etiqueta.nome, 'complemento', e)}
                    >
                      <div style={{ fontSize: fontSizeComplemento }}>{complemento}</div>
                    </TextoContainer>
                    <TextoContainer
                      style={{ 
                        left: posicoes[etiqueta.nome]?.turma?.x || (etiqueta.area.width * 37.8 - (turma.length * fontSizeTurma * 0.6)) / 2, 
                        top: posicoes[etiqueta.nome]?.turma?.y || (3 * etiqueta.area.height * 37.8 / 4 - fontSizeTurma / 2) 
                      }}
                      onMouseDown={(e) => handleMouseDown(etiqueta.nome, 'turma', e)}
                    >
                      <div style={{ fontSize: fontSizeTurma }}>{turma}</div>
                    </TextoContainer>
                  </>
                )}
              </AreaDelimitada>
            </EtiquetaContainer>
            <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
              {etiqueta.nome} - {etiqueta.width}cm x {etiqueta.height}cm
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