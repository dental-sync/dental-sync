// Configuração da URL base da API
const API_BASE_URL = 'http://localhost:8080';

// Função para construir a URL completa
const buildUrl = (endpoint) => {
  // Remove barras iniciais para evitar duplicação
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Funções HTTP básicas
export const api = {
  get: async (endpoint) => {
    const response = await fetch(buildUrl(endpoint));
    if (!response.ok) throw new Error('Erro na requisição GET');
    return response.json();
  },

  post: async (endpoint, data) => {
    const response = await fetch(buildUrl(endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erro na requisição POST');
    return response.json();
  },

  put: async (endpoint, data) => {
    const response = await fetch(buildUrl(endpoint), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erro na requisição PUT');
    return response.json();
  },

  patch: async (endpoint, data) => {
    const response = await fetch(buildUrl(endpoint), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erro na requisição PATCH');
    return response.json();
  },

  delete: async (endpoint) => {
    const response = await fetch(buildUrl(endpoint), {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Erro na requisição DELETE');
    return response.json();
  },
};

// Exporta a URL base para uso em outros lugares se necessário
export const getBaseUrl = () => API_BASE_URL;

// Exporta a função buildUrl para casos específicos
export const getFullUrl = buildUrl; 