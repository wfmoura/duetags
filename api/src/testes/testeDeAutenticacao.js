// Importações
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const port = 3002

// Configurações
app.use(cors()); // Permite requisições de qualquer origem (para testes)
app.use(express.json()); // Habilita o parsing de JSON

// Chave secreta para JWT (em produção, use uma chave segura e armazene em variáveis de ambiente)
const JWT_SECRET = 'j2k3l@dlk!lakj786dta';

// Dados de usuário fictícios (em produção, use um banco de dados)
const users = [
  {
    id: 1,
    email: 'wfmoura2@gmail.com',
    password: '10203040', // Em produção, armazene senhas criptografadas
  },
];

// Rota de login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Verifica se o usuário existe
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos' });
  }

  // Gera o token JWT
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

  res.json({ success: true, token });
});

// Rota protegida (requer autenticação)
app.get('/api/protected', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }

  // Verifica o token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token inválido ou expirado' });
    }

    // Se o token for válido, retorna uma mensagem de sucesso
    res.json({ success: true, message: 'Rota protegida acessada com sucesso', user });
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

// Frontend simples (para testes)
const testAuth = async () => {
  // 1. Faz login para obter o token
  const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: 'joao@example.com', password: 'senha123' }),
  });

  if (!loginResponse.ok) {
    console.error('Erro ao fazer login:', await loginResponse.text());
    return;
  }

  const { token } = await loginResponse.json();
  console.log('Token obtido:', token);

  // 2. Acessa a rota protegida com o token
  const protectedResponse = await fetch('http://localhost:3001/api/protected', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!protectedResponse.ok) {
    console.error('Erro ao acessar rota protegida:', await protectedResponse.text());
    return;
  }

  const protectedData = await protectedResponse.json();
  console.log('Resposta da rota protegida:', protectedData);
};

// Executa o teste
testAuth();
