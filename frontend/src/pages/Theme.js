import React, { useContext, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { AppContext } from '../contexts/AppContext';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const ThumbnailContainer = styled.div`
  display: inline-block;
  margin: 10px;
  border: 3px solid ${(props) => (props.selected ? '#4CAF50' : '#ccc')};
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  box-shadow: ${(props) => (props.selected ? '0 8px 30px rgba(76, 175, 80, 0.5)' : 'none')};

  &:hover {
    transform: scale(1.05);
    border-color: #4CAF50;
    box-shadow: 0 8px 30px rgba(76, 175, 80, 0.5);
  }

  img {
    display: block;
    width: 150px;
    height: 150px;
    object-fit: cover;
  }
`;

function Theme() {
  const { temas, selectedTheme, setSelectedTheme } = useContext(AppContext);
  const [selectedId, setSelectedId] = useState(selectedTheme?.id || null);
  const navigate = useNavigate();
  console.log("Temas recebidos no Theme.js:", temas);
  useEffect(() => {
    if (selectedTheme) {
      setSelectedId(selectedTheme.id);
    }
  }, [selectedTheme]);

  const handleThemeSelection = (theme) => {
    setSelectedTheme(theme);
    setSelectedId(theme.id);
    navigate('/customize');
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Escolha o tema das suas etiquetas</Typography>
      <Box display="flex" flexWrap="wrap" justifyContent="center">
        {temas.map((theme) => (
          <ThumbnailContainer
            key={theme.id} // Adicionando a prop "key" com um valor único
            selected={theme.id === selectedId}
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