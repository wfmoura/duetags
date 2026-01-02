import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { AppContext } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import Etiquetas from "../components/Etiquetas";
import FontSelector from "../components/FontSelector";
import CmykColorPicker from "../components/CmykColorPicker";
import { motion, AnimatePresence } from "framer-motion";
import useSnackbar from "../hooks/useSnackbar";
import styled from "styled-components";

// import Formulario from "../components/Formulario";
//import KitContainer from '../components/KitContainer';
// Estilos personalizados
const KitContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  border: 3px solid ${(props) => (props.selected ? "#4CAF50" : "#ccc")};
  border-radius: 15px;
  padding: 20px;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
  box-shadow: ${(props) =>
    props.selected ? "0 8px 30px rgba(76, 175, 80, 0.5)" : "none"};
  background-color: #82ffb5;
  width: 200px;
  max-width: 100%;
  height: auto;

  &:hover {
    transform: scale(1.05);
    border-color: '#4CAF50';
    box-shadow: '0 8px 30px rgba(76, 175, 80, 0.5)';
  }

  img {
    width: 100%;
    height: auto;
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    width: 150px;
  }
`;

const Customize = () => {
  const {
    selectedKit,
    selectedTheme,
    customizations,
    setCustomizations,
    user,
    kits,
    temas,
    setSelectedKit,
    setSelectedTheme,
  } = useContext(AppContext);
  const { logout } = useContext(AppContext);
  const { openSnackbar, setOpenSnackbar } = useSnackbar(); // Adicionei o hook de Snackbar
  const [errors, setErrors] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const { open, message, severity, showSnackbar, handleClose } = useSnackbar();

  // Função para obter os campos necessários com base nas etiquetas do kit
  const getCamposNecessarios = () => {
    if (!selectedKit || !selectedKit.etiquetas) return [];

    const camposNecessarios = new Set();
    selectedKit.etiquetas.forEach((etiquetaKit) => {
      const etiquetaInfo = etiquetas.find((e) => e.id === etiquetaKit.id);
      if (etiquetaInfo && etiquetaInfo.campos) {
        etiquetaInfo.campos.forEach((campo) => camposNecessarios.add(campo));
      }
    });
    return Array.from(camposNecessarios);
  };

  const camposNecessarios = getCamposNecessarios();

  useEffect(() => {
    if (selectedKit && temas.length > 0) {
      setSelectedTheme(temas[0]);
    }
  }, [selectedKit, temas]);

  const handleKitSelection = (kit) => {
    setSelectedKit(kit);
    setTabValue(1);
  };

  const handleThemeSelection = (theme) => {
    setSelectedTheme(theme);
    setTabValue(2);
  };

  const validateForm = () => {
    const newErrors = {};
    if (camposNecessarios.includes("nome") && !customizations.nome) {
      newErrors.nome = "O campo Nome é obrigatório.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddToCart = () => {
    if (!validateForm()) {
      showSnackbar(
        "Por favor, preencha todos os campos obrigatórios.",
        "error",
      );
      return;
    }

    // Redireciona para a página de pré-visualização
    navigate("/preview", {
      state: {
        selectedKit,
        selectedTheme,
        customizations,
        etiquetas,
      },
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box p={4}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h6">Usuário: {user?.name}</Typography>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Sair
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Escolher Kit" />
          <Tab label="Escolher Tema" disabled={!selectedKit} />
          <Tab label="Personalizar Texto" disabled={!selectedTheme} />
        </Tabs>
      </Box>

      <Box mt={2}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tabValue}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
          >
            {tabValue === 0 && (
              <>
                <Typography variant="h6" gutterBottom>
                  Escolha seu kit de etiquetas
                </Typography>
                <Box
                  display="flex"
                  flexWrap="wrap"
                  justifyContent="center"
                  gap={2}
                >
                  {kits.map((kit) => (
                    <KitContainer
                      key={kit.id}
                      selected={selectedKit?.id === kit.id}
                      onClick={() => handleKitSelection(kit)}
                    >
                      <img src={kit.thumbnail} alt={kit.nome} />
                      <Typography variant="h6" mt={2}>
                        {kit.nome}
                      </Typography>
                      <Typography variant="body1" mt={1}>
                        {kit.preco}
                      </Typography>
                      <Box mt={2}>
                        <Typography variant="body2">
                          Etiquetas incluídas:
                        </Typography>
                        {kit.etiquetas.map((etiqueta, index) => (
                          <Typography key={index} variant="body2">
                            {etiqueta.quantidade}x {etiqueta.id}
                          </Typography>
                        ))}
                      </Box>
                    </KitContainer>
                  ))}
                </Box>
              </>
            )}

            {tabValue === 1 && (
              <>
                <Typography variant="h6" gutterBottom>
                  Escolha o tema das suas etiquetas
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  {temas.map((theme) => (
                    <Card
                      key={theme.id}
                      onClick={() => handleThemeSelection(theme)}
                      sx={{
                        cursor: "pointer",
                        border:
                          selectedTheme?.id === theme.id
                            ? "2px solid #4CAF50"
                            : "1px solid #ccc",
                        borderRadius: "8px",
                        transition:
                          "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "scale(1.05)",
                          borderColor: "#4CAF50",
                        },
                        width: "150px",
                      }}
                    >
                      <CardContent>
                        <img
                          src={theme.thumbnail}
                          alt={theme.nome}
                          style={{
                            width: "100%",
                            height: "auto",
                            borderRadius: "8px",
                          }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </>
            )}

            {tabValue === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Personalize o texto das etiquetas
                  </Typography>
                  <Formulario
                    customizations={customizations}
                    setCustomizations={setCustomizations}
                    errors={errors}
                  />
                  <Box mt={2}>
                    <Typography variant="h6">Fonte</Typography>
                    <FontSelector
                      selectedFont={customizations.fontFamily}
                      onSelectFont={(font) =>
                        setCustomizations({
                          ...customizations,
                          fontFamily: font,
                        })
                      }
                    />
                  </Box>
                  <Box mt={2}>
                    <Typography variant="h6">Cor da Fonte</Typography>
                    <CmykColorPicker
                      selectedColor={customizations.textColor}
                      onColorSelect={(color) =>
                        setCustomizations({
                          ...customizations,
                          textColor: color,
                        })
                      }
                    />
                  </Box>
                  <Box mt={2}>
                    <Typography variant="h6">Cor de Fundo</Typography>
                    <CmykColorPicker
                      selectedColor={customizations.corFundo}
                      onColorSelect={(color) =>
                        setCustomizations({ ...customizations, corFundo: color })
                      }
                    />
                  </Box>
                  <Box mt={4} display="flex" justifyContent="center">
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleAddToCart}
                      disabled={
                        !selectedKit ||
                        !selectedTheme ||
                        !customizations.nome
                      }
                      sx={{ fontSize: "1rem", padding: "8px 16px" }}
                    >
                      Adicionar ao Carrinho
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Prévia das Etiquetas
                  </Typography>
                  <Box id="etiquetas-container">
                    {selectedKit && selectedTheme ? (
                      <Etiquetas
                        kit={selectedKit}
                        theme={selectedTheme}
                        customizations={customizations}
                        zoom={1.5}
                      />
                    ) : (
                      <Typography variant="body1" color="textSecondary">
                        Nenhum kit ou tema selecionado.
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            )}
          </motion.div>
        </AnimatePresence>
      </Box>

      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Customize;