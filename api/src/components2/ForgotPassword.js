import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para enviar e-mail de recuperação
    alert(`E-mail de recuperação enviado para ${email}`);
    onBackToLogin();
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Recuperar Senha
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
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Enviar
        </Button>
      </form>
      <Box sx={{ mt: 2 }}>
        <Button onClick={onBackToLogin}>Voltar para o Login</Button>
      </Box>
    </Box>
  );
}

export default ForgotPassword;