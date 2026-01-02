import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#26a69a', // Verde água escuro/Teal para botões
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#bab3ff', // Cor secundária para fundos e elementos de destaque
    },
    tertiary: {
      main: '#e0e0e0', // Cor principal
      dark: '#6bbf93', // Cor mais escura para hover
      light: '#bab3ff', // Cor mais clara
    },
    background: {
      default: '#bab3ff', // Cor de fundo padrão para as páginas
      paper: '#ffffff', // Cor de fundo padrão para papel
    },
  },
});

export default theme;