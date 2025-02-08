// src/components/Register.js
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Checkbox, FormControlLabel } from '@mui/material';
import InputMask from 'react-input-mask';
import { registerSchema } from '../utils/validationSchemas';
import api from '../api';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    celular: '',
    dataNascimento: '',
    contatoWhatsApp: true,
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await registerSchema.validate(formData, { abortEarly: false });
      const response = await api.post('/auth/register', formData);
      alert(response.data.message);
    } catch (error) {
      alert(error.errors.join('\n'));
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Registro
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="E-mail"
          type="email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <TextField
          label="Nome"
          fullWidth
          margin="normal"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          required
        />
        <InputMask
          mask="(99) 99999-9999"
          value={formData.celular}
          onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
        >
          {() => (
            <TextField
              label="Celular"
              fullWidth
              margin="normal"
              required
            />
          )}
        </InputMask>
        <InputMask
          mask="99/99/9999"
          value={formData.dataNascimento}
          onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
        >
          {() => (
            <TextField
              label="Data de Nascimento"
              fullWidth
              margin="normal"
              required
            />
          )}
        </InputMask>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.contatoWhatsApp}
              onChange={(e) => setFormData({ ...formData, contatoWhatsApp: e.target.checked })}
            />
          }
          label="Contato por WhatsApp"
        />
        <TextField
          label="Senha"
          type="password"
          fullWidth
          margin="normal"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Registrar
        </Button>
      </form>
    </Box>
  );
}

export default Register;