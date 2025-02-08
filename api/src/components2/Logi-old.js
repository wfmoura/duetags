import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log('Enviando dados:', { email, password });
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token); // Armazena o token JWT
      localStorage.setItem('user', JSON.stringify(response.data.user)); // Armazena o usuário logado
      console.log(localStorage.getItem('token'));
      navigate('/'); // Redireciona para a página inicial após o login
    } catch (error) {
      alert('E-mail ou senha incorretos');
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
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
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
            Login
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Senha"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
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
            >
              Entrar
            </Button>
          </form>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link
              href="/forgot-password"
              underline="hover"
              sx={{ color: '#6a11cb', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Esqueci minha senha
            </Link>
          </Box>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Não tem uma conta?{' '}
              <Link
                href="/register"
                underline="hover"
                sx={{ color: '#6a11cb', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Cadastre-se
              </Link>
            </Typography>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}

export default Login;