const express = require("express");
const { authenticateToken } = require("../utils/authMiddleware");
const etiquetaController = require("../controllers/etiquetaController"); // 🔹 Corrigido

const router = express.Router();

// 🔹 Certifique-se de que `saveEtiquetas` está sendo chamado corretamente
router.post("/saveEtiquetas", authenticateToken, etiquetaController.saveEtiquetas);
router.get("/getPedidos", authenticateToken, etiquetaController.getPedidos);
router.get("/downloadPedido/:id", authenticateToken, etiquetaController.downloadPedido);

module.exports = router;
