import axios from 'axios';

// Definir URL base para as chamadas API
const baseURL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:8080';

// Criar instância do axios com configurações customizadas
const api = axios.create({
  baseURL,
  timeout: 30000, // 30 segundos - aumentado para operações que envolvem email
  withCredentials: false, // JWT não precisa de cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptadores para requisições
api.interceptors.request.use(
  config => {
    // Adicionar token JWT se disponível
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token adicionado à requisição:', config.url);
    } else {
      console.log('⚠️ Nenhum token disponível para:', config.url);
    }
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
  async error => {
    const originalRequest = error.config;

    // Se for erro 401 e não for tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${baseURL}/auth/refresh-token`, 
            new URLSearchParams({ refreshToken }), 
            {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
          );

          if (response.data.success) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            
            // Repetir requisição original com novo token
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Erro ao renovar token:', refreshError);
      }

      // Se chegou aqui, o refresh falhou - fazer logout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Manipular outros erros
    if (error.response) {
      console.error('Erro na resposta:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Sem resposta do servidor:', error.request);
    } else {
      console.error('Erro:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 