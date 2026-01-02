import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Box, Typography, CircularProgress } from '@mui/material';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import { Rnd } from 'react-rnd';
import { config } from '../config/config';
import { calculateFontSize } from '../utils/labelUtils';

const EtiquetaContainer = styled.div.attrs(props => ({
  style: {
    width: `${props.$widthPx}px`,
    height: `${props.$heightPx}px`,
    backgroundColor: props.$backgroundColor || '#E3F2FD',
    border: props.$mostrarLinhaPreta ? '1px dashed black' : '1px solid rgba(0,0,0,0.06)',
    borderRadius: props.$tipo === 'redonda' ? '50%' : '5px',
    boxShadow: (props.$isExport && props.$isCapture) ? 'none' : '0 10px 20px rgba(0,0,0,0.1), 0 6px 6px rgba(0,0,0,0.08), inset 0 -1px 3px rgba(0,0,0,0.05)',
  },
}))`
position: relative;
display: flex;
justify-content: center;
align-items: center;
overflow: hidden;
transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
  transform: ${(props) => (props.$isExport ? 'none' : 'translateY(-5px) scale(1.02)')};
}

  ${props => !props.$isExport && `
    @media (max-width: 768px) {
      width: 100%;
      height: auto;
    }
  `}
`;

const AreaDelimitada = styled.div`
position: absolute;
left: ${(props) => props.$leftPx}px;
top: ${(props) => props.$topPx}px;
width: ${(props) => props.$widthPx}px;
height: ${(props) => props.$heightPx}px;
border: ${(props) => (props.$mostrarLinhaVermelha ? '1px dashed red' : (props.$showAreaBorder ? '1px dashed rgba(0,0,0,0.15)' : 'none'))};
overflow: visible;
border-radius: ${(props) => (props.$tipo === 'redonda' ? '50%' : '0')};
z-index: 20; /* Reduced to stay below character for easier selection if character is on top */
pointer-events: none; /* Crucial: let events pass to character unless clicking text */
`;

const TextoContainer = styled.div.attrs(props => ({
  style: {
    fontSize: `${props.$fontSizePx}px`,
    fontFamily: props.$fontFamily,
    color: props.$textColor,
    fontWeight: props.$isBold ? 'bold' : 'normal',
    fontStyle: props.$isItalic ? 'italic' : 'normal',
    whiteSpace: props.$shouldWrap ? 'normal' : 'nowrap',
    wordBreak: props.$shouldWrap ? 'break-word' : 'normal',
  },
}))`
text-align: center;
display: flex;
align-items: center;
justify-content: center;
overflow: visible;
text-overflow: clip;
width: 100%;
height: 100%;
padding: 0 5px;
line-height: 1.1;
z-index: 3;
position: relative;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
text-rendering: optimizeLegibility;
`;

const DraggableTextContainer = styled(Rnd)`
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
border: ${(props) => (props.$showBorder && !props.disableDragging ? '1px dashed #ccc' : 'none')};
z-index: 15;
cursor: ${(props) => (props.disableDragging ? 'default' : 'move')};
  
  &:hover {
  border: ${(props) => (props.$showBorder && !props.disableDragging ? '1px dashed #999' : 'none')};
}
`;

// Componente para renderizar uma única etiqueta (com Hooks seguros)
const EtiquetaItem = ({ etiqueta, theme, customizations, zoom, isExport, isCapture, savedPositions, onPositionChange }) => {
  const {
    nome = '',
    complemento = '',
    turma = '',
    fontFamily = 'AgencyFB-Bold',
    corFundo,
    isBold = false,
    isItalic = false,
    fontSizeScale = 1,
    enableAura = false,
    noBackground = false
  } = customizations;

  // Hooks são seguros aqui porque EtiquetaItem é um componente renderizado individualmente
  // State for character position and size
  const proporcaoPersonagem = etiqueta.proporcaoPersonagem || etiqueta.proporcao_personagem || 1;
  const larguraEtiquetaPx = etiqueta.width * zoom * 37.8;
  const alturaEtiquetaPx = (etiqueta.tipo === 'redonda' ? etiqueta.width : (etiqueta.height || etiqueta.width)) * zoom * 37.8;

  // Respeita a proporção do personagem em relação à altura da etiqueta
  const personagemHeightInit = alturaEtiquetaPx * proporcaoPersonagem;
  const personagemWidthInit = personagemHeightInit; // Assume quadrado para o asset base

  const startXPx = (etiqueta.area_delimitada?.left || 0) * zoom * 37.8;
  const startYPx = (etiqueta.area_delimitada?.top || 0) * zoom * 37.8;

  const [activeId, setActiveId] = useState(null);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  // Lógica de Posicionamento Inicial Refinada
  const calculateInitialPos = () => {
    let x, y;

    // 1. Posição Horizontal (distancia_horizontal ou padrão)
    if (etiqueta.distancia_horizontal !== undefined && etiqueta.distancia_horizontal !== null) {
      x = etiqueta.distancia_horizontal * zoom * 37.8;
    } else {
      if (etiqueta.tipo === 'redonda') {
        x = (larguraEtiquetaPx - personagemWidthInit) / 2;
      } else {
        const baseMargin = 10 / 1.5; // ~6.67px at scale 1:1
        x = baseMargin * zoom;
      }
    }

    // 2. Posição Vertical (distancia_do_rodape ou centralizado)
    if (etiqueta.distancia_do_rodape !== undefined && etiqueta.distancia_do_rodape !== null) {
      // a distância do rodapé é de baixo para cima
      y = alturaEtiquetaPx - (etiqueta.distancia_do_rodape * zoom * 37.8) - personagemHeightInit;
    } else {
      y = (alturaEtiquetaPx - personagemHeightInit) / 2;
    }

    return { x, y };
  };

  const initialCoords = calculateInitialPos();

  // Base zoom is assumed to be 1.5 where positions are initially recorded
  const baseZoom = 1.5;
  const zoomScale = zoom / baseZoom;

  const [personagemPosicao, setPersonagemPosicao] = useState(() => {
    if (savedPositions && savedPositions.personagem) {
      return {
        x: savedPositions.personagem.x * zoomScale,
        y: savedPositions.personagem.y * zoomScale
      };
    }
    return initialCoords;
  });
  const [personagemTamanho, setPersonagemTamanho] = useState(() => {
    if (savedPositions && savedPositions.personagem) {
      return {
        width: savedPositions.personagem.width * zoomScale,
        height: savedPositions.personagem.height * zoomScale
      };
    }
    return { width: personagemWidthInit, height: personagemHeightInit };
  });

  // Auto-hide controls after 2 seconds of inactivity
  useEffect(() => {
    if (activeId && !isExport) {
      const timer = setTimeout(() => {
        setActiveId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activeId, lastInteraction, isExport]);

  const handleInteraction = () => {
    setLastInteraction(Date.now());
  };

  // State for AI background position
  const [aiBackgroundPos, setAiBackgroundPos] = useState(() => {
    // Se for redonda, usamos a mesma lógica de centralização do personagem padrão
    if (etiqueta.tipo === 'redonda') {
      return initialCoords;
    }
    return { x: 0, y: 0 };
  });
  const [aiBackgroundSize, setAiBackgroundSize] = useState(() => {
    if (etiqueta.tipo === 'redonda') {
      // Usamos o tamanho padrão calculado para o personagem
      return { width: personagemWidthInit, height: personagemHeightInit };
    }
    return { width: alturaEtiquetaPx, height: alturaEtiquetaPx };
  });
  const [isDragging, setIsDragging] = useState(false);

  // State for draggable text fields
  // Cada campo agora terá sua própria posição e tamanho independente
  const [fieldStates, setFieldStates] = useState(() => {
    if (savedPositions) {
      const scaled = {};
      Object.keys(savedPositions).forEach(key => {
        if (key === 'personagem') return;
        const pos = savedPositions[key];
        scaled[key] = {
          ...pos,
          x: pos.x * zoomScale,
          y: pos.y * zoomScale,
          width: pos.width * zoomScale,
          height: pos.height * zoomScale
        };
      });
      return scaled;
    }
    return {};
  });

  // Update local state if props change (e.g., reset or initial load)
  useEffect(() => {
    if (savedPositions) {
      const scaledFields = {};
      Object.keys(savedPositions).forEach(key => {
        if (key === 'personagem') return;
        const pos = savedPositions[key];
        scaledFields[key] = {
          ...pos,
          x: pos.x * zoomScale,
          y: pos.y * zoomScale,
          width: pos.width * zoomScale,
          height: pos.height * zoomScale
        };
      });
      setFieldStates(scaledFields);

      // Also sync character if present in savedPositions
      if (savedPositions.personagem) {
        setPersonagemPosicao({
          x: savedPositions.personagem.x * zoomScale,
          y: savedPositions.personagem.y * zoomScale
        });
        setPersonagemTamanho({
          width: savedPositions.personagem.width * zoomScale,
          height: savedPositions.personagem.height * zoomScale
        });
      } else {
        // Revert to initial if character pos not saved (e.g. reset)
        const initial = calculateInitialPos();
        setPersonagemPosicao(initial);
        setPersonagemTamanho({ width: personagemWidthInit, height: personagemHeightInit });
      }
    }
  }, [savedPositions, zoom]);

  const tamanhoMinimo = config.personalizacao.tamanhoPersonagem?.min || { width: 10, height: 10 };
  const tamanhoMaximo = config.personalizacao.tamanhoPersonagem?.max || { width: 200, height: 200 };

  const toggleHighlight = (id) => {
    if (isExport) return;
    setActiveId(prev => prev === id ? null : id);
  };

  // Drag handlers for AI background
  const handleDragStart = (e) => {
    if (theme?.isAiBackground) {
      e.preventDefault();
      setIsDragging(true);
    }
  };

  const handleDragMove = (e) => {
    if (!isDragging || !theme?.isAiBackground) return;
    setAiBackgroundPos(prev => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY
    }));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  if (!etiqueta || !etiqueta.area_delimitada) {
    console.error('Etiqueta ou área delimitada não definida:', etiqueta);
    return null;
  }

  const area = etiqueta.area_delimitada;

  // Determine active fields
  const activeFields = [];
  const mergedFields = etiqueta.camposMesclados || etiqueta.campos_mesclados;
  if (mergedFields && mergedFields.length > 0) {
    const text = mergedFields
      .map(c => customizations[c])
      .filter(val => val && val.trim() !== "")
      .join(' ');

    if (text) {
      activeFields.push({
        id: 'mesclado',
        text,
        originalFields: mergedFields,
        fieldName: mergedFields.includes('nome') ? 'nome' : 'mesclado'
      });
    }
  } else {
    if (etiqueta.campos.includes('nome') && nome) activeFields.push({ id: 'nome', text: nome, fieldName: 'nome' });
    if (etiqueta.campos.includes('complemento') && complemento) activeFields.push({ id: 'complemento', text: complemento, fieldName: 'complemento' });
    if (etiqueta.campos.includes('turma') && turma) activeFields.push({ id: 'turma', text: turma, fieldName: 'turma' });
  }

  // Calculate default layout if not in state
  // We use the strict DB area dimensions (raw CM)
  const totalHeightCm = (etiqueta.area_delimitada?.height || (etiqueta.tipo === 'redonda' ? etiqueta.width : etiqueta.height));
  const areaWidthCm = (etiqueta.area_delimitada?.width || (etiqueta.width - (etiqueta.area_delimitada?.left || 0)));
  const totalHeightPx = totalHeightCm * zoom * 37.8;
  const areaWidthPx = areaWidthCm * zoom * 37.8;

  let layoutHeightPx = totalHeightPx / (activeFields.length || 1);
  let startYOffsetPx = 0;

  if (activeFields.length === 2) {
    // Quando temos 2 campos, ocupa ~72% do espaço vertical (equilíbrio entre tamanho e proximidade)
    const occupiedHeight = totalHeightPx * 0.72;
    layoutHeightPx = occupiedHeight / 2;
    startYOffsetPx = (totalHeightPx - occupiedHeight) / 2;
  } else if (activeFields.length === 1) {
    // Para 1 campo, centraliza no espaço total
    layoutHeightPx = totalHeightPx;
    startYOffsetPx = 0;
  }

  return (
    <Box mb={4} className="etiqueta-individual" data-tipo={etiqueta.tipo}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      {/* Passar o ID ou índice para identificar no html2canvas onclone */}
      <EtiquetaContainer
        className="etiqueta-content"
        data-etiqueta-index={etiqueta.id}
        $widthPx={larguraEtiquetaPx}
        $heightPx={alturaEtiquetaPx}
        $tipo={etiqueta.tipo}
        $backgroundColor={noBackground ? 'transparent' : (theme?.isAiBackground ? (customizations.corFundo || '#E3F2FD') : corFundo)}
        $mostrarLinhaPreta={noBackground ? false : config.personalizacao.mostrarLinhaPreta}
        $isExport={isExport || noBackground}
        onClick={() => setActiveId(null)}
      >
        {/* Camada de Aura: Preenche o fundo com a textura da imagem IA */}
        {theme?.isAiBackground && enableAura && (
          <img
            src={theme.thumbnail}
            alt="AI Background Aura"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '120%',
              height: '120%',
              transform: 'translate(-50%, -50%) scale(1.5)',
              filter: 'blur(30px) opacity(0.5)',
              zIndex: 0,
              pointerEvents: 'none'
            }}
          />
        )}
        {theme?.isAiBackground && etiqueta.imagem === true && (
          <Rnd
            size={aiBackgroundSize.width ? { width: aiBackgroundSize.width, height: aiBackgroundSize.height } : undefined}
            position={aiBackgroundPos}
            onDragStop={(e, d) => {
              setAiBackgroundPos({ x: d.x, y: d.y });
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              setAiBackgroundSize({
                width: ref.offsetWidth,
                height: ref.offsetHeight,
              });
              setAiBackgroundPos(position);
            }}
            disableDragging={isExport}
            enableResizing={!isExport}
            lockAspectRatio={true}
            style={{ zIndex: 2 }}
          >
            <img
              src={theme.thumbnail}
              alt="AI Background"
              style={{
                width: '100%',
                height: '100%',
                maxWidth: 'none',
                pointerEvents: 'none',
                // Removido multiply pois agora usamos transparência real
              }}
            />
          </Rnd>
        )}

        <AreaDelimitada
          $leftPx={startXPx}
          $topPx={startYPx}
          $widthPx={areaWidthPx}
          $heightPx={totalHeightPx}
          $tipo={etiqueta.tipo}
          $numCampos={activeFields.length}
          $mostrarLinhaVermelha={config.personalizacao.mostrarLinhaVermelha}
          $showAreaBorder={customizations.showAreaBorder}
          style={{ pointerEvents: 'none' }}
        />

        {/* Textos movidos para fora da AreaDelimitada para permitir arrastar por toda a etiqueta */}
        {activeFields.map((field, index) => {
          // Re-calculate sizes for each field
          const isOverlappingHorizontally = (
            personagemPosicao.y < (startYPx + totalHeightPx) &&
            (personagemPosicao.y + personagemTamanho.height) > startYPx
          );

          let currentAvailableWidthCm = areaWidthCm;
          if (isOverlappingHorizontally) {
            const safeOverlapMargin = 0.2;
            if (personagemPosicao.x < larguraEtiquetaPx / 2) {
              const occupiedWidthCm = (personagemPosicao.x + personagemTamanho.width) / (zoom * 37.8);
              currentAvailableWidthCm = Math.max(1, areaWidthCm - (occupiedWidthCm - (etiqueta.area_delimitada?.left || 0) + safeOverlapMargin));
            } else {
              const occupiedStartCm = personagemPosicao.x / (zoom * 37.8);
              currentAvailableWidthCm = Math.max(1, (occupiedStartCm - (etiqueta.area_delimitada?.left || 0)) - safeOverlapMargin);
            }
          }

          const result = calculateFontSize(
            field.text,
            currentAvailableWidthCm,
            totalHeightCm / (activeFields.length || 1),
            field.fieldName || field.id,
            etiqueta.maxFontSize?.[field.fieldName] || etiqueta[`max_font_size_${field.fieldName}`],
            fontSizeScale,
            etiqueta.escala_extra_fonte || 1,
            etiqueta.tipo,
            etiqueta.min_font_size_nome
          );

          let finalSize = result.fontSize * zoom;
          let shouldWrap = result.shouldWrap;

          // Sync with Name size for 'complemento' if needed
          if (field.fieldName === 'complemento') {
            const nomeField = activeFields.find(f => f.fieldName === 'nome');
            if (nomeField) {
              const nomeResult = calculateFontSize(
                nomeField.text,
                currentAvailableWidthCm,
                totalHeightCm / (activeFields.length || 1),
                'nome',
                etiqueta.maxFontSize?.nome || etiqueta.max_font_size_nome,
                fontSizeScale,
                etiqueta.escala_extra_fonte || 1,
                etiqueta.tipo,
                etiqueta.min_font_size_nome
              );
              const nomeCalculatedSize = nomeResult.fontSize * zoom;
              if (field.text.length <= nomeField.text.length) {
                finalSize = nomeCalculatedSize;
              } else {
                finalSize = Math.min(finalSize, nomeCalculatedSize);
              }
            }
          }

          const currentFieldHeightCm = totalHeightCm / (activeFields.length || 1);
          const isSmallArea = areaWidthCm < 3.0 || currentFieldHeightCm <= 1.1;
          const charWidthRatio = isSmallArea ? 0.44 : 0.52;
          const contentPadding = 20 / 1.5;
          const spacingOffsetPx = (activeFields.length === 2 ? (Number(etiqueta.distancia_entre_linhas || 0) * zoom * 37.8) : 0);

          let finalContentWidthPx = field.text.length * finalSize * charWidthRatio + (contentPadding * zoom);
          let finalContentHeightPx = finalSize * 1.35;
          let finalDefaultXInArea = (areaWidthPx - finalContentWidthPx) / 2;

          if (shouldWrap) {
            finalContentWidthPx = areaWidthPx;
            finalContentHeightPx = finalSize * 1.1 * 2;
            finalDefaultXInArea = 0;
          }

          let defaultYInArea = startYOffsetPx + (index * layoutHeightPx) + ((layoutHeightPx - finalContentHeightPx) / 2);

          if (activeFields.length === 2) {
            if (index === 0) defaultYInArea -= spacingOffsetPx / 2;
            if (index === 1) defaultYInArea += spacingOffsetPx / 2;
          }

          // Converter para coordenadas globais da etiqueta
          const globalDefaultX = startXPx + finalDefaultXInArea;
          const globalDefaultY = startYPx + defaultYInArea;

          const isFieldActive = activeId === field.id;
          const currentState = fieldStates[field.id] || {
            x: globalDefaultX,
            y: globalDefaultY,
            width: finalContentWidthPx,
            height: finalContentHeightPx
          };

          return (
            <DraggableTextContainer
              key={field.id}
              className="draggable-text-layer"
              position={{ x: currentState.x, y: currentState.y }}
              size={{ width: currentState.width, height: currentState.height }}
              disableDragging={isExport}
              enableResizing={!isExport}
              bounds="parent"
              $showBorder={isFieldActive}
              style={{ pointerEvents: 'auto' }}
              onDragStart={(e) => {
                e.stopPropagation();
                handleInteraction();
                setActiveId(field.id);
              }}
              onDragStop={(e, d) => {
                handleInteraction();
                const normalizedState = {
                  x: d.x / zoomScale,
                  y: d.y / zoomScale,
                  width: currentState.width / zoomScale,
                  height: currentState.height / zoomScale
                };
                setFieldStates(prev => ({ ...prev, [field.id]: { ...currentState, x: d.x, y: d.y } }));
                if (onPositionChange) onPositionChange(field.id, normalizedState);
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                const normalizedState = {
                  x: position.x / zoomScale,
                  y: position.y / zoomScale,
                  width: ref.offsetWidth / zoomScale,
                  height: ref.offsetHeight / zoomScale
                };
                const localState = {
                  x: position.x,
                  y: position.y,
                  width: ref.offsetWidth,
                  height: ref.offsetHeight
                };
                setFieldStates(prev => ({ ...prev, [field.id]: localState }));
                if (onPositionChange) onPositionChange(field.id, normalizedState);
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleInteraction();
                toggleHighlight(field.id);
              }}
            >
              <Box className="drag-handle-full" sx={{
                position: 'absolute',
                top: -5, left: -5, right: -5, bottom: -5,
                zIndex: 2,
                cursor: isExport ? 'default' : 'move',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {isFieldActive && !isExport && (
                  <OpenWithIcon sx={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'primary.main',
                    bgcolor: 'white',
                    borderRadius: '50%',
                    p: 0.3,
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    opacity: 0.9
                  }} />
                )}
              </Box>
              <TextoContainer
                $fontSizePx={finalSize}
                $fontFamily={fontFamily}
                $textColor={customizations.textColor}
                $isBold={isBold}
                $isItalic={isItalic}
                $shouldWrap={shouldWrap}
                $showBorder={isFieldActive && !isExport}
                data-field-id={field.id}
                data-font-size={`${finalSize}px`}
              >
                {field.text}
              </TextoContainer>
            </DraggableTextContainer>
          );
        })}

        {config.personalizacao.personagem && theme?.thumbnail && etiqueta.imagem === true && !theme?.isAiBackground && (
          <Rnd
            resizeHandleStyles={{
              bottomRight: { width: '14px', height: '14px', background: '#4CAF50', border: '2px solid white', borderRadius: '50%', bottom: '-7px', right: '-7px', visibility: activeId === 'personagem' ? 'visible' : 'hidden' },
              bottomLeft: { width: '14px', height: '14px', background: '#4CAF50', border: '2px solid white', borderRadius: '50%', bottom: '-7px', left: '-7px', visibility: activeId === 'personagem' ? 'visible' : 'hidden' },
              topRight: { width: '14px', height: '14px', background: '#4CAF50', border: '2px solid white', borderRadius: '50%', top: '-7px', right: '-7px', visibility: activeId === 'personagem' ? 'visible' : 'hidden' },
              topLeft: { width: '14px', height: '14px', background: '#4CAF50', border: '2px solid white', borderRadius: '50%', top: '-7px', left: '-7px', visibility: activeId === 'personagem' ? 'visible' : 'hidden' },
            }}
            size={{ width: personagemTamanho.width, height: personagemTamanho.height }}
            position={{ x: personagemPosicao.x, y: personagemPosicao.y }}
            bounds="parent"
            minWidth={tamanhoMinimo.width}
            minHeight={tamanhoMinimo.height}
            maxWidth={etiqueta.width * zoom * 37.8}
            maxHeight={(etiqueta.tipo === 'redonda' ? etiqueta.width : etiqueta.height) * zoom * 37.8}
            onResizeStart={handleInteraction}
            onResize={handleInteraction}
            onResizeStop={(e, direction, ref, delta, position) => {
              handleInteraction();
              if (config.personalizacao.permitirRedimensionamentoPersonagem) {
                const newState = {
                  width: ref.offsetWidth,
                  height: ref.offsetHeight,
                  x: position.x,
                  y: position.y
                };
                const normalizedState = {
                  width: newState.width / zoomScale,
                  height: newState.height / zoomScale,
                  x: newState.x / zoomScale,
                  y: newState.y / zoomScale
                };
                setPersonagemTamanho({ width: newState.width, height: newState.height });
                setPersonagemPosicao({ x: newState.x, y: newState.y });
                if (onPositionChange) onPositionChange('personagem', normalizedState);
              }
            }}
            onDragStart={(e) => {
              e.stopPropagation();
              handleInteraction();
              setActiveId('personagem');
            }}
            onDrag={(e, d) => {
              handleInteraction();
            }}
            onDragStop={(e, d) => {
              handleInteraction();
              if (config.personalizacao.permitirMovimentacaoPersonagem) {
                const normalizedState = {
                  width: personagemTamanho.width / zoomScale,
                  height: personagemTamanho.height / zoomScale,
                  x: d.x / zoomScale,
                  y: d.y / zoomScale
                };
                setPersonagemPosicao({ x: d.x, y: d.y });
                if (onPositionChange) onPositionChange('personagem', normalizedState);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleInteraction();
              toggleHighlight('personagem');
            }}
            style={{
              backgroundImage: `url(${theme.thumbnail})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              boxShadow: (activeId === 'personagem' && !isExport) ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none',
              border: (activeId === 'personagem' && !isExport) ? '2px solid #4CAF50' : 'none',
              zIndex: 12,
            }}
            enableResizing={{
              bottom: !isExport && activeId === 'personagem' && config.personalizacao.permitirRedimensionamentoPersonagem,
              bottomLeft: !isExport && activeId === 'personagem' && config.personalizacao.permitirRedimensionamentoPersonagem,
              bottomRight: !isExport && activeId === 'personagem' && config.personalizacao.permitirRedimensionamentoPersonagem,
              left: !isExport && activeId === 'personagem' && config.personalizacao.permitirRedimensionamentoPersonagem,
              right: !isExport && activeId === 'personagem' && config.personalizacao.permitirRedimensionamentoPersonagem,
              top: !isExport && activeId === 'personagem' && config.personalizacao.permitirRedimensionamentoPersonagem,
              topLeft: !isExport && activeId === 'personagem' && config.personalizacao.permitirRedimensionamentoPersonagem,
              topRight: !isExport && activeId === 'personagem' && config.personalizacao.permitirRedimensionamentoPersonagem,
            }}
            disableDragging={!config.personalizacao.permitirMovimentacaoPersonagem || isExport}
          />
        )}
      </EtiquetaContainer>
      <Typography variant="body2" mt={1}>
        {etiqueta.nome} ({etiqueta.width}cm x {etiqueta.height}cm)
      </Typography>
    </Box>
  );
};

const Etiquetas = ({ kit, theme, customizations, zoom = 1, isExport = false, isCapture = false, positions = {}, onPositionChange, filterId, etiquetas = [] }) => {
  const [activeId, setActiveId] = useState(null);
  // Removed useProduct hook as 'etiquetas' is now passed as a prop

  if (!kit || !kit.etiquetas) {
    console.error('Kit ou etiquetas do kit não definidos:', kit);
    return null;
  }

  if (!etiquetas || etiquetas.length === 0) {
    return <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>;
  }

  const etiquetasDoKit = kit.etiquetas.map((etiquetaKit) => {
    const etiquetaInfo = etiquetas.find((e) => e.id === etiquetaKit.id);
    if (!etiquetaInfo) {
      console.warn(`Informações da etiqueta não encontradas para o ID: ${etiquetaKit.id}`);
      return null;
    }
    // Combine quantity info
    return { ...etiquetaInfo, quantidade: etiquetaKit.quantidade };
  }).filter(Boolean).filter(e => !filterId || e.id === filterId); // Apply filterId

  if (etiquetasDoKit.length === 0) {
    return <Typography color="error">Erro ao carregar etiquetas do kit. Verifique se os dados estão corretos.</Typography>;
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      {etiquetasDoKit.map((etiqueta, index) => {
        const uniqueKey = `${etiqueta.id}-${index}`;
        return (
          <EtiquetaItem
            key={uniqueKey}
            etiqueta={etiqueta}
            theme={theme}
            customizations={customizations}
            zoom={zoom}
            isExport={isExport}
            isCapture={isCapture}
            savedPositions={positions[uniqueKey]}
            onPositionChange={(fieldId, pos) => onPositionChange && onPositionChange(uniqueKey, fieldId, pos)}
          />
        );
      })}
    </Box>
  );
};

export default Etiquetas;
