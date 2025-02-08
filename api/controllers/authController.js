const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../src/config/config');
require('dotenv').config();

const login = async (req, res, supabase) => {
  const { email, password } = req.body;

  try {
    // 🔹 Buscar o usuário pelo e-mail
    const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, role, password_hash') // 🔹 Pegamos password_hash corretamente
    .eq('email', email)
    .single();
  
  if (error || !user) {
    return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
  }
  
  if (!user.password_hash) {
    return res.status(500).json({ success: false, message: 'Erro no servidor: senha não definida' });
  }
  
  // Verifica se a senha está correta
  const senhaCorreta = await bcrypt.compare(password, user.password_hash);
  
  if (!senhaCorreta) {
    return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
  }
  

    // 🔹 Gerar Token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET, // Certifique-se de que existe no .env
      { expiresIn: '1h' } // Token expira em 1 hora
    );

    // 🔹 Configurar cookie seguro
    res.cookie('token', token, {
      httpOnly: true, // Impede acesso ao cookie via JavaScript no navegador
      secure: process.env.NODE_ENV === 'production', // Em produção, usa HTTPS
      sameSite: 'Strict', // Impede CSRF (Cross-Site Request Forgery)
      maxAge: 3600000, // 1 hora
    });

    // 🔹 Retornar resposta de sucesso (sem token no corpo)
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      message: "Login realizado com sucesso!"
    });

  } catch (error) {
    console.error('[ERRO] Falha no login:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
};

const checkAuth = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Não autenticado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ success: true, user: decoded });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token inválido ou expirado' });
  }
};

const logout = async (req, res) => {
  try {
    // Limpe o cookie de autenticação
    res.clearCookie('token', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/' 
    });

    // Responda com sucesso
    res.json({ 
      success: true, 
      message: 'Logout realizado com sucesso' 
    });
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao fazer logout' 
    });
  }
};

// 🔹 Correção: Agora exportamos corretamente as funções
module.exports = { login, checkAuth, logout };
