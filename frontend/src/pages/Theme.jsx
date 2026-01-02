// pages/Theme.js
import React, { useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { AppContext } from '../contexts/AppContext';
import { useProduct } from '../contexts/ProductContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const ThumbnailContainer = styled.div`
  display: inline-block;
  margin: 10px;
  border: 3px solid ${(props) => (props.selected ? '#4CAF50' : '#ccc')};
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  box-shadow: ${(props) => (props.selected ? '0 8px 30px rgba(76, 175, 80, 0.5)' : 'none')};
  background-color: #82ffb5;
  width: 100%;

  @media (min-width: 768px) {
    width: 150px;
    height: 150px;
  }

  &:hover {
    transform: scale(1.05);
    border-color: #4CAF50;
    box-shadow: 0 8px 30px rgba(76, 175, 80, 0.5);
  }

  img {
    display: block;
    width: 100%;
    height: auto;

    @media (min-width: 768px) {
      width: 150px;
      height: 150px;
    }
  }
`;

function Theme() {
  const { selectedTheme, setSelectedTheme } = useContext(AppContext);
  const { temas } = useProduct();
  const navigate = useNavigate();

  const handleThemeSelection = (theme) => {
    setSelectedTheme(theme); // Atualiza o tema selecionado no contexto
    navigate('/customize'); // Redireciona para a página de personalização
  };

  return (
    <Box p={4} sx={{ backgroundColor: 'background.default' }}>
      <Typography variant="h4" gutterBottom>Escolha o tema das suas etiquetas</Typography>
      <Box display="flex" flexWrap="wrap" justifyContent="center">
        {temas.map((theme) => (
          <ThumbnailContainer
            key={theme.id}
            selected={selectedTheme?.id === theme.id}
            onClick={() => handleThemeSelection(theme)}
          >
            <img src={theme.thumbnail} alt={theme.nome} />
          </ThumbnailContainer>
        ))}
      </Box>
    </Box>
  );
}

export default Theme;