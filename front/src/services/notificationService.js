import api from '../axios-config';

export const notificationService = {
  
  // Buscar notificações de estoque
  async getNotificacaoEstoque() {
    try {
      const response = await api.get('/material/notificacoes/estoque');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar notificações de estoque:', error);
      throw error;
    }
  }
  
};

export default notificationService; 