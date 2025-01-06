// src/App.js
import React, { useRef, useState, useCallback } from 'react';
import { AppBar, Tabs, Tab, Grid } from '@mui/material';
import SelecaoTema from './components/SelecaoTema'; // Importação correta (pasta components)
import Formulario from './components/Formulario'; // Importação correta (pasta components)
import EtiquetaContainer from './components/EtiquetaContainer'; // Importação correta (pasta components)
//import { cmToPx } from './utils/conversions'; // Importação correta (pasta utils)
import html2canvas from 'html2canvas';
/**
 * Converte centímetros para pixels.
 * @param {number} cm - Valor em centímetros.
 * @returns {number} - Valor convertido em pixels.
 */
export const cmToPx = (cm) => cm * 37.8;

/**
 * Converte pixels para centímetros.
 * @param {number} pixels - Valor em pixels.
 * @returns {string} - Valor convertido em centímetros, formatado para 2 casas decimais.
 */
export const pixelsToCm = (pixels) => (pixels / 37.8).toFixed(2);

function App() {
  // Estados da aplicação
  const [abaAtual, setAbaAtual] = useState(0); // Controla a aba atual (0 = Escolher Tema, 1 = Personalizar Etiquetas)
  const [temaSelecionado, setTemaSelecionado] = useState(null); // Armazena o tema selecionado
  const [formValues, setFormValues] = useState({
    nome: '',
    complemento: '',
    turma: '',
  }); // Armazena os valores do formulário
  const [fontFamily, setFontFamily] = useState('AgencyFB-Bold'); // Fonte do texto
  const [textColor, setTextColor] = useState('#000000'); // Cor do texto
  const [zoom, setZoom] = useState(1.5); // Nível de zoom
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [etiquetas, setEtiquetas] = useState([]); // Lista de etiquetas

  // Definição inicial das etiquetas
// eslint-disable-next-line react-hooks/exhaustive-deps
const initialEtiquetas = [
    {
    nome: 'Grande',
    width: cmToPx(16),
    height: cmToPx(8),
    tipo: 'grande',
    area: { left: cmToPx(5.8), top: cmToPx(1.4), width: cmToPx(9), height: cmToPx(5) },
    campos: ['nome', 'complemento', 'turma'],
    },
    {
    nome: 'Pequena',
    width: cmToPx(10),
    height: cmToPx(2),
    tipo: 'pequena',
    area: { left: cmToPx(2.2), top: cmToPx(0.16), width: cmToPx(7), height: cmToPx(1.6) },
    campos: ['nome'],
    },
    {
    nome: 'Intermediária',
    width: cmToPx(12),
    height: cmToPx(5),
    tipo: 'intermediaria',
      area: { left: cmToPx(0.75 * 5), top: cmToPx(0.75 * 0.4), width: cmToPx(0.75 * 8.0), height: cmToPx(4.2) },
    campos: ['nome', 'complemento'],
    },
    {
    nome: 'Redonda',
    width: cmToPx(5),
    height: cmToPx(5),
    tipo: 'redonda',
    area: { left: cmToPx(0.7), top: cmToPx(0.8), width: cmToPx(3.6), height: cmToPx(2.0) },
    campos: ['nome', 'complemento'],
    },
];

  // Função para lidar com a seleção de um tema
const handleTemaSelecionado = useCallback((tema) => {
    setTemaSelecionado(tema);
    // Atualiza as etiquetas com as imagens do tema selecionado
    setEtiquetas(
    initialEtiquetas.map((etiqueta) => ({
        ...etiqueta,
        backgroundImage: tema.imagens[`Tema1_${etiqueta.tipo}`],
    }))
    );
    setAbaAtual(1); // Navega para a aba de personalização
}, [initialEtiquetas]);

  // Função para gerar as etiquetas como imagens
const handleFinalizar = async () => {
setLoading(true);
    try {
    const etiquetasImages = await Promise.all(
        etiquetas.map(async (etiqueta, index) => {
    const element = document.getElementById(`etiqueta-${index}`);
    const canvas = await html2canvas(element, { scale: 2 });
    return canvas.toDataURL('image/png');
        })
    );
    console.log('Etiquetas geradas:', etiquetasImages);
    } catch (error) {
        console.error('Erro ao gerar etiquetas:', error);
    } finally {
    setLoading(false);
    }
};

  // Função para resetar o formulário e as configurações
const handleReset = () => {
    setFormValues({ nome: '', complemento: '', turma: '' });
    setFontFamily('AgencyFB-Bold');
    setTextColor('#000000');
    setZoom(1.5);
};

return (
    <div>
    <AppBar position="static">
        <Tabs
        value={abaAtual}
        onChange={(e, newValue) => setAbaAtual(newValue)}
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
        >
        <Tab label="Escolher Tema" />
        <Tab label="Personalizar Etiquetas" disabled={!temaSelecionado} />
    </Tabs>
    </AppBar>
    {abaAtual === 0 && <SelecaoTema onTemaSelecionado={handleTemaSelecionado} />}
    {abaAtual === 1 && (
        <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
            <Formulario
            formValues={formValues}
            setFormValues={setFormValues}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            textColor={textColor}
            setTextColor={setTextColor}
            zoom={zoom}
            setZoom={setZoom}
            handleFinalizar={handleFinalizar}
            handleReset={handleReset}
            loading={loading}
            />
        </Grid>
        <Grid item xs={12} md={8}>
            <EtiquetaContainer etiquetas={etiquetas} />
        </Grid>
        </Grid>
    )}
    </div>
);
}

export default App;