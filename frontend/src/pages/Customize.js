import React, { useContext, useState } from 'react';
import { Box, TextField, Slider, Typography, Button, Card, CardContent, Grid, Avatar, Snackbar, Alert } from '@mui/material';
import { AppContext } from '../contexts/AppContext';
import Etiquetas from '../components/Etiquetas';
import { useNavigate } from 'react-router-dom';
import { config } from '../config/config'; // Importando o arquivo de configuração

function Customize() {
  const {
    selectedKit,
    selectedTheme,
    customizations,
    setCustomizations,
    setSelectedKit,
    setSelectedTheme,
  } = useContext(AppContext);

  const [zoom, setZoom] = useState(config.personalizacao.zoom.default); // Usando o valor padrão do zoom do config
  const [errors, setErrors] = useState({}); // Estado para armazenar erros de validação
  const [openSnackbar, setOpenSnackbar] = useState(false); // Estado para controlar o Snackbar
  const navigate = useNavigate();

  // Função para validar os campos
  const validateFields = () => {
    const newErrors = {};

    // Validação do campo Nome
    if (config.personalizacao.campos.nome.obrigatorio && !customizations.nome) {
      newErrors.nome = config.personalizacao.campos.nome.mensagemErro;
    } else if (customizations.nome && customizations.nome.length > config.personalizacao.campos.nome.maxCaracteres) {
      newErrors.nome = config.personalizacao.campos.nome.mensagemErro;
    }

    // Validação do campo Complemento
    if (customizations.complemento && customizations.complemento.length > config.personalizacao.campos.complemento.maxCaracteres) {
      newErrors.complemento = config.personalizacao.campos.complemento.mensagemErro;
    }

    // Validação do campo Turma
    if (customizations.turma && customizations.turma.length > config.personalizacao.campos.turma.maxCaracteres) {
      newErrors.turma = config.personalizacao.campos.turma.mensagemErro;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Retorna true se não houver erros
  };

  // Função para lidar com a mudança nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomizations({ ...customizations, [name]: value });

    // Validação em tempo real
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
      fontFamily: config.personalizacao.fontesDisponiveis.Roboto, // Fonte padrão
      textColor: '#000000',
    });
    setZoom(config.personalizacao.zoom.default);
    setErrors({});
  };

  // Função para ajustar dinamicamente o tamanho da fonte
  const calculateFontSize = (text, maxWidthCm, tipo) => {
    const baseSizePx = 30; // Tamanho máximo da fonte em pixels
    const minSizePx = 10; // Tamanho mínimo da fonte em pixels
    const maxLength = 20; // Limite de caracteres

    // Converte a largura máxima de centímetros para pixels
    const maxWidthPx = maxWidthCm * 37.8; // 1cm = 37.8 pixels

    // Calcula o tamanho da fonte com base no número de caracteres
    const fontSizeBasedOnLength = baseSizePx * (maxLength / (text.length + 5)); // Ajuste para evitar tamanho inicial muito grande

    // Calcula o tamanho da fonte com base no espaço disponível
    const fontSizeBasedOnWidth = (maxWidthPx / maxLength) * 1.8; // Aumentamos o multiplicador para 1.8

    // Para etiquetas redondas, ajustamos o cálculo para considerar o formato circular
    if (tipo === 'redonda') {
      const areaRadiusPx = maxWidthPx / 2; // Raio da área delimitada em pixels
      const fontSizeBasedOnCircle = (areaRadiusPx / Math.sqrt(text.length)) * 2.0; // Ajuste para o formato circular
      return Math.min(Math.max(fontSizeBasedOnCircle, minSizePx), baseSizePx);
    }

    // Retorna o menor valor entre os dois cálculos, respeitando os limites mínimo e máximo
    const finalFontSize = Math.min(fontSizeBasedOnLength, fontSizeBasedOnWidth);
    return Math.max(finalFontSize, minSizePx); // Garante que o tamanho não seja menor que minSizePx
  };

  // Função para finalizar a personalização
  const handleFinalizar = () => {
    if (validateFields()) {
      navigate('/checkout');
    } else {
      setOpenSnackbar(true); // Exibe o Snackbar se houver erros
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
          disabled={!customizations.nome} // Desabilita o botão se o campo Nome não estiver preenchido
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
            sx={{ width: 110, height: 110, margin: '0 auto' }} // Reduzido em 15%
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
            sx={{ width: 110, height: 110, margin: '0 auto' }} // Reduzido em 15%
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
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Selecione a Fonte *</Typography>
              <Box display="flex" flexWrap="wrap" gap={2}>
                {Object.entries(config.personalizacao.fontesDisponiveis).map(([nome, fonte]) => (
                  <Box
                    key={nome}
                    onClick={() => setCustomizations({ ...customizations, fontFamily: fonte })}
                    sx={{
                      cursor: 'pointer',
                      border: customizations.fontFamily === fonte ? '3px solid #4CAF50' : '1px solid #ccc',
                      borderRadius: '10px',
                      padding: '10px',
                      transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                      boxShadow: customizations.fontFamily === fonte ? '0 8px 30px rgba(76, 175, 80, 0.5)' : 'none',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        borderColor: '#4CAF50',
                        boxShadow: '0 8px 30px rgba(76, 175, 80, 0.5)',
                      },
                    }}
                  >
                    <Typography fontFamily={fonte} fontSize={20}>
                      Estilo de letra
                    </Typography>
                  </Box>
                ))}
              </Box>
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
                  calculateFontSize={calculateFontSize} // Passa a função de ajuste de fonte
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