import React from 'react';
import styled from 'styled-components';

const EtiquetaDiv = styled.div`
  border: 1px solid black;
  margin: 10px;
  padding: 10px;
  text-align: center;
  width: ${props => props.width || '200px'};
  height: ${props => props.height || '100px'};
  background-image: ${props => props.backgroundImage ? `url(${props.backgroundImage})` : 'none'};
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-wrap: break-word;
`;

const Texto = styled.span`
  font-size: ${props => props.fontSize || '16px'};
  font-family: ${props => props.fontFamily || "'Roboto', sans-serif"}; // Fonte padrão (Google Fonts)
  color: ${props => props.textColor || 'black'};
  text-shadow: ${props => props.textShadow || 'none'};
`;

function Etiqueta({ width, height, backgroundColor, fontFamily, linha1, linha2, textoExclusivo, backgroundImage, fontSize, textColor, textShadow }) {
  return (
    <EtiquetaDiv width={width} height={height} backgroundColor={backgroundColor} backgroundImage={backgroundImage}>
      <Texto fontSize={fontSize} fontFamily={fontFamily} textColor={textColor} textShadow={textShadow}>{linha1}</Texto>
      <Texto fontSize={fontSize} fontFamily={fontFamily} textColor={textColor} textShadow={textShadow}>{linha2}</Texto>
      <Texto fontSize={fontSize} fontFamily={fontFamily} textColor={textColor} textShadow={textShadow}>{textoExclusivo}</Texto>
    </EtiquetaDiv>
  );
}

export default Etiqueta;