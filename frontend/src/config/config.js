// src/config/config.js
export const config = {
  // Configurações de personalização de etiquetas
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || "https://gwptcsxlpcqhijodyeaq.supabase.co",
    key: import.meta.env.VITE_SUPABASE_KEY,
  },
  ai: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY, // Gemini API Key
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