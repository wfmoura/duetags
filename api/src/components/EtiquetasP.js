import React from "react";
import { Box } from "@mui/material";

const Etiquetas = ({ kit, theme, customizations, zoom = 1 }) => {
  if (!kit || !theme) {
    return null;
  }

  return (
    <Box>
      {kit.etiquetas.map((etiqueta, index) => (
        <Box
          key={index}
          data-etiqueta-id={etiqueta.id}
          style={{
            border: "1px solid #000",
            padding: "10px",
            margin: "10px",
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
          }}
        >
          <Typography variant="h6">{customizations.nome}</Typography>
          <Typography>{customizations.complemento}</Typography>
          <Typography>{customizations.turma}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default Etiquetas;