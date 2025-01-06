import React, { createContext, useState, useEffect } from 'react';
import { config } from '../config/config'; // Importando o arquivo de configuração

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [temas, setTemas] = useState([]);
  const [kits, setKits] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [selectedKit, setSelectedKit] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [customizations, setCustomizations] = useState({
    nome: '',
    complemento: '',
    turma: '',
    fontFamily: config.personalizacao.fontesDisponiveis.Roboto, // Fonte padrão
    textColor: '#000000',
  });

  // Carrega os dados dos arquivos JSON
  useEffect(() => {
    const loadData = async () => {
      try {
        const [temasResponse, kitsResponse, etiquetasResponse] = await Promise.all([
          fetch(config.api.endpoints.temas).then((res) => res.json()),       // Busca o arquivo Themes.json
          fetch(config.api.endpoints.kits).then((res) => res.json()),         // Busca o arquivo Kits.json
          fetch(config.api.endpoints.etiquetas).then((res) => res.json()),    // Busca o arquivo Etiquetas.json
        ]);

        setTemas(temasResponse.temas);
        setKits(kitsResponse.kits);
        setEtiquetas(etiquetasResponse.etiquetas);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        temas,
        kits,
        etiquetas,
        selectedKit,
        setSelectedKit,
        selectedTheme,
        setSelectedTheme,
        customizations,
        setCustomizations,
        fontesDisponiveis: config.personalizacao.fontesDisponiveis, // Disponibiliza as fontes
      }}
    >
      {children}
    </AppContext.Provider>
  );
};