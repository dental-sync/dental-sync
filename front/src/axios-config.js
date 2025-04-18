import axios from 'axios';

// Definir URL base para as chamadas API
const baseURL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:8080';

// Criar instância do axios com configurações customizadas
const api = axios.create({
  baseURL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptadores para requisições
api.interceptors.request.use(
  config => {
    // Aqui poderia adicionar um token de autenticação se necessário
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
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
      
      // Aqui poderia implementar tratamentos específicos por código
      // if (error.response.status === 401) {
      //   // Redirecionar para login, por exemplo
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