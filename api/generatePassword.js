const bcrypt = require('bcrypt');
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

// Função para gerar uma senha criptografada
async function generatePassword(password) {
  try {
    // Gera um hash da senha usando o segredo do .env como salt
    const saltRounds = 10; // Número de rounds para gerar o salt
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('Senha criptografada:', hashedPassword);
    return hashedPassword;
  } catch (error) {
    console.error('Erro ao gerar a senha:', error);
  }
}

// Exemplo de uso
const password = '10203040'; // Senha que você deseja criptografar
generatePassword(password);