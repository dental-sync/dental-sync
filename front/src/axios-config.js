import axios from 'axios';

// Definir URL base para as chamadas API
// No Docker, sempre usar proxy /api (nginx faz o roteamento para o backend)
const baseURL = '/api';

// Função para verificar se a URL é uma rota de login/autenticação
const isLoginRoute = (url) => {
  if (!url) return false;
  
  const loginRoutes = [
    '/login',
    '/logout',
    '/password',
    '/proteticos/cadastro',
    '/laboratorios',
    '/auth/check', // Importante: não interferir na verificação de auth
    '/security/reset-password-emergency'
  ];
  
  return loginRoutes.some(route => url.includes(route));
};

// Criar instância do axios com configurações customizadas
const api = axios.create({
  baseURL,
  timeout: 30000, // 30 segundos - aumentado para operações que envolvem email
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
        // Manipular erros de resposta (ex: 401, 403, 404, 500, etc)
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const url = error.config?.url || '';
      
      console.error('Erro na resposta:', status, data, 'URL:', url);
      
      // Tratar erro 403 - Conta desativada (mas não nas rotas de login)
      if (status === 403 && !isLoginRoute(url)) {
        // Só redirecionar se a mensagem for especificamente sobre conta desativada
        const isAccountDeactivated = data && data.message && 
          (data.message.includes('desativada') || data.message.includes('inativa') || data.message.includes('Conta desativada'));
        
        if (isAccountDeactivated) {
          console.warn('🚫 Conta desativada detectada - redirecionando para login');
          
          // Limpar qualquer dado de autenticação local
          if (typeof window !== 'undefined') {
            // Limpar localStorage se houver dados
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            
            // Redirecionar para login imediatamente
            window.location.href = '/login';
          }
        } else {
          console.warn('🔒 Erro 403 - Acesso negado (mas não é conta desativada)');
        }
      }
      
      // Tratar erro 401 - Não autorizado (mas não nas rotas de login/auth)
      else if (status === 401 && !isLoginRoute(url)) {
        console.warn('🔒 Não autorizado - possível sessão expirada para URL:', url);
        // Deixar o AuthContext gerenciar outros casos de 401
      }
      
      // Log para debug - mostrar quando NÃO interferimos
      if (isLoginRoute(url)) {
        console.log('🔄 Não interferindo na rota de login/auth:', url);
      }
      
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