const jwt = require("jsonwebtoken");
const config = require("../src/config/config");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token de autenticação não fornecido" });
  }

  const token = authHeader.split(" ")[1]; // Pegando apenas o token
  jwt.verify(token, process.env.JWT_SECRET || config.jwt.secret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido ou expirado" });
    }
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user?.role === "admin") {
    console.log("Acesso permitido");
    next();
  } else {
    console.log("Usuário Cliente");
    res.status(403).json({ message: "Acesso negado" });
  }
};

module.exports = { authenticateToken, isAdmin };
