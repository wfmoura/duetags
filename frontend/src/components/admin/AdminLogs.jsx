import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Avatar,
    Chip
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SettingsIcon from '@mui/icons-material/Settings';
import supabase from '../../utils/supabaseClient';

function AdminLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            const { data, error } = await supabase
                .from('access_logs')
                .select('*, profiles(name, email)')
                .order('created_at', { ascending: false })
                .limit(100);

            if (!error) setLogs(data);
            setLoading(false);
        };
        fetchLogs();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'login': return <LoginIcon fontSize="small" />;
            case 'purchase': return <ShoppingCartIcon fontSize="small" />;
            default: return <SettingsIcon fontSize="small" />;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'login': return 'primary';
            case 'purchase': return 'success';
            case 'error': return 'error';
            default: return 'default';
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Registros de Atividade</Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee' }}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell>Data/Hora</TableCell>
                            <TableCell>Usuário</TableCell>
                            <TableCell>Evento</TableCell>
                            <TableCell>Descrição</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id} hover>
                                <TableCell sx={{ color: 'text.secondary' }}>
                                    {new Date(log.created_at).toLocaleString('pt-BR')}
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                                            {(log.profiles?.name || '?')[0]}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2">{log.profiles?.name || 'Sistema'}</Typography>
                                            <Typography variant="caption" color="textSecondary">{log.profiles?.email}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        icon={getIcon(log.event_type)}
                                        label={log.event_type}
                                        size="small"
                                        color={getColor(log.event_type)}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>{log.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default AdminLogs;
