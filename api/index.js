require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const cookieParser = require("cookie-parser");
const path = require("path");

const config = require("./src/config/config");
const { authenticateToken } = require("./utils/authMiddleware");
const authController = require("./controllers/authController");
const pedidosRoutes = require("./routes/pedidosRoutes");
const etiquetasRoutes = require("./routes/etiquetasRoutes");
const mercadopagoRoutes = require("./routes/mercadopagoRoutes");

const app = express();

// 🔹 Configuração do CORS
const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// 🔹 Configuração do Banco de Dados (PostgreSQL ou Supabase)
const supabase = createClient(config.supabase.url, config.supabase.key);

// 🔹 Testando a Conexão com o Banco Antes de Rodar o Servidor
async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase.from("orders").select("*").limit(1);
    if (error) throw error;
    console.log("✅ Conexão com o banco de dados estabelecida com sucesso!");
  } catch (err) {
    console.error("❌ Erro na conexão com o banco de dados:", err.message);
    console.error("🔹 Verifique se o PostgreSQL/Supabase está rodando.");
    process.exit(1); // Para o servidor se não conseguir conectar
  }
}

// 🔹 Middleware de debug
app.use((req, res, next) => {
  if (config.debug.enabled) {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    console.log("[DEBUG] Body:", req.body);
    console.log("[DEBUG] Cookies:", req.cookies);
  }
  next();
});

// 🔹 Rotas de Autenticação
app.post("/api/auth/register", (req, res) => authController.register(req, res, supabase));
app.post("/api/auth/login", (req, res) => authController.login(req, res, supabase));
app.post("/api/auth/forgot-password", (req, res) => authController.forgotPassword(req, res, supabase));
app.get("/api/auth/check", authenticateToken, (req, res) => res.status(200).json({ success: true, user: req.user }));

// 🔹 Rotas de Etiquetas, Pedidos e Mercado Pago
app.use("/api/etiquetas", etiquetasRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api", mercadopagoRoutes);

// 🔹 Middleware para tratamento de erros
app.use((err, req, res, next) => {
  if (config.debug.enabled) {
    console.error(`[DEBUG] Erro no servidor: ${err.stack}`);
  }
  res.status(500).json({ success: false, message: "Erro interno no servidor." });
});

// 🔹 Inicialização do Servidor SOMENTE SE o Banco Estiver Online
async function startServer() {
  await testDatabaseConnection(); // Testa o banco antes de rodar

  const port = process.env.PORT || 3001;
  const server = app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
    if (config.debug.enabled) {
      console.log("[DEBUG] Modo de debug ativado.");
    }
  });

  module.exports = { app, server };
}

startServer();
