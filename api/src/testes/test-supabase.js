// Importa o cliente do Supabase e o pacote dotenv para carregar variáveis de ambiente
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Log inicial para indicar que o teste de conexão está sendo iniciado
console.log('Testando conexão com o Supabase...');
console.log('URL:', process.env.SUPABASE_URL);
console.log('Chave:', process.env.SUPABASE_KEY);

// Verifica se as variáveis de ambiente necessárias estão configuradas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('Erro: SUPABASE_URL ou SUPABASE_KEY não configurados no arquivo .env.');
  process.exit(1); // Encerra o script com código de erro 1
}

// Cria o cliente do Supabase usando as variáveis de ambiente
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * Função para testar a conexão com uma tabela específica no Supabase.
 * @param {string} tableName - Nome da tabela a ser testada.
 */
const testTable = async (tableName) => {
  console.log(`Testando conexão com a tabela ${tableName}...`);

  // Tenta buscar um registro da tabela
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  // Verifica se houve erro na consulta
  if (error) {
    console.error(`Erro ao acessar a tabela ${tableName}:`, error);
  } else {
    console.log(`Conexão com a tabela ${tableName} bem-sucedida! Dados:`, data);
  }
};

/**
 * Função assíncrona para testar várias tabelas.
 */
const testTables = async () => {
  try {
    // Testa as tabelas users, products e orders
    await testTable('users');
    await testTable('products');
    await testTable('orders');
  } catch (error) {
    console.error('Erro durante o teste das tabelas:', error);
  }
};

// Executa o teste das tabelas
testTables();