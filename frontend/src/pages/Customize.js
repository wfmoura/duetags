import React, { useContext, useState } from 'react';
import { Box, TextField, Slider, Typography, Button, Card, CardContent, Grid, Avatar, Snackbar, Alert } from '@mui/material';
import { AppContext } from '../contexts/AppContext';
import Etiquetas from '../components/Etiquetas';
import { useNavigate } from 'react-router-dom';
import { config } from '../config/config';
import CmykColorPicker from '../components/CmykColorPicker'; // Importe o componente personalizado

function Customize() {
  const {
    selectedKit,
    selectedTheme,
    customizations,
    setCustomizations,
  } = useContext(AppContext);

  const [zoom, setZoom] = useState(config.personalizacao.zoom.default);
  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  // Função para atualizar a cor da fonte
  const handleCorFonteChange = (hexColor, cmykValues) => {
    setCustomizations({
      ...customizations,
      textColor: hexColor,
      cmykFonte: cmykValues, // Atualiza o estado com os valores CMYK
    });
  };

  // Função para atualizar a cor do fundo
  const handleCorFundoChange = (hexColor, cmykValues) => {
    setCustomizations({
      ...customizations,
      corFundo: hexColor,
      cmykFundo: cmykValues, // Atualiza o estado com os valores CMYK
    });
  };

  // Função para validar os campos
  const validateFields = () => {
    const newErrors = {};

    if (config.personalizacao.campos.nome.obrigatorio && !customizations.nome) {
      newErrors.nome = config.personalizacao.campos.nome.mensagemErro;
    } else if (customizations.nome && customizations.nome.length > config.personalizacao.campos.nome.maxCaracteres) {
      newErrors.nome = config.personalizacao.campos.nome.mensagemErro;
    }

    if (customizations.complemento && customizations.complemento.length > config.personalizacao.campos.complemento.maxCaracteres) {
      newErrors.complemento = config.personalizacao.campos.complemento.mensagemErro;
    }

    if (customizations.turma && customizations.turma.length > config.personalizacao.campos.turma.maxCaracteres) {
      newErrors.turma = config.personalizacao.campos.turma.mensagemErro;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para lidar com a mudança nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomizations({ ...customizations, [name]: value });

    if (errors[name]) {
      validateFields();
    }
  };

  // Função para resetar os campos
  const resetToDefaults = () => {
    setCustomizations({
      nome: '',
      complemento: '',
      turma: '',
      fontFamily: config.personalizacao.fontesDisponiveis.Roboto,
      textColor: config.personalizacao.corFontePadrao, // Cor de fonte padrão
      corFundo: config.personalizacao.corFundoPadrao, // Cor de fundo padrão
      cmykFonte: { c: 0, m: 0, y: 0, k: 0 }, // CMYK da fonte padrão
      cmykFundo: { c: 100, m: 100, y: 0, k: 50 }, // CMYK do fundo padrão
    });
    setZoom(config.personalizacao.zoom.default);
    setErrors({});
  };

  // Função para ajustar dinamicamente o tamanho da fonte
  const calculateFontSize = (text, maxWidthCm, tipo) => {
    const baseSizePx = 30;
    const minSizePx = 10;
    const maxLength = 20;
    const maxWidthPx = maxWidthCm * 37.8;

    const fontSizeBasedOnLength = baseSizePx * (maxLength / (text.length + 5));
    const fontSizeBasedOnWidth = (maxWidthPx / maxLength) * 1.8;

    if (tipo === 'redonda') {
      const areaRadiusPx = maxWidthPx / 2;
      const fontSizeBasedOnCircle = (areaRadiusPx / Math.sqrt(text.length)) * 2.0;
      return Math.min(Math.max(fontSizeBasedOnCircle, minSizePx), baseSizePx);
    }

    const finalFontSize = Math.min(fontSizeBasedOnLength, fontSizeBasedOnWidth);
    return Math.max(finalFontSize, minSizePx);
  };

  // Função para finalizar a personalização
  const handleFinalizar = () => {
    if (validateFields()) {
      navigate('/checkout');
    } else {
      setOpenSnackbar(true);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Personalize suas etiquetas</Typography>

      {/* Botões centralizados no topo da tela */}
      <Box display="flex" justifyContent="center" gap={2} mb={4}>
        <Button variant="contained" onClick={() => navigate('/theme')}>
          Voltar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleFinalizar}
          disabled={!customizations.nome}
        >
          Finalizar
        </Button>
        <Button variant="contained" color="secondary" onClick={resetToDefaults}>
          Limpar formulário
        </Button>
      </Box>

      {/* Componentes "Alterar Kit" e "Alterar Tema" no topo da página */}
      <Box display="flex" justifyContent="center" gap={4} mb={4}>
        <Box
          onClick={() => navigate('/')}
          sx={{ cursor: 'pointer', textAlign: 'center', position: 'relative' }}
        >
          <Avatar
            src={selectedKit?.thumbnail}
            sx={{ width: 110, height: 110, margin: '0 auto' }}
          />
          <Typography
            variant="body1"
            mt={1}
            fontWeight="bold"
            sx={{
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              fontSize: '70%',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
            }}
          >
            {selectedKit?.nome}
          </Typography>
          <Typography variant="body2" mt={1}>Alterar Kit</Typography>
        </Box>
        <Box
          onClick={() => navigate('/theme')}
          sx={{ cursor: 'pointer', textAlign: 'center', position: 'relative' }}
        >
          <Avatar
            src={selectedTheme?.thumbnail}
            sx={{ width: 110, height: 110, margin: '0 auto' }}
          />
          <Typography
            variant="body1"
            mt={1}
            fontWeight="bold"
            sx={{
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
              fontSize: '70%',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
            }}
          >
            {selectedTheme?.nome}
          </Typography>
          <Typography variant="body2" mt={1}>Alterar Tema</Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Formulário de Personalização */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Dados da Etiqueta</Typography>
              <TextField
                label="Nome *"
                name="nome"
                value={customizations.nome}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: config.personalizacao.campos.nome.maxCaracteres }}
                error={!!errors.nome}
                helperText={errors.nome}
                required
              />
              <TextField
                label="Complemento"
                name="complemento"
                value={customizations.complemento}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: config.personalizacao.campos.complemento.maxCaracteres }}
                error={!!errors.complemento}
                helperText={errors.complemento}
              />
              <TextField
                label="Turma"
                name="turma"
                value={customizations.turma}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: config.personalizacao.campos.turma.maxCaracteres }}
                error={!!errors.turma}
                helperText={errors.turma}
              />
            </CardContent>
          </Card>

          {/* Seletor de Cor da Fonte */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Cor da Fonte</Typography>
              <CmykColorPicker
                selectedColor={customizations.textColor}
                onColorSelect={handleCorFonteChange}
              />
              <Typography variant="body2" mt={2}>
                CMYK: {customizations.cmykFonte ? `${customizations.cmykFonte.c}%, ${customizations.cmykFonte.m}%, ${customizations.cmykFonte.y}%, ${customizations.cmykFonte.k}%` : "0%, 0%, 0%, 0%"}
              </Typography>
            </CardContent>
          </Card>

          {/* Seletor de Cor do Fundo */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Cor do Fundo</Typography>
              <CmykColorPicker
                selectedColor={customizations.corFundo}
                onColorSelect={handleCorFundoChange}
              />
              <Typography variant="body2" mt={2}>
                CMYK: {customizations.cmykFundo ? `${customizations.cmykFundo.c}%, ${customizations.cmykFundo.m}%, ${customizations.cmykFundo.y}%, ${customizations.cmykFundo.k}%` : "100%, 100%, 0%, 50%"}
              </Typography>
            </CardContent>
          </Card>

          {/* Seletor de Zoom */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Zoom</Typography>
              <Slider
                value={zoom}
                onChange={(e, newValue) => setZoom(newValue)}
                min={config.personalizacao.zoom.min}
                max={config.personalizacao.zoom.max}
                step={config.personalizacao.zoom.step}
                aria-labelledby="zoom-slider"
                valueLabelDisplay="auto"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Visualização das Etiquetas */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Prévia das Etiquetas</Typography>
              {selectedKit && selectedTheme && (
                <Etiquetas
                  kit={selectedKit}
                  theme={selectedTheme}
                  customizations={customizations}
                  zoom={zoom}
                  calculateFontSize={calculateFontSize}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar para exibir mensagens de erro */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: '100%' }}>
          {config.mensagens.erroValidacao}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Customize;