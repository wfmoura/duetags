import React, { useContext } from 'react';
import styled from 'styled-components';
import { Box, Typography } from '@mui/material';
import { AppContext } from '../contexts/AppContext';

const EtiquetaContainer = styled.div`
  position: relative;
  width: ${(props) => props.$width}cm;
  height: ${(props) => props.$height}cm;
  background-image: url(${(props) => props.$backgroundImage});
  background-size: cover;
  background-position: center;
  border: 1px dashed black;
  border-radius: ${(props) => (props.$tipo === 'redonda' ? '50%' : '5px')};
`;

const AreaDelimitada = styled.div`
  position: absolute;
  left: ${(props) => props.$left}cm;
  top: ${(props) => props.$top}cm;
  width: ${(props) => props.$width}cm;
  height: ${(props) => props.$height}cm;
  border: 1px dashed red;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  overflow: hidden;
`;

const TextoContainer = styled.div`
  font-size: ${({ $fontSizePx }) => $fontSizePx}px; // Tamanho da fonte em pixels
  font-family: ${({ $fontFamily }) => $fontFamily};
  color: ${({ $textColor }) => $textColor};
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  max-width: 100%;
`;

function Etiquetas({ kit, theme, customizations = {}, zoom }) {
  const { etiquetas } = useContext(AppContext);
  const { nome = '', complemento = '', turma = '', fontFamily = 'AgencyFB-Bold', textColor = '#000000' } = customizations;

  const calculateFontSize = (text, maxWidthCm, tipo) => {
    const baseSizePx = 30; // Tamanho máximo da fonte em pixels
    const minSizePx = 10; // Tamanho mínimo da fonte em pixels
    const maxLength = 20; // Limite de caracteres

    // Converte a largura máxima de centímetros para pixels
    const maxWidthPx = maxWidthCm * 37.8; // 1cm = 37.8 pixels

    // Calcula o tamanho da fonte com base no número de caracteres
    const fontSizeBasedOnLength = baseSizePx * (maxLength / (text.length + 5)); // Ajuste para evitar tamanho inicial muito grande

    // Calcula o tamanho da fonte com base no espaço disponível
    const fontSizeBasedOnWidth = (maxWidthPx / maxLength) * 1.8; // Aumentamos o multiplicador para 1.8

    // Para etiquetas redondas, ajustamos o cálculo para considerar o formato circular
    if (tipo === 'redonda') {
      const areaRadiusPx = maxWidthPx / 2; // Raio da área delimitada em pixels
      const fontSizeBasedOnCircle = (areaRadiusPx / Math.sqrt(text.length)) * 2.0; // Ajuste para o formato circular
      return Math.min(Math.max(fontSizeBasedOnCircle, minSizePx), baseSizePx);
    }

    // Retorna o menor valor entre os dois cálculos, respeitando os limites mínimo e máximo
    const finalFontSize = Math.min(fontSizeBasedOnLength, fontSizeBasedOnWidth);
    return Math.max(finalFontSize, minSizePx); // Garante que o tamanho não seja menor que minSizePx
  };

  const etiquetasDoKit = kit.etiquetas.map((etiquetaKit) => {
    const etiquetaInfo = etiquetas.find((e) => e.id === etiquetaKit.id);
    return { ...etiquetaInfo, quantidade: etiquetaKit.quantidade };
  });

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      {etiquetasDoKit.map((etiqueta, index) => {
        const backgroundImage = theme.caminho_img[etiqueta.tipo.toLowerCase()];
        const area = etiqueta.area_delimitada;

        return (
          <Box key={index} mb={4}>
            <EtiquetaContainer
              $width={etiqueta.width * zoom}
              $height={etiqueta.height * zoom}
              $tipo={etiqueta.tipo}
              $backgroundImage={backgroundImage}
            >
              <AreaDelimitada
                $left={area.left * zoom}
                $top={area.top * zoom}
                $width={area.width * zoom}
                $height={area.height * zoom}
              >
                {etiqueta.campos.includes('nome') && (
                  <TextoContainer
                    $fontSizePx={calculateFontSize(nome, area.width * zoom, etiqueta.tipo)}
                    $fontFamily={fontFamily}
                    $textColor={textColor}
                  >
                    {nome}
                  </TextoContainer>
                )}
                {etiqueta.campos.includes('complemento') && complemento && (
                  <TextoContainer
                    $fontSizePx={calculateFontSize(complemento, area.width * zoom, etiqueta.tipo)}
                    $fontFamily={fontFamily}
                    $textColor={textColor}
                  >
                    {complemento}
                  </TextoContainer>
                )}
                {etiqueta.campos.includes('turma') && turma && (
                  <TextoContainer
                    $fontSizePx={calculateFontSize(turma, area.width * zoom, etiqueta.tipo)}
                    $fontFamily={fontFamily}
                    $textColor={textColor}
                  >
                    {turma}
                  </TextoContainer>
                )}
              </AreaDelimitada>
            </EtiquetaContainer>
            <Typography variant="body2" mt={1}>
              {etiqueta.nome} ({etiqueta.width * zoom}cm x {etiqueta.height * zoom}cm)
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export default Etiquetas;