// src/config/config.js
export const config = {
    // Configurações de personalização de etiquetas
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
        DancingScript: "'Dancing Script', cursive",
        Roboto: "'Roboto', sans-serif",
        AgencyFB: "'AgencyFB-Bold', sans-serif",
        Delius: "'Delius-Regular', cursive",
        Borel: "'Borel-Regular', cursive",
        KomikaAxis: "'KomikaAxis', sans-serif",
      },
      "personagem": true,
      "fundo": true,
      tamanhoPersonagem: {
        min: {
          width: 50, // Largura mínima em pixels
          height: 50, // Altura mínima em pixels
        },
        max: {
          width: 200, // Largura máxima em pixels
          height: 200, // Altura máxima em pixels
        },
      },
      corFundoPadrao: "#000080", // Azul Marinho como cor padrão (CMYK: 100, 100, 0, 50)
      corFontePadrao: "#FFFFFF", // Branco como cor padrão da fonte (CMYK: 0, 0, 0, 0)
    },
  
    // URLs ou caminhos para os arquivos JSON locais
    api: {
      baseUrl: "", // Deixe vazio ou use um caminho base relativo
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