const fetchPedidos = async () => {
    try {
      const token = localStorage.getItem('token'); // Recupera o token do localStorage
      if (!token) {
        throw new Error('Token não encontrado');
      }
  
      const response = await fetch('http://localhost:3001/api/getPedidos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Envia o token no cabeçalho
        },
      });
  
      if (!response.ok) {
        throw new Error('Erro na requisição: ' + response.statusText);
      }
  
      const data = await response.json();
      console.log('Pedidos carregados:', data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };
  
  // Exemplo de uso
  fetchPedidos();