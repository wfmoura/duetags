import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MaskedInput from '../components/MaskedInput';
import * as yup from 'yup';

const registerSchema = yup.object().shape({
  name: yup.string().required('O campo Nome é obrigatório.'),
  email: yup.string().email('Por favor, insira um e-mail válido.').required('O campo Email é obrigatório.'),
  phone: yup.string().required('O campo Celular é obrigatório.'),
  cpf: yup.string().nullable(),
  password: yup.string().min(6, 'A senha deve ter pelo menos 6 caracteres.').required('O campo Senha é obrigatório.'),
});

function Register() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    role: 'user',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await registerSchema.validate(formData, { abortEarly: false });

      setLoading(true);

      try {
        await register(formData.email, formData.password, {
          name: formData.name,
          phone: formData.phone,
          cpf: formData.cpf,
          role: formData.role
        });

        alert('Cadastro realizado com sucesso! Verifique seu email para confirmar.');
        navigate('/login', { state: location.state });
      } catch (error) {
        console.error('Erro ao registrar:', error);
        alert(error.message || 'Erro ao registrar. Verifique os dados e tente novamente.');
      } finally {
        setLoading(false);
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors = {};
        err.inner.forEach(error => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      } else {
        console.error('Erro na validação:', err);
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #786fd4, #73e6aa)',
        padding: '16px',
      }}
    >
      <Box
        sx={{
          backgroundColor: '#a19dce',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
          Registro
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nome"
            fullWidth
            margin="normal"
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
            margin="normal"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={!!errors.email}
            helperText={errors.email}
            required
          />
          <TextField
            label="Celular"
            fullWidth
            margin="normal"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={!!errors.phone}
            helperText={errors.phone}
            InputProps={{
              inputComponent: MaskedInput,
              inputProps: {
                mask: '(00) 00000-0000',
              },
            }}
            required
          />
          <TextField
            label="CPF (Opcional)"
            fullWidth
            margin="normal"
            value={formData.cpf}
            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            error={!!errors.cpf}
            helperText={errors.cpf}
            InputProps={{
              inputComponent: MaskedInput,
              inputProps: {
                mask: '000.000.000-00',
              },
            }}
          />
          <TextField
            label="Senha"
            type="password"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={!!errors.password}
            helperText={errors.password}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              backgroundColor: '#9a7abd',
              '&:hover': {
                backgroundColor: '#7cb483',
              },
            }}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrar'}
          </Button>
        </form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              underline="hover"
              sx={{ color: '#6a11cb', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Entre aqui
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Register;