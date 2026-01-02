const bcrypt = require('bcrypt');

const senha = '10203040'; // Senha correta

bcrypt.hash(senha, 10, (err, hash) => {
  if (err) {
    console.error('Erro ao gerar hash:', err);
  } else {
    console.log('Novo hash gerado:', hash);
  }
});
