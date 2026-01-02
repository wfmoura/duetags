import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Link, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import supabase from '../utils/supabaseClient';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (err) {
      console.error('Erro ao solicitar recuperação:', err);
      setError(err.message || 'Erro ao processar solicitação. Tente novamente.');
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
        transition={{ duration: 0.8 }}
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <Box
          sx={{
            backgroundColor: '#a19dce',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            width: '100%',
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
            Recuperar Senha
          </Typography>

          <Typography variant="body2" sx={{ textAlign: 'center', mb: 3, color: '#444' }}>
            Insira seu e-mail e enviaremos um link para você redefinir sua senha.
          </Typography>

          {message && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>
              {message}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
              {error}
            </Alert>
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
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 1,
                py: 1.5,
                backgroundColor: '#9a7abd',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#7cb483',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar Link de Recuperação'}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link
              onClick={() => navigate('/login')}
              underline="hover"
              sx={{ color: '#6a11cb', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
            >
              ← Voltar para o Login
            </Link>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}

export default ForgotPassword;