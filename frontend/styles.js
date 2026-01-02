import React from 'react';
import styled from 'styled-components';
import { config } from '../config/config';

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
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: ${props => props.mostrarLinhaVermelha ? '2px dashed red' : 'none'};
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: ${props => props.mostrarLinhaPreta ? '1px solid black' : 'none'};
    pointer-events: none;
  }
`;

const Texto = styled.span`
  font-size: ${props => props.fontSize || '16px'};
  font-family: ${props => props.fontFamily || "'Roboto', sans-serif"};
  color: ${props => props.textColor || 'black'};
  text-shadow: ${props => props.textShadow || 'none'};
`;

const PersonagemImagem = styled.img`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  object-fit: contain;
  margin-top: 10px;
`;

function Etiqueta({
  width,
  height,
  backgroundColor,
  fontFamily,
  linha1,
  linha2,
  textoExclusivo,
  backgroundImage,
  fontSize,
  textColor,
  textShadow,
  tipoEtiqueta,
  personagemImagem,
}) {
  const { mostrarLinhaVermelha, mostrarLinhaPreta } = config.personalizacao;
  const { min, max } = config.personalizacao.tamanhoPersonagem[tipoEtiqueta];

  const initialWidth = Math.min(width * 0.5, max.width);
  const initialHeight = Math.min(height * 0.5, max.height);

  return (
    <EtiquetaDiv
      width={width}
      height={height}
      backgroundColor={backgroundColor}
      backgroundImage={backgroundImage}
      mostrarLinhaVermelha={mostrarLinhaVermelha}
      mostrarLinhaPreta={mostrarLinhaPreta}
    >
      <Texto fontSize={fontSize} fontFamily={fontFamily} textColor={textColor} textShadow={textShadow}>
        {linha1}
      </Texto>
      <Texto fontSize={fontSize} fontFamily={fontFamily} textColor={textColor} textShadow={textShadow}>
        {linha2}
      </Texto>
      <Texto fontSize={fontSize} fontFamily={fontFamily} textColor={textColor} textShadow={textShadow}>
        {textoExclusivo}
      </Texto>
      {personagemImagem && (
        <PersonagemImagem
          src={personagemImagem}
          alt="Personagem"
          width={initialWidth}
          height={initialHeight}
        />
      )}
    </EtiquetaDiv>
  );
}

export default Etiqueta;