const request = require('supertest');
const jwt = require('jsonwebtoken');

// URL do servidor em execução
const API_URL = 'http://localhost:3001';

// Dados de teste
const TEST_USER = {
  email: 'joao@example.com',
  password: 'senha123',
};

const INVALID_USER = {
  email: 'invalido@example.com',
  password: 'senhaerrada',
};

let authToken = ''; // Armazenará o token JWT para testes de rotas protegidas

// Teste da rota de login
describe('Testes de Autenticação', () => {
  it('Deve fazer login e retornar um token JWT', async () => {
    const response = await request(API_URL)
      .post('/api/auth/login')
      .send(TEST_USER);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();

    // Salva o token para uso em testes posteriores
    authToken = response.body.token;
  });

  it('Deve falhar ao fazer login com credenciais inválidas', async () => {
    const response = await request(API_URL)
      .post('/api/auth/login')
      .send(INVALID_USER);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('E-mail ou senha incorretos');
  });
});

// Teste da rota protegida
describe('Testes de Rotas Protegidas', () => {
  it('Deve acessar a rota protegida com um token válido', async () => {
    const response = await request(API_URL)
      .get('/api/protected')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Rota protegida acessada com sucesso');
    expect(response.body.user).toBeDefined();
  });

  it('Deve falhar ao acessar a rota protegida sem token', async () => {
    const response = await request(API_URL)
      .get('/api/protected');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Token não fornecido');
  });

  it('Deve falhar ao acessar a rota protegida com token inválido', async () => {
    const invalidToken = jwt.sign({ id: 999, email: 'fake@example.com' }, 'chave_invalida', { expiresIn: '1h' });

    const response = await request(API_URL)
      .get('/api/protected')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Token inválido ou expirado');
  });
});