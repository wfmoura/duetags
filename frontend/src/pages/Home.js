import React, { useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { AppContext } from '../contexts/AppContext';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom'; // Adicionado

const KitContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
  border: 3px solid ${(props) => (props.selected ? '#4CAF50' : '#ccc')};
  border-radius: 15px;
  padding: 20px;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
  box-shadow: ${(props) => (props.selected ? '0 8px 30px rgba(76, 175, 80, 0.5)' : 'none')};

  &:hover {
    transform: scale(1.05);
    border-color: '#4CAF50';
    box-shadow: '0 8px 30px rgba(76, 175, 80, 0.5)';
  }

  img {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 10px;
  }
`;

function Home() {
  const { kits, selectedKit, setSelectedKit } = useContext(AppContext);
  const navigate = useNavigate(); // Adicionado

  const handleKitSelection = (kit) => {
    setSelectedKit(kit);
    navigate('/theme'); // Navega automaticamente para a tela de temas
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Escolha seu kit de etiquetas</Typography>
      <Box display="flex" flexWrap="wrap" justifyContent="center">
        {kits.map((kit) => (
          <KitContainer
            key={kit.id}
            selected={selectedKit?.id === kit.id}
            onClick={() => handleKitSelection(kit)} // Navega ao clicar
          >
            <img src={kit.thumbnail} alt={kit.nome} />
            <Typography variant="h6" mt={2}>{kit.nome}</Typography>
            <Typography variant="body1" mt={1}>{kit.preco}</Typography>
            <Box mt={2}>
              <Typography variant="body2">Etiquetas incluídas:</Typography>
              {kit.etiquetas.map((etiqueta, index) => (
                <Typography key={index} variant="body2">
                  {etiqueta.quantidade}x {etiqueta.id}
                </Typography>
              ))}
            </Box>
          </KitContainer>
        ))}
      </Box>
    </Box>
  );
}

export default Home;