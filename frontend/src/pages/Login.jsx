import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Link, CircularProgress, Stack, Divider } from '@mui/material';
import { Google as GoogleIcon, Apple as AppleIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login, signInWithSocial } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    try {
      const response = await login(email, password);
      if (!response) return;

      navigate(location.state?.from || "/Customize", {
        state: { ...location.state }
      });
    } catch (error) {
      setError(error.message || "Erro ao fazer login. Tente novamente.");
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

          {location.state?.message && (
            <Typography color="primary" sx={{ mb: 2, textAlign: 'center' }}>
              {location.state.message}
            </Typography>
          )}

          {error && (
            <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
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
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 2,
                backgroundColor: '#9a7abd',
                '&:hover': {
                  backgroundColor: '#7cb483',
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Entrar'}
            </Button>
          </form>

          <Box sx={{ mt: 3, mb: 1, display: 'flex', alignItems: 'center' }}>
            <Divider sx={{ flex: 1 }} />
            <Typography variant="body2" sx={{ mx: 2, color: 'rgba(255,255,255,0.7)' }}>ou entre com</Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>

          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => signInWithSocial('google')}
              sx={{
                borderColor: '#dadce0',
                color: '#3c4043',
                bgcolor: 'white',
                '&:hover': {
                  bgcolor: '#f8f9fa',
                  borderColor: '#dadce0',
                  boxShadow: '0 1px 2px 0 rgba(60,64,67,0.30), 0 1px 3px 1px rgba(60,64,67,0.15)'
                },
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: '500',
                py: 1,
                fontSize: '0.95rem',
                boxShadow: '0 1px 2px 0 rgba(60,64,67,0.30)'
              }}
              startIcon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
              }
            >
              Entrar com Google
            </Button>
          </Stack>

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