// src/config/config.js
module.exports = {
    supabase: {
      url: process.env.SUPABASE_URL || 'https://xxxxxxxxxxxx.supabase.co', // URL do Supabase
      key: process.env.SUPABASE_KEY || 'sua-chave-anon', // Chave de API do Supabase
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'j2k3l@dlk!lakj786d', // Chave secreta para JWT
      expiresIn: '1h', // Tempo de expiração do token JWT
    },
    debug: {
      enabled: process.env.DEBUG_ENABLED === 'true', // Ativa ou desativa o debug
    },
  };