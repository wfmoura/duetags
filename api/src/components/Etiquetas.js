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
  border: ${(props) => (props.$mostrarLinhaPreta ? '1px dashed black' : 'none')};
  border-radius: ${(props) => (props.$tipo === 'redonda' ? '50%' : '5px')};
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
  }
`;

const AreaDelimitada = styled.div`
  position: absolute;
  left: ${(props) => props.$left}cm;
  top: ${(props) => props.$top}cm;
  width: ${(props) => props.$width}cm;
  height: ${(props) => props.$height}cm;
  border: ${(props) => (props.$mostrarLinhaVermelha ? '1px dashed red' : 'none')};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: ${(props) => (props.$numCampos > 1 ? '4px' : '0')};
  overflow: visible;
  border-radius: ${(props) => (props.$tipo === 'redonda' ? '50%' : '0')};
  z-index: 1; // Área delimitada na camada mais baixa
  pointer-events: none; // Desabilita eventos de clique na área delimitada
`;

const TextoContainer = styled.div`
  font-size: ${({ $fontSizePx }) => $fontSizePx}px;
  font-family: ${({ $fontFamily }) => $fontFamily};
  color: ${({ $textColor }) => $textColor};
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  max-height: 100%; // Garante que o texto não ultrapasse a altura
  padding: 0 5px;
  height: ${({ $fontSizePx }) => $fontSizePx * 1.2}px;
  line-height: ${({ $fontSizePx }) => $fontSizePx * 1.2}px;
  z-index: 3;
  position: relative;
`;



function Etiquetas({ kit, theme, customizations = {}, zoom }) {
  const { etiquetas } = useContext(AppContext);
  const { nome = '', complemento = '', turma = '', fontFamily = 'AgencyFB-Bold', corFundo } = customizations;

  const [personagemPosicao, setPersonagemPosicao] = useState({ x: 10, y: 10 });
  const [personagemTamanho, setPersonagemTamanho] = useState({ width: 30, height: 30 });
  const [showHighlight, setShowHighlight] = useState(false);

  const tamanhoMinimo = config.personalizacao.tamanhoPersonagem?.min || { width: 10, height: 10 };
  const tamanhoMaximo = config.personalizacao.tamanhoPersonagem?.max || { width: 200, height: 200 };

  const toggleHighlight = () => {
    setShowHighlight(!showHighlight);
  };

  const calculateFontSize = (text, maxWidthCm, tipo, campo, maxFontSize, numCampos) => {
    const baseSizePx = 60;
    const minSizePx = 10;
    const maxLength = 20;
    const maxWidthPx = maxWidthCm * 37.8;

    const adjustedBaseSizePx = baseSizePx / Math.sqrt(numCampos);

    const lengthFactor = Math.max(1, text.length / maxLength);
    const fontSizeBasedOnLength = adjustedBaseSizePx / lengthFactor;
    const fontSizeBasedOnWidth = (maxWidthPx / text.length) * 1.5;

    if (tipo === 'pequena') {
      const adjustedBaseSizePx = 30 / Math.sqrt(numCampos);
      const adjustedFontSize = Math.min(adjustedBaseSizePx / lengthFactor, fontSizeBasedOnWidth);
      return Math.min(Math.max(adjustedFontSize, minSizePx), maxFontSize);
    }

    if (tipo === 'redonda') {
      const areaRadiusPx = maxWidthPx / 2;
      const fontSizeBasedOnCircle = (areaRadiusPx / Math.sqrt(text.length)) * 0.9;
      return Math.min(Math.max(fontSizeBasedOnCircle, minSizePx), maxFontSize);
    }

    const finalFontSize = Math.min(fontSizeBasedOnLength, fontSizeBasedOnWidth);
    return Math.min(Math.max(finalFontSize, minSizePx), maxFontSize);
  };


  
  if (!kit || !kit.etiquetas) {
    console.error('Kit ou etiquetas do kit não definidos:', kit);
    return null;
  }

  const etiquetasDoKit = kit.etiquetas.map((etiquetaKit) => {
    const etiquetaInfo = etiquetas.find((e) => e.id === etiquetaKit.id);
    return { ...etiquetaInfo, quantidade: etiquetaKit.quantidade };
  });

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      {etiquetasDoKit.map((etiqueta, index) => {
        if (!etiqueta || !etiqueta.area_delimitada) {
          console.error('Etiqueta ou área delimitada não definida:', etiqueta);
          return null;
        }

        const area = etiqueta.area_delimitada;

        const camposVisiveis = etiqueta.campos.filter((campo) => {
          if (campo === 'nome') return nome;
          if (campo === 'complemento') return complemento;
          if (campo === 'turma') return turma;
          return false;
        }).length;

        const proporcaoPersonagem = etiqueta.proporcaoPersonagem ;
        const alturaEtiquetaPx = etiqueta.height * zoom * 37.8;
        const personagemHeight = alturaEtiquetaPx * proporcaoPersonagem;
        const personagemWidth = personagemHeight;

        let initialX, initialY;

        if (etiqueta.tipo !== 'redonda') {
          initialX = 20;
          initialY = (etiqueta.height * zoom * 37.8 - personagemHeight) * 0.5;
        } else {
          initialX = (etiqueta.width * zoom * 37.8 - personagemWidth) / 2;
          initialY = (etiqueta.height * zoom * 37.8 - personagemHeight) - 37.8 * 0.6;
        }
        if (etiqueta.tipo == 'Pequena') {
          initialX = 17;
          initialY = (etiqueta.height * zoom * 37.8 - personagemHeight) *  etiqueta.distanciaDoRodape;
        }
        

        const boundedX = Math.max(0, Math.min(initialX, etiqueta.width * zoom * 37.8 - personagemWidth));
        const boundedY = Math.max(0, Math.min(initialY, etiqueta.height * zoom * 37.8 - personagemHeight));

        return (
          <Box key={index} mb={4} className="etiqueta-individual" data-tipo={etiqueta.tipo}>
            <EtiquetaContainer
              $width={etiqueta.width * zoom}
              $height={etiqueta.tipo === 'redonda' ? etiqueta.width * zoom : etiqueta.height * zoom}
              $tipo={etiqueta.tipo}
              $backgroundColor={corFundo}
              $mostrarLinhaPreta={config.personalizacao.mostrarLinhaPreta}
            >
              {config.personalizacao.fundo && theme?.caminho_img && etiqueta.imagem && (
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${theme.caminho_img[etiqueta.tipo.toLowerCase()]})`,
                    backgroundSize: etiqueta.tipo === 'redonda' ? 'contain' : 'cover',
                    backgroundPosition: 'center',
                    borderRadius: etiqueta.tipo === 'redonda' ? '50%' : '0',
                  }}
                />
              )}

              <AreaDelimitada
              $left={area.left * zoom}
              $top={area.top * zoom}
              $width={area.width * zoom}
              $height={area.height * zoom}
              $mostrarLinhaVermelha={config.personalizacao.mostrarLinhaVermelha}
              $numCampos={camposVisiveis}
              $tipo={etiqueta.tipo}
            >
              {etiqueta.camposMesclados && etiqueta.camposMesclados.length > 0 ? (
                <TextoContainer
                  $fontSizePx={calculateFontSize(
                    etiqueta.camposMesclados.map((campo) => customizations[campo]).join(' '),
                    area.width * zoom,
                    etiqueta.tipo,
                    'nome',
                    etiqueta.maxFontSize.nome,
                    1
                  )}
                  $fontFamily={fontFamily}
                  $textColor={customizations.textColor}
                >
                  {etiqueta.camposMesclados.map((campo) => customizations[campo]).join(' ')}
                </TextoContainer>
              ) : (
                <>
                  {etiqueta.campos.includes('nome') && nome && (
                    etiqueta.tipo === 'redonda' ? (
                      <TextoContainer
                        $fontSizePx={calculateFontSize(
                          nome,
                          area.width * zoom,
                          etiqueta.tipo,
                          'nome',
                          etiqueta.maxFontSize.nome,
                          camposVisiveis
                        )}
                        $fontFamily={fontFamily}
                        $textColor={customizations.textColor}
                        style={{
                          maxWidth: `${area.width * zoom * 37.8}px`, // Limita a largura ao tamanho da área delimitada
                          maxHeight: `${area.height * zoom * 37.8}px`, // Limita a altura ao tamanho da área delimitada
                        }}
                      >
                        {nome}
                      </TextoContainer>
                    ) : (
                      <TextoContainer
                        $fontSizePx={calculateFontSize(nome, area.width * zoom, etiqueta.tipo, 'nome', etiqueta.maxFontSize.nome, camposVisiveis)}
                        $fontFamily={fontFamily}
                        $textColor={customizations.textColor}
                      >
                        {nome}
                      </TextoContainer>
                    )
                  )}
                  {etiqueta.campos.includes('complemento') && complemento && (
                    <TextoContainer
                      $fontSizePx={calculateFontSize(complemento, area.width * zoom, etiqueta.tipo, 'complemento', etiqueta.maxFontSize.complemento, camposVisiveis)}
                      $fontFamily={fontFamily}
                      $textColor={customizations.textColor}
                    >
                      {complemento}
                    </TextoContainer>
                  )}
                  {etiqueta.campos.includes('turma') && turma && (
                    <TextoContainer
                      $fontSizePx={calculateFontSize(turma, area.width * zoom, etiqueta.tipo, 'turma', etiqueta.maxFontSize.turma, camposVisiveis)}
                      $fontFamily={fontFamily}
                      $textColor={customizations.textColor}
                    >
                      {turma}
                    </TextoContainer>
                  )}
                </>
              )}
            </AreaDelimitada>

              {config.personalizacao.personagem && theme?.thumbnail && etiqueta.imagem && etiqueta.tipo !== 'mini' && (
                <Rnd
                  default={{
                    x: boundedX,
                    y: boundedY,
                    width: personagemWidth,
                    height: personagemHeight,
                  }}
                  bounds="parent"
                  minWidth={tamanhoMinimo.width}
                  minHeight={tamanhoMinimo.height}
                  maxWidth={etiqueta.width * zoom * 37.8}
                  maxHeight={etiqueta.height * zoom * 37.8}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    if (config.personalizacao.permitirRedimensionamentoPersonagem) {
                      setPersonagemTamanho({
                        width: ref.style.width,
                        height: ref.style.height,
                      });
                      setPersonagemPosicao({
                        x: position.x,
                        y: position.y,
                      });
                    }
                  }}
                  onDragStop={(e, d) => {
                    if (config.personalizacao.permitirMovimentacaoPersonagem) {
                      setPersonagemPosicao({ x: d.x, y: d.y });
                    }
                  }}
                  style={{
                    width: personagemTamanho.width,
                    height: personagemTamanho.height,
                    backgroundImage: `url(${theme.thumbnail})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    boxShadow: showHighlight ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none',
                    border: showHighlight ? '2px solid #4CAF50' : 'none',
                    zIndex: 2, // Personagem na camada do meio
                  }}
                  resizeHandleStyles={{
                    bottomRight: {
                      width: '10px',
                      height: '10px',
                      backgroundColor: showHighlight ? 'white' : 'transparent',
                      border: showHighlight ? '2px solid #4CAF50' : 'none',
                      borderRadius: '50%',
                    },
                    bottomLeft: {
                      width: '10px',
                      height: '10px',
                      backgroundColor: showHighlight ? 'white' : 'transparent',
                      border: showHighlight ? '2px solid #4CAF50' : 'none',
                      borderRadius: '50%',
                    },
                    topRight: {
                      width: '10px',
                      height: '10px',
                      backgroundColor: showHighlight ? 'white' : 'transparent',
                      border: showHighlight ? '2px solid #4CAF50' : 'none',
                      borderRadius: '50%',
                    },
                    topLeft: {
                      width: '10px',
                      height: '10px',
                      backgroundColor: showHighlight ? 'white' : 'transparent',
                      border: showHighlight ? '2px solid #4CAF50' : 'none',
                      borderRadius: '50%',
                    },
                  }}
                  enableResizing={{
                    bottom: showHighlight && config.personalizacao.permitirRedimensionamentoPersonagem,
                    bottomLeft: showHighlight && config.personalizacao.permitirRedimensionamentoPersonagem,
                    bottomRight: showHighlight && config.personalizacao.permitirRedimensionamentoPersonagem,
                    left: showHighlight && config.personalizacao.permitirRedimensionamentoPersonagem,
                    right: showHighlight && config.personalizacao.permitirRedimensionamentoPersonagem,
                    top: showHighlight && config.personalizacao.permitirRedimensionamentoPersonagem,
                    topLeft: showHighlight && config.personalizacao.permitirRedimensionamentoPersonagem,
                    topRight: showHighlight && config.personalizacao.permitirRedimensionamentoPersonagem,
                  }}
                  enableDragging={config.personalizacao.permitirMovimentacaoPersonagem}
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