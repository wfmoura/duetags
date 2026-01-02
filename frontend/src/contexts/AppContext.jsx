import React, { createContext, useState, useContext, useCallback } from "react";
import { config } from "../config/config";
import { Snackbar, Alert } from "@mui/material";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [showChatbot, setShowChatbot] = useState(false);
  const [selectedKit, setSelectedKit] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [customizations, setCustomizations] = useState({
    nome: "",
    complemento: "",
    turma: "",
    enviado_para_producao: false,
    fontFamily: config.personalizacao.fontesDisponiveis.Roboto,
    textColor: config.personalizacao.corFontePadrao,
    corFundo: config.personalizacao.corFundoPadrao || "#E3F2FD",
    enableAura: false, // Disabled by default
    showAreaBorder: false, // Discrete boundary guide, disabled by default
    cmykFonte: { c: 0, m: 0, y: 0, k: 0 },
    cmykFundo: { c: 0, m: 0, y: 0, k: 0 },
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const showMessage = useCallback((message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const updateCustomizations = useCallback((newCustomizations) => {
    setCustomizations((prev) => ({
      ...prev,
      ...newCustomizations,
    }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        selectedKit,
        setSelectedKit,
        selectedTheme,
        setSelectedTheme,
        customizations,
        setCustomizations: updateCustomizations,
        showChatbot,
        setShowChatbot,
        showMessage,
      }}
    >
      {children}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
