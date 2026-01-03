import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  FormControlLabel,
  Checkbox,
  Alert,
  IconButton
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MaskedInput from '../components/MaskedInput';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import * as yup from 'yup';

const step1Schema = yup.object().shape({
  name: yup.string().required('O campo Nome é obrigatório.'),
  email: yup.string().email('Por favor, insira um e-mail válido.').required('O campo Email é obrigatório.'),
  phone: yup.string().required('O campo Celular é obrigatório.'),
  password: yup.string().min(6, 'A senha deve ter pelo menos 6 caracteres.').required('O campo Senha é obrigatório.'),
  cpf: yup.string().nullable(),
});

const step2Schema = yup.object().shape({
  address_cep: yup.string().required('O campo CEP é obrigatório.').matches(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  address_street: yup.string().required('O campo Rua é obrigatório.'),
  address_number: yup.string().required('O campo Número é obrigatório.'),
  address_neighborhood: yup.string().required('O campo Bairro é obrigatório.'),
  address_city: yup.string().required('O campo Cidade é obrigatório.'),
  address_state: yup.string().required('O campo UF é obrigatório.').max(2, 'Apenas a sigla'),
});

const steps = ['Dados Pessoais', 'Endereço (Opcional)'];

function Register() {
  const { register } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [skipAddress, setSkipAddress] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    address_cep: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    password: '',
    role: 'user',
  });

  const [loadingCep, setLoadingCep] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleCepChange = async (e) => {
    const value = e.target.value;
    const cep = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, address_cep: value }));

    if (cep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data && !data.erro) {
          setFormData(prev => ({
            ...prev,
            address_street: data.logradouro || '',
            address_neighborhood: data.bairro || '',
            address_city: data.localidade || '',
            address_state: data.uf || ''
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleNext = async () => {
    setErrors({});
    try {
      if (activeStep === 0) {
        await step1Schema.validate(formData, { abortEarly: false });
        setActiveStep(1);
      } else {
        if (!skipAddress) {
          await step2Schema.validate(formData, { abortEarly: false });
        }
        handleFinalSubmit();
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors = {};
        err.inner.forEach(error => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const submissionData = { ...formData };
      if (skipAddress) {
        submissionData.address_cep = '';
        submissionData.address_street = '';
        submissionData.address_number = '';
        submissionData.address_complement = '';
        submissionData.address_neighborhood = '';
        submissionData.address_city = '';
        submissionData.address_state = '';
      }

      await register(submissionData.email, submissionData.password, {
        name: submissionData.name,
        phone: submissionData.phone,
        cpf: submissionData.cpf,
        address_cep: submissionData.address_cep,
        address_street: submissionData.address_street,
        address_number: submissionData.address_number,
        address_complement: submissionData.address_complement,
        address_neighborhood: submissionData.address_neighborhood,
        address_city: submissionData.address_city,
        address_state: submissionData.address_state,
        role: submissionData.role
      });

      alert('Cadastro realizado com sucesso! Verifique seu email para confirmar.');
      navigate('/login', { state: location.state });
    } catch (error) {
      console.error('Erro ao registrar:', error);
      alert(error.message || 'Erro ao registrar. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px',
      }}
    >
      <Paper
        elevation={10}
        sx={{
          padding: { xs: '24px', sm: '40px' },
          borderRadius: '24px',
          maxWidth: '550px',
          width: '100%',
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: '800', color: '#1a365d', mb: 4 }}>
          Criar Conta
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: '300px' }}>
          {activeStep === 0 ? (
            <Box display="flex" flexDirection="column" gap={1.5}>
              <TextField
                label="Nome Completo"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
              <TextField
                label="E-mail"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Celular"
                  fullWidth
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  InputProps={{
                    inputComponent: MaskedInput,
                    inputProps: { mask: '(00) 00000-0000' },
                  }}
                  required
                />
                <TextField
                  label="CPF (Opcional)"
                  fullWidth
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  InputProps={{
                    inputComponent: MaskedInput,
                    inputProps: { mask: '000.000.000-00' },
                  }}
                />
              </Box>
              <TextField
                label="Senha"
                type="password"
                fullWidth
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={!!errors.password}
                helperText={errors.password}
                required
                placeholder="Mínimo 6 caracteres"
              />
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={1.5}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={skipAddress}
                    onChange={(e) => setSkipAddress(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Desejo cadastrar endereço depois (Retirada ou Frete a combinar)
                  </Typography>
                }
              />

              {!skipAddress ? (
                <>
                  <TextField
                    label="CEP"
                    fullWidth
                    value={formData.address_cep}
                    onChange={handleCepChange}
                    error={!!errors.address_cep}
                    helperText={errors.address_cep}
                    InputProps={{
                      inputComponent: MaskedInput,
                      inputProps: { mask: '00000-000' },
                      endAdornment: loadingCep && <CircularProgress size={20} />
                    }}
                    required
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Rua"
                      fullWidth
                      value={formData.address_street}
                      onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                      error={!!errors.address_street}
                      helperText={errors.address_street}
                      required
                      sx={{ flex: 3 }}
                    />
                    <TextField
                      label="Nº"
                      fullWidth
                      value={formData.address_number}
                      onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                      error={!!errors.address_number}
                      helperText={errors.address_number}
                      required
                      sx={{ flex: 1 }}
                    />
                  </Box>
                  <TextField
                    label="Complemento"
                    fullWidth
                    value={formData.address_complement}
                    onChange={(e) => setFormData({ ...formData, address_complement: e.target.value })}
                  />
                  <TextField
                    label="Bairro"
                    fullWidth
                    value={formData.address_neighborhood}
                    onChange={(e) => setFormData({ ...formData, address_neighborhood: e.target.value })}
                    error={!!errors.address_neighborhood}
                    helperText={errors.address_neighborhood}
                    required
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Cidade"
                      fullWidth
                      value={formData.address_city}
                      onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                      error={!!errors.address_city}
                      helperText={errors.address_city}
                      required
                      sx={{ flex: 3 }}
                    />
                    <TextField
                      label="UF"
                      fullWidth
                      value={formData.address_state}
                      onChange={(e) => setFormData({ ...formData, address_state: e.target.value.toUpperCase() })}
                      error={!!errors.address_state}
                      helperText={errors.address_state}
                      required
                      inputProps={{ maxLength: 2 }}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </>
              ) : (
                <Alert severity="info" sx={{ mt: 2, borderRadius: '12px' }}>
                  <strong>Atenção:</strong> Sem o cadastro de endereço, você deverá optar pela <strong>Retirada Grátis</strong> (Brasília-DF) ou o <strong>Frete a Combinar</strong> por sua conta via Uber/Logística no momento do pedido.
                </Alert>
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: '1px solid #edf2f7' }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            sx={{ color: '#4a5568' }}
          >
            Voltar
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
            endIcon={activeStep === 0 ? <ArrowForwardIcon /> : <CheckCircleIcon />}
            sx={{
              bgcolor: activeStep === 0 ? '#4299e1' : '#48bb78',
              '&:hover': { bgcolor: activeStep === 0 ? '#3182ce' : '#38a169' },
              px: 4,
              py: 1.2,
              borderRadius: '12px',
              fontWeight: 'bold'
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (activeStep === 0 ? 'Próximo' : 'Finalizar')}
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Já possui conta? {' '}
            <Link
              href="/login"
              underline="hover"
              sx={{ color: '#667eea', fontWeight: 'bold' }}
            >
              Fazer Login
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Register;