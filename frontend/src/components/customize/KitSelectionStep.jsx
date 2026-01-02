import React from 'react';
import { Box, Typography } from '@mui/material';
import styled from 'styled-components';

const KitContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  border: 3px solid ${(props) => (props.selected ? "#4CAF50" : "#ccc")};
  border-radius: 15px;
  padding: 20px;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
  box-shadow: ${(props) =>
        props.selected ? "0 8px 30px rgba(76, 175, 80, 0.5)" : "none"};
  background-color: #82ffb5;
  width: 320px; /* Adjusted to fit 300x300 + padding */
  max-width: 100%;
  height: auto;
  &:hover {
    transform: scale(1.05);
    border-color: #4CAF50;
    box-shadow: 0 8px 30px rgba(76, 175, 80, 0.5);
  }

  img {
    width: 300px;
    height: 300px;
    object-fit: contain;
    border-radius: 10px;
    background: white; /* Optional: adds a clean background for transparent images */
  }
`;

const KitSelectionStep = ({ kits, etiquetas, selectedKit, onSelectKit }) => {
    return (
        <Box>
            <Typography variant="h6" gutterBottom align="center">
                Selecione o Kit Ideal
            </Typography>
            <Box display="flex" flexWrap="wrap" justifyContent="center" gap={3}>
                {kits?.map((kit) => (
                    <KitContainer
                        key={kit.id}
                        selected={selectedKit?.id === kit.id}
                        onClick={() => onSelectKit(kit)}
                    >
                        <img src={kit.thumbnail} alt={kit.nome} />
                        <Typography variant="h6" mt={2}>{kit.nome}</Typography>
                        <Typography variant="body1" color="primary" fontWeight="bold">{kit.preco}</Typography>
                        <Box mt={2}>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Inclui:</Typography>
                            {kit.etiquetas?.map((eq, index) => {
                                const info = etiquetas?.find(e => e.id === eq.id);
                                return (
                                    <Typography key={index} variant="caption" display="block" color="text.secondary">
                                        • {eq.quantidade}x {info?.nome || eq.id} ({info ? `${info.width}cm x ${info.height}cm` : 'dimensões sob consulta'})
                                    </Typography>
                                );
                            })}
                        </Box>
                    </KitContainer>
                ))}
            </Box>
        </Box>
    );
};

export default KitSelectionStep;
