import { useState, useCallback } from 'react';
import api from '../axios-config';

/**
 * Hook personalizado para gerenciar filtros de registros inativos
 * Pode ser usado em qualquer componente que precise listar/filtrar registros inativos
 */
const useInactiveFilter = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função genérica para buscar registros inativos de qualquer entidade
  const fetchInactiveRecords = useCallback(async (entityType) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/${entityType}/inactive`);
      return response.data;
    } catch (err) {
      console.error(`Erro ao buscar ${entityType} inativos:`, err);
      setError(`Erro ao carregar ${entityType} inativos`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para buscar todos os registros (ativos + inativos)
  const fetchAllRecords = useCallback(async (entityType) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/${entityType}/all`);
      return response.data;
    } catch (err) {
      console.error(`Erro ao buscar todos os ${entityType}:`, err);
      setError(`Erro ao carregar todos os ${entityType}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para buscar apenas registros ativos (comportamento padrão)
  const fetchActiveRecords = useCallback(async (entityType) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/${entityType}`);
      return response.data;
    } catch (err) {
      console.error(`Erro ao buscar ${entityType} ativos:`, err);
      setError(`Erro ao carregar ${entityType} ativos`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Funções específicas para Pacientes
  const fetchInactivePacientes = useCallback(() => fetchInactiveRecords('paciente'), [fetchInactiveRecords]);
  const fetchAllPacientes = useCallback(() => fetchAllRecords('paciente'), [fetchAllRecords]);
  const fetchActivePacientes = useCallback(() => fetchActiveRecords('paciente'), [fetchActiveRecords]);

  // Função para buscar paciente inativo por email
  const findInactivePacienteByEmail = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/paciente/inactive/email/${email}`);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        return null; // Paciente não encontrado
      }
      console.error('Erro ao buscar paciente inativo por email:', err);
      setError('Erro ao buscar paciente por email');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para buscar paciente inativo por nome
  const findInactivePacienteByNome = useCallback(async (nome) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/paciente/inactive/nome/${nome}`);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        return null;
      }
      console.error('Erro ao buscar paciente inativo por nome:', err);
      setError('Erro ao buscar paciente por nome');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para buscar pacientes inativos por nome (contém)
  const searchInactivePacientesByNome = useCallback(async (nome) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/paciente/inactive/search?nome=${encodeURIComponent(nome)}`);
      return response.data;
    } catch (err) {
      console.error('Erro ao buscar pacientes inativos por nome:', err);
      setError('Erro ao buscar pacientes por nome');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Funções específicas para Dentistas
  const fetchInactiveDentistas = useCallback(() => fetchInactiveRecords('dentistas'), [fetchInactiveRecords]);
  const fetchAllDentistas = useCallback(() => fetchAllRecords('dentistas'), [fetchAllRecords]);
  const fetchActiveDentistas = useCallback(() => fetchActiveRecords('dentistas'), [fetchActiveRecords]);

  // Funções específicas para Clínicas
  const fetchInactiveClinicas = useCallback(() => fetchInactiveRecords('clinicas'), [fetchInactiveRecords]);
  const fetchAllClinicas = useCallback(() => fetchAllRecords('clinicas'), [fetchAllRecords]);
  const fetchActiveClinicas = useCallback(() => fetchActiveRecords('clinicas'), [fetchActiveRecords]);

  // Funções específicas para Protéticos
  const fetchInactiveProteticos = useCallback(() => fetchInactiveRecords('proteticos'), [fetchInactiveRecords]);
  const fetchAllProteticos = useCallback(() => fetchAllRecords('proteticos'), [fetchAllRecords]);
  const fetchActiveProteticos = useCallback(() => fetchActiveRecords('proteticos'), [fetchActiveRecords]);

  // Funções específicas para Serviços
  const fetchInactiveServicos = useCallback(() => fetchInactiveRecords('servico'), [fetchInactiveRecords]);
  const fetchAllServicos = useCallback(() => fetchAllRecords('servico'), [fetchAllRecords]);
  const fetchActiveServicos = useCallback(() => fetchActiveRecords('servico'), [fetchActiveRecords]);

  // Função utilitária para filtrar registros por status localmente
  const filterByStatus = useCallback((records, showInactive = false) => {
    if (!Array.isArray(records)) return [];
    
    return records.filter(record => {
      if (showInactive) {
        return record.isActive === false;
      } else {
        return record.isActive === true;
      }
    });
  }, []);

  // Função para alternar o status de um registro
  const toggleRecordStatus = useCallback(async (entityType, id, newStatus) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.patch(`/${entityType}/${id}`, {
        isActive: newStatus
      });
      return response.data;
    } catch (err) {
      console.error(`Erro ao alterar status do ${entityType}:`, err);
      setError(`Erro ao alterar status do registro`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Estados
    loading,
    error,
    
    // Funções genéricas
    fetchInactiveRecords,
    fetchAllRecords,
    fetchActiveRecords,
    filterByStatus,
    toggleRecordStatus,
    
    // Funções específicas para Pacientes
    fetchInactivePacientes,
    fetchAllPacientes,
    fetchActivePacientes,
    findInactivePacienteByEmail,
    findInactivePacienteByNome,
    searchInactivePacientesByNome,
    
    // Funções específicas para Dentistas
    fetchInactiveDentistas,
    fetchAllDentistas,
    fetchActiveDentistas,
    
    // Funções específicas para Clínicas
    fetchInactiveClinicas,
    fetchAllClinicas,
    fetchActiveClinicas,
    
    // Funções específicas para Protéticos
    fetchInactiveProteticos,
    fetchAllProteticos,
    fetchActiveProteticos,
    
    // Funções específicas para Serviços
    fetchInactiveServicos,
    fetchAllServicos,
    fetchActiveServicos
  };
};

export default useInactiveFilter; 