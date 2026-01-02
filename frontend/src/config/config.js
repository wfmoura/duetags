// src/config/config.js
export const config = {
  // Configurações de personalização de etiquetas
  supabase: {
    url: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' && process.env?.REACT_APP_SUPABASE_URL) || "https://gwptcsxlpcqhijodyeaq.supabase.co",
    key: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_KEY) || (typeof process !== 'undefined' && process.env?.REACT_APP_SUPABASE_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cHRjc3hscGNxaGlqb2R5ZWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NjA1MDgsImV4cCI6MjA4MTIzNjUwOH0.unY30UgwLs0gYbrFK3Qi4HKQWQfzB0zTBz72Z3xrv-M",
  },
  ai: {
    apiKey: "AIzaSyCmJ0iQ5W9nDmTp7foaeJFf9GhHoAw6mxk", // Gemini API Key
    corFundo: "#E3F2FD", // Default background color for AI, matching corFundoPadrao
    cmykFonte: { c: 0, m: 0, y: 0, k: 0 },
    cmykFundo: { c: 0, m: 0, y: 0, k: 0 },
  },
  personalizacao: {
    campos: {
      nome: {
        maxCaracteres: 20,
        obrigatorio: true,
        mensagemErro: "O campo Nome é obrigatório e deve ter até 20 caracteres.",
      },
      complemento: {
        maxCaracteres: 20,
        obrigatorio: false,
        mensagemErro: "O campo Complemento deve ter até 20 caracteres.",
      },
      turma: {
        maxCaracteres: 20,
        obrigatorio: false,
        mensagemErro: "O campo Turma deve ter até 20 caracteres.",
      },
    },
    zoom: {
      min: 1,
      max: 2,
      step: 0.1,
      default: 1.5,
    },
    fontesDisponiveis: {
      Atma: "'Atma', sans-serif", // Fonte Atma
      DancingScript: "'Dancing Script', cursive", // Fonte Dancing Script
      Delius: "'Delius', cursive", // Fonte Delius
      FugazOne: "'Fugaz One', sans-serif", // Fonte Fugaz One
      Roboto: "'Roboto', sans-serif", // Fonte Roboto
      KomikaAxis: "'KomikaAxis', sans-serif",
    },
    personagem: true,
    fundo: true,
    mostrarLinhaVermelha: false,
    mostrarLinhaPreta: false,
    porcentagemAreaPersonagem: 10.0, // 70% da área da etiqueta
    corFontePadrao: "#FFFFFF", // Branco como cor padrão da fonte (CMYK: 0, 0, 0, 0)
    corFundoPadrao: "#E3F2FD", // Azul claro como cor padrão do fundo
    // Novos parâmetros para controle de movimentação e redimensionamento
    permitirMovimentacaoPersonagem: true, // Habilita ou desabilita a movimentação do personagem
    permitirRedimensionamentoPersonagem: true, // Habilita ou desabilita o redimensionamento do personagem
  },

  // URLs ou caminhos para os arquivos JSON locais
  api: {
    baseUrl: "", // Base URL removida pois estamos usando Supabase diretamente
    endpoints: {
      temas: "/data/Themes.json",       // Caminho para o arquivo de temas
      kits: "/data/Kits.json",          // Caminho para o arquivo de kits
      etiquetas: "/data/Etiquetas.json", // Caminho para o arquivo de etiquetas
    },
  },

  // Mensagens gerais do sistema
  mensagens: {
    erroValidacao: "Por favor, corrija os erros antes de finalizar.",
    sucessoCompra: "Compra realizada com sucesso!",
  },

  // Outras configurações globais
  paths: {
    imagens: {
      temas: "/images/temas/",
      kits: "/images/kits/",
    },

  },


};



export const SUPABASE_URL = config.supabase.url;
export const SUPABASE_KEY = config.supabase.key;