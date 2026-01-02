import React, { useState } from 'react';
import { Box, ImageList, ImageListItem, ImageListItemBar } from '@mui/material';
import Zoom from '@mui/material/Zoom';

const EtiquetasGrid = ({ etiquetas }) => {
  const [zoom, setZoom] = useState(false);

  const handleMouseEnter = () => {
    setZoom(true);
  };

  const handleMouseLeave = () => {
    setZoom(false);
  };

  return (
    <Box>
      <ImageList variant="quilted" cols={3} gap={8}>
        {etiquetas.map((etiqueta, index) => (
          <ImageListItem
            key={index}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Zoom in={zoom} timeout={300}>
              <img
                src={`data:image/png;base64,${etiqueta.imagem}`}
                alt={`Etiqueta ${index + 1}`}
                loading="lazy"
                style={{
                  transform: zoom? 'scale(1.5)': 'scale(1)', // Ajuste o fator de escala conforme necessário
                  transformOrigin: 'center', // Ajuste a origem da transformação conforme necessário
                  transition: 'transform 0.3s ease',
                }}
              />
            </Zoom>
            <ImageListItemBar title={`Etiqueta ${index + 1}`} />
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
};

export default EtiquetasGrid;