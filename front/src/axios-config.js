import axios from 'axios';

// Definir URL base para as chamadas API
const baseURL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:8080';

// Criar instância do axios com configurações customizadas
const api = axios.create({
  baseURL,
  timeout: 10000, // 10 segundos
  withCredentials: true, // Importante: inclui cookies HTTP-only
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptadores para requisições
api.interceptors.request.use(
  config => {
    // Não é mais necessário adicionar token manualmente - cookies são automáticos
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptadores para respostas
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Manipular erros de resposta (ex: 401, 404, 500, etc)
    if (error.response) {
      // O servidor respondeu com um status diferente de 2xx
      console.error('Erro na resposta:', error.response.status, error.response.data);
      
      // Remover redirecionamento automático - deixar o AuthContext gerenciar
      // if (error.response.status === 401) {
      //   window.location.href = '/login';
      // }
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Sem resposta do servidor:', error.request);
    } else {
      // Erro ao configurar a requisição
      console.error('Erro:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 