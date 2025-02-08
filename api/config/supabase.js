const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Carrega variáveis do .env

// Carrega credenciais do Supabase a partir do .env
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("[ERRO] Supabase URL ou Key não definidos no .env.");
  process.exit(1); // Para a execução se houver erro crítico
}

// Inicializa o cliente do Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("[INFO] Conectado ao Supabase.");

module.exports = supabase;
