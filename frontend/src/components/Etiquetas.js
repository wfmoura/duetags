import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { Box, Typography } from '@mui/material';
import { AppContext } from '../contexts/AppContext';
import { Rnd } from 'react-rnd';
import { config } from '../config/config';

const EtiquetaContainer = styled.div`
  position: relative;
  width: ${(props) => props.$width}cm;
  height: ${(props) => props.$height}cm;
  background-color: ${(props) => props.$backgroundColor};
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
  font-size: ${({ $fontSizePx }) => $fontSizePx}px;
  font-family: ${({ $fontFamily }) => $fontFamily};
  color: ${({ $textColor }) => $textColor};
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  max-width: 100%;
`;

function Etiquetas({ kit, theme, customizations = {}, zoom }) {
  const { etiquetas } = useContext(AppContext);
  const { nome = '', complemento = '', turma = '', fontFamily = 'AgencyFB-Bold', textColor = config.personalizacao.corFontePadrao, corFundo = config.personalizacao.corFundoPadrao } = customizations;

  const [personagemPosicao, setPersonagemPosicao] = useState({ x: 10, y: 10 });
  const [personagemTamanho, setPersonagemTamanho] = useState({ width: 100, height: 100 });
  const [showHighlight, setShowHighlight] = useState(false); // Destaque oculto por padrão

  const tamanhoMinimo = config.personalizacao.tamanhoPersonagem.min;
  const tamanhoMaximo = config.personalizacao.tamanhoPersonagem.max;

  const toggleHighlight = () => {
    setShowHighlight(!showHighlight);
  };

  const calculateFontSize = (text, maxWidthCm, tipo) => {
    const baseSizePx = 30;
    const minSizePx = 10;
    const maxLength = 20;
    const maxWidthPx = maxWidthCm * 37.8;

    const fontSizeBasedOnLength = baseSizePx * (maxLength / (text.length + 5));
    const fontSizeBasedOnWidth = (maxWidthPx / maxLength) * 1.8;

    if (tipo === 'redonda') {
      const areaRadiusPx = maxWidthPx / 2;
      const fontSizeBasedOnCircle = (areaRadiusPx / Math.sqrt(text.length)) * 2.0;
      return Math.min(Math.max(fontSizeBasedOnCircle, minSizePx), baseSizePx);
    }

    const finalFontSize = Math.min(fontSizeBasedOnLength, fontSizeBasedOnWidth);
    return Math.max(finalFontSize, minSizePx);
  };

  const etiquetasDoKit = kit.etiquetas.map((etiquetaKit) => {
    const etiquetaInfo = etiquetas.find((e) => e.id === etiquetaKit.id);
    return { ...etiquetaInfo, quantidade: etiquetaKit.quantidade };
  });

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      {etiquetasDoKit.map((etiqueta, index) => {
        const area = etiqueta.area_delimitada;

        return (
          <Box key={index} mb={4}>
            <EtiquetaContainer
              $width={etiqueta.width * zoom}
              $height={etiqueta.height * zoom}
              $tipo={etiqueta.tipo}
              $backgroundColor={corFundo}
            >
              {/* Imagem de fundo (caminho_img) */}
              {config.personalizacao.fundo && etiqueta.imagem && (
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${theme.caminho_img[etiqueta.tipo.toLowerCase()]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              )}

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

              {/* Personagem (thumbnail) */}
              {config.personalizacao.personagem && etiqueta.imagem && (
                <Rnd
                  default={{
                    x: personagemPosicao.x,
                    y: personagemPosicao.y,
                    width: personagemTamanho.width,
                    height: personagemTamanho.height,
                  }}
                  bounds="parent"
                  minWidth={tamanhoMinimo.width}
                  minHeight={tamanhoMinimo.height}
                  maxWidth={tamanhoMaximo.width}
                  maxHeight={tamanhoMaximo.height}
                  onDragStop={(e, d) => {
                    setPersonagemPosicao({ x: d.x, y: d.y });
                  }}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    setPersonagemTamanho({
                      width: ref.style.width,
                      height: ref.style.height,
                    });
                    setPersonagemPosicao({
                      x: position.x,
                      y: position.y,
                    });
                  }}
                  style={{
                    boxShadow: showHighlight ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none', // Sombra condicional
                    border: showHighlight ? '2px solid #4CAF50' : 'none', // Borda condicional
                    zIndex: 1,
                  }}
                  resizeHandleStyles={{
                    bottomRight: {
                      width: '10px',
                      height: '10px',
                      backgroundColor: showHighlight ? 'white' : 'transparent', // Handle condicional
                      border: showHighlight ? '2px solid #4CAF50' : 'none',
                      borderRadius: '50%',
                    },
                    bottomLeft: {
                      width: '10px',
                      height: '10px',
                      backgroundColor: showHighlight ? 'white' : 'transparent', // Handle condicional
                      border: showHighlight ? '2px solid #4CAF50' : 'none',
                      borderRadius: '50%',
                    },
                    topRight: {
                      width: '10px',
                      height: '10px',
                      backgroundColor: showHighlight ? 'white' : 'transparent', // Handle condicional
                      border: showHighlight ? '2px solid #4CAF50' : 'none',
                      borderRadius: '50%',
                    },
                    topLeft: {
                      width: '10px',
                      height: '10px',
                      backgroundColor: showHighlight ? 'white' : 'transparent', // Handle condicional
                      border: showHighlight ? '2px solid #4CAF50' : 'none',
                      borderRadius: '50%',
                    },
                  }}
                  enableResizing={{
                    bottom: showHighlight, // Redimensionamento condicional
                    bottomLeft: showHighlight,
                    bottomRight: showHighlight,
                    left: showHighlight,
                    right: showHighlight,
                    top: showHighlight,
                    topLeft: showHighlight,
                    topRight: showHighlight,
                  }}
                  onClick={toggleHighlight}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundImage: `url(${theme.thumbnail})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                    }}
                  />
                </Rnd>
              )}
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