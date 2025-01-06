import React, { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Box, Typography } from '@mui/material';

const EtiquetaContainer = styled.div`
  position: relative;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  background-image: url(${(props) => props.backgroundImage});
  background-size: cover;
  background-position: center;
  border: 1px dashed black;
  border-radius: ${(props) => (props.tipo === 'Redonda' ? '50%' : '5px')};
`;

const AreaDelimitada = styled.div`
  position: absolute;
  left: ${(props) => props.left}px;
  top: ${(props) => props.top}px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  border: 1px dashed red;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  overflow: hidden;
`;

const TextoContainer = styled.div`
  font-size: ${({ fontSize }) => fontSize}px;
  font-family: ${({ fontFamily }) => fontFamily};
  color: ${({ textColor }) => textColor};
  text-align: center;
  word-break: break-word;
  max-width: 100%;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

function AjusteDinamicoTexto({ text, areaWidth, areaHeight, fontFamily, fontSize, textColor, onFontSizeChange }) {
  const adjustedFontSize = useRef(fontSize);

  const adjustFontSize = useCallback((text, maxWidth, maxHeight) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    let low = 8; // Tamanho mínimo da fonte
    let high = 32; // Tamanho máximo da fonte
    let mid;

    if (!text) {
      adjustedFontSize.current = fontSize;
      onFontSizeChange(fontSize);
      return;
    }

    while (low <= high) {
      mid = Math.floor((low + high) / 2);
      context.font = `${mid}px ${fontFamily}`;
      const metrics = context.measureText(text);
      const textWidth = metrics.width;
      const textHeight = metrics.actualBoundingBoxDescent + metrics.actualBoundingBoxAscent;

      if (textWidth > maxWidth || textHeight > maxHeight) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    adjustedFontSize.current = high;
    onFontSizeChange(high);
  }, [fontFamily, fontSize, onFontSizeChange]);

  useEffect(() => {
    adjustFontSize(text, areaWidth, areaHeight);
  }, [text, areaWidth, areaHeight, adjustFontSize]);

  return (
    <TextoContainer fontSize={adjustedFontSize.current} fontFamily={fontFamily} textColor={textColor}>
      {text}
    </TextoContainer>
  );
}

function Etiquetas({ kit, theme, customizations, zoom }) {
  const { nome, complemento, turma, fontFamily, textColor } = customizations;

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      {kit.etiquetas.map((etiqueta, index) => (
        <Box key={index} mb={4}>
          <EtiquetaContainer
            width={etiqueta.width * zoom}
            height={etiqueta.height * zoom}
            tipo={etiqueta.tipo}
            backgroundImage={theme.backgroundImage}
          >
            <AreaDelimitada
              left={etiqueta.area.left * zoom}
              top={etiqueta.area.top * zoom}
              width={etiqueta.area.width * zoom}
              height={etiqueta.area.height * zoom}
            >
              {etiqueta.campos.map((campo) => {
                let text;
                if (etiqueta.tipo === 'Pequena' && campo === 'nome') {
                  text = `${nome} ${complemento}`.trim();
                } else {
                  text = customizations[campo];
                }

                return (
                  <AjusteDinamicoTexto
                    key={campo}
                    text={text}
                    areaWidth={etiqueta.area.width * zoom}
                    areaHeight={etiqueta.area.height * zoom / etiqueta.campos.length}
                    fontFamily={fontFamily}
                    fontSize={16} // Tamanho inicial da fonte
                    textColor={textColor}
                    onFontSizeChange={() => {}}
                  />
                );
              })}
            </AreaDelimitada>
          </EtiquetaContainer>
          <Typography variant="body2" mt={1}>
            {etiqueta.nome} ({(etiqueta.width * zoom / 37.8).toFixed(2)}x{(etiqueta.height * zoom / 37.8).toFixed(2)} cm)
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default Etiquetas;