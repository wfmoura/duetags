const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const config = require('./src/config/config');
const app = express();
require('dotenv').config();
const authenticateToken = require('./utils/authMiddleware'); // Importe o middleware aqui
const authController = require('./controllers/authController');
const etiquetaController = require('./controllers/etiquetaController');

// Define a porta dinamicamente (usando variável de ambiente ou padrão 3001)
const port = process.env.PORT || 3001;

// Configuração do Supabase
const supabase = createClient(config.supabase.url, config.supabase.key);

// Configuração do CORS
const corsOptions = {
  origin: 'http://localhost:3000', // Substitua pela URL do frontend
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Middleware para processar JSON com limite aumentado
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Middleware de debug
app.use((req, res, next) => {
  if (config.debug.enabled) {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    console.log('[DEBUG] Body:', req.body);
    console.log('[DEBUG] Cookies:', req.cookies); // Log dos cookies
    console.log('[DEBUG] rule:', req.rule); // Log da regra
  }
  next();
});

// Rotas de Autenticação
app.post('/api/auth/register', (req, res) => authController.register(req, res, supabase));
app.post('/api/auth/login', (req, res) => authController.login(req, res, supabase));
app.post('/api/auth/forgot-password', (req, res) => authController.forgotPassword(req, res, supabase));

// Rotas de Etiquetas (protegidas por autenticação)
app.post('/api/saveEtiquetas', authenticateToken, (req, res) => etiquetaController.saveEtiquetas(req, res, supabase));
app.get('/api/getPedidos', authenticateToken, (req, res) => etiquetaController.getPedidos(req, res, supabase));
app.get('/api/downloadPedido/:id', authenticateToken, (req, res) => etiquetaController.downloadPedido(req, res, supabase));

// Rota de teste (opcional)
app.get('/', (req, res) => {
  res.send('Servidor rodando!');
});

// Iniciar o servidor
const server = app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
  if (config.debug.enabled) {
    console.log('[DEBUG] Modo de debug ativado.');
  }
});

// Exporta o app e o server para uso nos testes
module.exports = { app, server };