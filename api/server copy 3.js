const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const cookieParser = require('cookie-parser'); // Para manipulação de cookies
const app = express();
require('dotenv').config();
const { authenticateToken } = require('./utils/authMiddleware');
const authController = require('./controllers/authController');
const { exec } = require('child_process');
const path = require('path');
const config = require('./src/config/config');
const pedidosRoutes = require("./routes/pedidosRoutes");
const { saveEtiquetas, getPedidos, downloadPedido } = require('./controllers/etiquetaController');




// Configuração do CORS
const corsOptions = {
  origin: 'http://localhost:3000', // Substitua pela URL do frontend
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
  credentials: true, // Permite o envio de credenciais (cookies, tokens)
  optionsSuccessStatus: 204, // Responde com 204 para requisições OPTIONS
};

// Middleware para processar JSON com limite aumentado
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Middleware para manipulação de cookies
app.use(cookieParser());

// Middleware de CORS
app.use(cors(corsOptions));

// Middleware de debug
app.use((req, res, next) => {
  if (config.debug.enabled) {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    console.log('[DEBUG] Body:', req.body);
    console.log('[DEBUG] Cookies:', req.cookies); // Log dos cookies recebidos
    console.log('[DEBUG] rule:', req.rule); // Log da regra
  }
  next();
});

// Define a porta dinamicamente (usando variável de ambiente ou padrão 3001)
const port = process.env.PORT || 3001;

// Configuração do Supabase
const supabase = createClient(config.supabase.url, config.supabase.key);

// Rotas de Autenticação
app.post('/api/auth/register', (req, res) => authController.register(req, res, supabase));
app.post('/api/auth/login', (req, res) => authController.login(req, res, supabase));
app.post('/api/auth/forgot-password', (req, res) => authController.forgotPassword(req, res, supabase));

// Rota para verificar a autenticação do usuário
app.get('/api/auth/check', authenticateToken, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});





//... (restante do código)

app.post('/api/saveEtiquetas', authenticateToken, async (req, res) => {
  console.log('Entrei na api saveEtiquetas no server.js');
  try {
    const { etiquetas, kitId } = req.body;

    // Inicia uma transação para garantir consistência dos dados
    const { data, error } = await supabase.transaction(async (trx) => {
      // Cria um novo pedido na tabela 'orders'
      const { data: order, error: orderError } = await trx
        .from('orders')
        .insert([{ user_id: req.user.id, kit_id: kitId, status: 'pendente' }])
        .select()
        .single();

      if (orderError) {
        console.error('[DEBUG] Erro ao criar pedido:', orderError);
        throw orderError;
      }
      console.log('[DEBUG] Pedido criado:', order);

      // Salva as imagens no bucket do Supabase
      const uploadedImages = await Promise.all(
        etiquetas.map(async (etiqueta) => {
          const base64Data = etiqueta.image.split(';base64,').pop(); // Remove o cabeçalho Base64
          const filePath = `orders/${order.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.png`; // Caminho único para cada imagem

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('etiquetas') // Nome do bucket
            .upload(filePath, Buffer.from(base64Data, 'base64'), {
              contentType: 'image/png',
            });

          if (uploadError) {
            console.error('[DEBUG] Erro ao fazer upload da imagem:', uploadError);
            throw uploadError;
          }

          return {
            order_id: order.id,
            label_url: filePath, // Caminho da imagem no bucket
            metadata: etiqueta.metadata,
          };
        })
      );

      // Salva os metadados das etiquetas na tabela 'order_labels'
      const { error: labelsError } = await trx.from('order_labels').insert(uploadedImages);

      if (labelsError) {
        console.error('[DEBUG] Erro ao salvar etiquetas:', labelsError);
        throw labelsError;
      }

      console.log('[DEBUG] Etiquetas salvas:', uploadedImages);
      return { orderId: order.id };
    });

    if (error) {
      console.error('Erro ao salvar etiquetas:', error);
      return res.status(500).json({ success: false, message: 'Erro ao salvar etiquetas' });
    }

    console.log('[DEBUG] Etiquetas salvas com sucesso:', data);
    res.status(200).json({ success: true, orderId: data.orderId });
  } catch (error) {
    console.error('Erro ao salvar etiquetas:', error);
    res.status(500).json({ success: false, message: 'Erro ao salvar etiquetas' });
  }
});






//... (restante do código)

// Rotas de Etiquetas (protegidas por autenticação)
app.get('/api/getPedidos', authenticateToken, getPedidos);
app.get('/api/downloadPedido/:id', authenticateToken, downloadPedido);


// Rota para servir a interface web
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para iniciar os testes
app.post('/run-tests', (req, res) => {
  if (config.debug.enabled) {
    console.log('[DEBUG] Iniciando testes...');
  }

  // Executa os testes usando o comando jest
  const testProcess = exec('npm test', (error, stdout, stderr) => {
    if (error) {
      console.error(`[DEBUG] Erro ao executar testes: ${error.message}`);
      return res.status(500).send({ success: false, message: 'Erro ao executar testes', error: error.message });
    }
    if (stderr) {
      console.error(`[DEBUG] Erro no teste: ${stderr}`);
      return res.status(500).send({ success: false, message: 'Erro no teste', error: stderr });
    }
    console.log(`[DEBUG] Testes executados com sucesso: ${stdout}`);
    res.send({ success: true, message: 'Testes executados com sucesso', output: stdout });
  });

  // Captura a saída em tempo real (opcional)
  testProcess.stdout.on('data', (data) => {
    console.log(`[DEBUG] Teste: ${data}`);
  });

  testProcess.stderr.on('data', (data) => {
    console.error(`[DEBUG] Erro no teste: ${data}`);
  });
});

app.use("/api/pedidos", pedidosRoutes);

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  if (config.debug.enabled) {
    console.error(`[DEBUG] Erro no servidor: ${err.stack}`);
  }
  res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
});

// Iniciar o servidor apenas se não estiver em ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    if (config.debug.enabled) {
      console.log('[DEBUG] Modo de debug ativado.');
    }
  });

  // Exporta o app e o server para uso nos testes
  module.exports = { app, server };
} else {
  // Exporta apenas o app para uso nos testes
  module.exports = { app };
}