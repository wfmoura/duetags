import React, { useState } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
    Container,
    IconButton
} from '@mui/material';
import {
    AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LabelIcon from '@mui/icons-material/Label';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BugReportIcon from '@mui/icons-material/BugReport';
import { useNavigate } from 'react-router-dom';

// Admin Components (To be created)
import AdminEtiquetas from '../../components/admin/AdminEtiquetas';
import AdminKits from '../../components/admin/AdminKits';
import AdminSettings from '../../components/admin/AdminSettings';
import AdminAnalytics from '../../components/admin/AdminAnalytics';
import AdminLogs from '../../components/admin/AdminLogs';
import AdminCoupons from '../../components/admin/AdminCoupons';
import AdminClientes from '../../components/admin/AdminClientes';
import AdminTemas from '../../components/admin/AdminTemas';
import AdminCreateThemeAI from '../../components/admin/AdminCreateThemeAI';
import AdminTestFlow from '../../components/admin/AdminTestFlow';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`admin-tabpanel-${index}`}
            aria-labelledby={`admin-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const ThemesContainer = () => {
    const [view, setView] = useState('list'); // 'list' or 'create-ai'

    if (view === 'create-ai') {
        return <AdminCreateThemeAI onBack={() => setView('list')} />;
    }

    return <AdminTemas onGoToAiCreation={() => setView('create-ai')} />;
};

function AdminDashboard() {
    const [tabValue, setTabValue] = useState(0);
    const navigate = useNavigate();

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ flexGrow: 1, bgcolor: '#f4f6f8', minHeight: '100vh', pb: 5 }}>
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: '0 0 24px 24px',
                    background: 'linear-gradient(135deg, #2956a4 0%, #1a3a73 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}
            >
                <IconButton onClick={() => navigate('/')} sx={{ color: 'white' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        Painel de Controle
                    </Typography>
                    <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                        Gestão total de produtos, pedidos e configurações do sistema.
                    </Typography>
                </Box>
            </Paper>

            <Container maxWidth="xl">
                <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            bgcolor: 'white',
                            '& .MuiTabs-indicator': {
                                height: 3,
                                borderRadius: '3px 3px 0 0'
                            }
                        }}
                    >
                        <Tab icon={<DashboardIcon />} iconPosition="start" label="Início (Analytics)" sx={{ py: 2 }} />
                        <Tab icon={<LabelIcon />} iconPosition="start" label="Etiquetas (CRUD)" sx={{ py: 2 }} />
                        <Tab icon={<InventoryIcon />} iconPosition="start" label="Kits (CRUD)" sx={{ py: 2 }} />
                        <Tab icon={<PeopleIcon />} iconPosition="start" label="Clientes" sx={{ py: 2 }} />
                        <Tab icon={<AutoAwesomeIcon />} iconPosition="start" label="Temas" sx={{ py: 2 }} />
                        <Tab icon={<SettingsIcon />} iconPosition="start" label="Configurações" sx={{ py: 2 }} />
                        <Tab icon={<LoyaltyIcon />} iconPosition="start" label="Cupons" sx={{ py: 2 }} />
                        <Tab icon={<BugReportIcon />} iconPosition="start" label="Testes de Fluxo" sx={{ py: 2 }} />
                        <Tab icon={<ListAltIcon />} iconPosition="start" label="Logs de Acesso" sx={{ py: 2 }} />
                    </Tabs>

                    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#fff' }}>
                        <TabPanel value={tabValue} index={0}>
                            <AdminAnalytics />
                        </TabPanel>
                        <TabPanel value={tabValue} index={1}>
                            <AdminEtiquetas />
                        </TabPanel>
                        <TabPanel value={tabValue} index={2}>
                            <AdminKits />
                        </TabPanel>
                        <TabPanel value={tabValue} index={3}>
                            <AdminClientes />
                        </TabPanel>
                        <TabPanel value={tabValue} index={4}>
                            {/* Inner state for Themes management */}
                            <ThemesContainer onTabChange={setTabValue} />
                        </TabPanel>
                        <TabPanel value={tabValue} index={5}>
                            <AdminSettings />
                        </TabPanel>
                        <TabPanel value={tabValue} index={6}>
                            <AdminCoupons />
                        </TabPanel>
                        <TabPanel value={tabValue} index={7}>
                            <AdminTestFlow />
                        </TabPanel>
                        <TabPanel value={tabValue} index={8}>
                            <AdminLogs />
                        </TabPanel>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default AdminDashboard;
