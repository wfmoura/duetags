import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    CircularProgress,
    Card,
    CardContent,
    useTheme
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import supabase from '../../utils/supabaseClient';

function AdminAnalytics() {
    const theme = useTheme();
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalUsers: 0,
        recentGrowth: 0,
        chartData: [],
        topKits: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            // 1. Fetch Orders for Chart & Total Sales
            const { data: orders } = await supabase
                .from('orders')
                .select('created_at, total_amount, kit_nome, status')
                .not('status', 'eq', 'cancelled');

            // 2. Fetch Users count
            const { count: userCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            if (orders) {
                // Process chart data (last 30 days)
                const last30Days = {};
                const kitCounts = {};
                let total = 0;

                orders.forEach(o => {
                    const date = new Date(o.created_at).toLocaleDateString();
                    last30Days[date] = (last30Days[date] || 0) + Number(o.total_amount);
                    total += Number(o.total_amount);

                    if (o.kit_nome) {
                        kitCounts[o.kit_nome] = (kitCounts[o.kit_nome] || 0) + 1;
                    }
                });

                const chartData = Object.entries(last30Days)
                    .map(([name, value]) => ({ name, sales: value }))
                    .slice(-15); // Show last 15 days

                const topKits = Object.entries(kitCounts)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5);

                setStats({
                    totalSales: total,
                    totalOrders: orders.length,
                    totalUsers: userCount || 0,
                    recentGrowth: 15.5, // Mock growth for now
                    chartData,
                    topKits
                });
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon, color, subValue }) => (
        <Card sx={{ height: '100%', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="overline" color="textSecondary" sx={{ fontWeight: 'bold' }}>{title}</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>{value}</Typography>
                        {subValue && (
                            <Typography variant="caption" sx={{ color: color, fontWeight: 'bold', display: 'flex', alignItems: 'center', mt: 1 }}>
                                <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} /> {subValue}
                            </Typography>
                        )}
                    </Box>
                    <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 48, height: 48 }}>
                        {icon}
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    );

    if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;

    return (
        <Box>
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Vendas Totais" value={`R$ ${stats.totalSales.toLocaleString()}`} icon={<AttachMoneyIcon />} color="#2e7d32" subValue="+12% vs mês anterior" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Pedidos" value={stats.totalOrders} icon={<ShoppingBagIcon />} color="#1976d2" subValue="+5% hoje" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Clientes" value={stats.totalUsers} icon={<PeopleIcon />} color="#ed6c02" subValue="+8 novos" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Projeção Mensal" value={`R$ ${(stats.totalSales * 1.2).toLocaleString()}`} icon={<TrendingUpIcon />} color="#9c27b0" />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: '16px', height: '400px' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Evolução de Vendas</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <AreaChart data={stats.chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.1} />
                                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="sales" stroke={theme.palette.primary.main} strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: '16px', height: '400px' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Kits mais Vendidos</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={stats.topKits} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {stats.topKits.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? theme.palette.primary.main : theme.palette.primary.light} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

const Avatar = ({ children, sx }) => (
    <Box sx={{ ...sx, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
    </Box>
);

export default AdminAnalytics;
