import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useProduct } from '../../contexts/ProductContext';
import supabase from '../../utils/supabaseClient';
import PrintLayout from '../../components/admin/PrintLayout';

const PrintPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { etiquetas, kits, loading: productsLoading } = useProduct();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;

            try {
                const { data, error: fetchError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single();

                if (fetchError) throw fetchError;
                setOrder(data);
            } catch (err) {
                console.error("Erro ao buscar pedido para impressão:", err);
                setError("Pedido não encontrado ou erro ao carregar.");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrder();
        }
    }, [orderId, user]);

    // Check admin access
    if (user && user.role !== 'admin') {
        return (
            <Box p={4} textAlign="center">
                <Typography variant="h5">Acesso Restrito</Typography>
                <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>Voltar para Home</Button>
            </Box>
        );
    }

    if (loading || productsLoading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
                <Typography variant="h6" color="textSecondary">Preparando layout de impressão...</Typography>
            </Box>
        );
    }

    if (error || !order) {
        return (
            <Box p={4} textAlign="center">
                <Typography variant="h6" color="error">{error || "Pedido não encontrado."}</Typography>
                <Button onClick={() => window.close()} sx={{ mt: 2 }}>Fechar Aba</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#1a1a1a', minHeight: '100vh' }}>
            <PrintLayout
                order={order}
                etiquetas={etiquetas}
                kits={kits}
                onClose={() => window.close()}
            />
        </Box>
    );
};

export default PrintPage;
