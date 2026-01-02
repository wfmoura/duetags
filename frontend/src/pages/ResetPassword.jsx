import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Link, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import supabase from '../utils/supabaseClient';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
            });

            if (updateError) throw updateError;

            setMessage('Senha alterada com sucesso!');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error('Erro ao redefinir senha:', err);
            setError(err.message || 'Erro ao processar redefinição. O link pode ter expirado.');
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
                        Nova Senha
                    </Typography>

                    <Typography variant="body2" sx={{ textAlign: 'center', mb: 3, color: '#444' }}>
                        Crie uma senha forte e segura para sua conta.
                    </Typography>

                    {message && (
                        <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>
                            {message} Redirecionando para login...
                        </Alert>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Nova Senha"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading || !!message}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Confirmar Nova Senha"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading || !!message}
                            sx={{ mb: 2 }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading || !!message}
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
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Salvar Nova Senha'}
                        </Button>
                    </form>

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Link
                            onClick={() => navigate('/login')}
                            underline="hover"
                            sx={{ color: '#6a11cb', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Ir para o Login
                        </Link>
                    </Box>
                </Box>
            </motion.div>
        </Box>
    );
}

export default ResetPassword;
