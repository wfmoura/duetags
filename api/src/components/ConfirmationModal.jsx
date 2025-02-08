import React from "react";
import { Box, Typography, Button, Modal } from "@mui/material";
import Etiquetas from "./Etiquetas"; // Importe o componente Etiquetas

const ConfirmationModal = ({ isOpen, onClose, onConfirm, selectedKit, selectedTheme, customizations }) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: "8px",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Confirmação das Etiquetas
        </Typography>
        <Box id="etiquetas-container">
          <Etiquetas
            kit={selectedKit}
            theme={selectedTheme}
            customizations={customizations}
            zoom={1.5}
          />
        </Box>
        <Box mt={4} display="flex" justifyContent="space-between">
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={onConfirm}>
            Confirmar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmationModal;