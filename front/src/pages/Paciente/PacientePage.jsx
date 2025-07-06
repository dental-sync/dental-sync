//importa funções do React e bibliotecas externas
import React, { useState, useEffect, useRef } from 'react';
import './PacientePage.css'; //estilo(style [css]) específico da página
import SearchBar from '../../components/SearchBar/SearchBar'; //barra de busca personalizada (SearchBar [componente])
import ActionButton from '../../components/ActionButton/ActionButton'; //botões com ícones (ActionButton [componente])
import PacienteTable from '../../components/PacienteTable/PacienteTable'; //tabela de pacientes (PacienteTable [componente])
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import ExportDropdown from '../../components/ExportDropdown/ExportDropdown'; //componente de exportação de dados
import { useNavigate, useLocation } from 'react-router-dom'; //navegação e controle de rota (useNavigate [hook], useLocation [hook])
import api from '../../axios-config';
import { toast } from 'react-toastify';
import useNotifications from '../../hooks/useNotifications';

const PacientePage = () => {
  
  const [searchQuery, setSearchQuery] = useState('');

  
  const [pacientes, setPacientes] = useState([]);
  const [pacientesComHistorico, setPacientesComHistorico] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 //Mesmo formato de ordenação do DentistaPage.jsx
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending'
  });  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  
  const [filtros, setFiltros] = useState({
    isActive: 'todos'
  });

  const [refreshData, setRefreshData] = useState(0);
  
  const filterRef = useRef(null);

  const navigate = useNavigate();

  
  const location = useLocation();
  const { notifications, loading: notificationLoading, refreshNotifications } = useNotifications();
  
  // Criando um ref para armazenar mensagens recentes e evitar duplicação de toasts
  const recentMessages = useRef(new Set());

  // Função para formatar data do padrão americano para brasileiro
  const formatDateToBR = (dateString) => {
    if (!dateString) return '-';
    
    try {
      // Se a data já está no formato brasileiro, retorna como está
      if (dateString.includes('/')) {
        return dateString;
      }
      
      // Converte de YYYY-MM-DD para DD/MM/YYYY
      const date = new Date(dateString + 'T00:00:00'); // Adiciona horário para evitar problemas de timezone
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dateString; // Retorna a data original em caso de erro
    }
  };

  useEffect(() => {
    const fetchPacientes = async () => {
      setLoading(true);
      try {
        const response = await api.get('/paciente');
        const pacientesData = response.data;
        setPacientes(pacientesData);
        
        // Buscar histórico para cada paciente
        const historicoPromises = pacientesData.map(async (paciente) => {
          try {
            const historicoResponse = await api.get(`/paciente/${paciente.id}/historico`);
            const historico = historicoResponse.data;
            // Ordenar por data de entrega e pegar o mais recente
            const pedidoMaisRecente = historico.sort((a, b) => 
              new Date(b.dataEntrega) - new Date(a.dataEntrega)
            )[0];
            
            return {
              pacienteId: paciente.id,
              ultimoServico: pedidoMaisRecente ? pedidoMaisRecente.dataEntrega : null
            };
          } catch (error) {
            console.error(`Erro ao buscar histórico do paciente ${paciente.id}:`, error);
            return {
              pacienteId: paciente.id,
              ultimoServico: null
            };
          }
        });
        
        const historicos = await Promise.all(historicoPromises);
        const historicoMap = historicos.reduce((acc, curr) => {
          acc[curr.pacienteId] = curr.ultimoServico;
          return acc;
        }, {});
        
        setPacientesComHistorico(historicoMap);
      } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
        toast.error('Erro ao carregar pacientes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPacientes();
  }, [refreshData]);
  
  useEffect(() => {
    if (location.state && location.state.success) {
      const successMessage = location.state.success;
      const shouldRefresh = location.state.refresh;
      
      // Limpa o state imediatamente
      window.history.replaceState({}, document.title);
      
      // Cria uma chave única para esta mensagem
      const messageKey = `${successMessage}-${Date.now()}`;
      
      // Verifica se esta mensagem já foi exibida recentemente (nos últimos 3 segundos)
      if (!recentMessages.current.has(messageKey)) {
        // Adiciona a mensagem ao cache
        recentMessages.current.add(messageKey);
        
        // Exibe o toast
        toast.success(successMessage, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          // ID fixo para a mesma mensagem
          toastId: successMessage
        });
        
        // Remove a mensagem do cache após 3 segundos
        setTimeout(() => {
          recentMessages.current.delete(messageKey);
        }, 3000);
        
        // Se é necessário atualizar os dados
        if (shouldRefresh) {
          setRefreshData(prev => prev + 1);
        }
      }
    }
  }, [location]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePacienteDeleted = (pacienteId) => {
    // Primeiro, remover o paciente do estado local para atualização imediata da UI
    setPacientes(prevPacientes => 
      prevPacientes.filter(paciente => paciente.id !== pacienteId)
    );
    
    // Forçar um refresh dos dados para sincronizar com o banco
    setRefreshData(prev => prev + 1);
    
    // Limpa qualquer estado de navegação existente
    window.history.replaceState({}, document.title);
    
    // Adicionamos uma mensagem de sucesso usando o padrão de state
    navigate('', { 
      state: { 
        success: "Paciente excluído com sucesso!",
        refresh: false // Não precisamos de refresh pois já fizemos acima
      },
      replace: true // Importante usar replace para não adicionar nova entrada no histórico
    });
  };

 
  const handleStatusChange = (pacienteId, newStatus) => {
    // Encontrar o paciente atual
    const pacienteAtual = pacientes.find(p => p.id === pacienteId);
    
    if (!pacienteAtual) {
      console.error('Paciente não encontrado:', pacienteId);
      return;
    }
    
    // Verificar se o status está realmente mudando
    const statusAtual = pacienteAtual.isActive;
    
    // Se o status for o mesmo, não faz nada
    if (statusAtual === newStatus) {
      return;
    }

    // Atualizar o status do paciente na lista imediatamente
    const pacientesAtualizados = pacientes.map(paciente =>
      paciente.id === pacienteId
        ? { ...paciente, isActive: newStatus }
        : paciente
    );
    
    // Atualizar o estado imediatamente
    setPacientes(pacientesAtualizados);
    
    // Forçar uma re-renderização para garantir que os filtros sejam aplicados corretamente
    setRefreshData(prev => prev + 1);
    
    // Exibir o toast de forma padronizada
    const statusText = newStatus ? 'Ativo' : 'Inativo';
    
    // Limpa qualquer estado de navegação existente
    window.history.replaceState({}, document.title);
    
    // Adicionamos uma mensagem de sucesso usando o padrão de state
    navigate('', { 
      state: { 
        success: `Status atualizado com sucesso para ${statusText}`,
        refresh: false // Não precisamos de refresh pois já atualizamos localmente
      },
      replace: true // Importante usar replace para não adicionar nova entrada no histórico
    });
  };
 
  const pacientesFiltrados = pacientes
    .filter(paciente => {
      
      if (filtros.isActive !== 'todos') {
        const isAtivo = filtros.isActive === 'ATIVO';
        if (paciente.isActive !== isAtivo) {
          return false;
        }
      }
      
      
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const idFormatado = `P${String(paciente.id).padStart(4, '0')}`;
        
        return (
          paciente.nome?.toLowerCase().includes(searchLower) ||
          paciente.email?.toLowerCase().includes(searchLower) ||
          paciente.telefone?.toLowerCase().includes(searchLower) ||
          (paciente.id?.toString() || '').toLowerCase().includes(searchLower) ||
          idFormatado.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .map(paciente => ({
      ...paciente,
      dataNascimento: formatDateToBR(paciente.dataNascimento),
      ultimoServico: pacientesComHistorico[paciente.id] || null
    }))
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      const keyA = a[sortConfig.key];
      const keyB = b[sortConfig.key];
      
      if (keyA === undefined || keyA === null) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (keyB === undefined || keyB === null) return sortConfig.direction === 'ascending' ? 1 : -1;
      
      //Comparação dependendo do tipo de dados
      if (typeof keyA === 'string' && typeof keyB === 'string') {
        if (sortConfig.direction === 'ascending') {
          return keyA.localeCompare(keyB);
        }
        return keyB.localeCompare(keyA);
      } else {
        if (sortConfig.direction === 'ascending') {
          return keyA > keyB ? 1 : -1;
        }
        return keyA < keyB ? 1 : -1;
      }
    });

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const toggleFiltro = () => {
    setIsFilterOpen(!isFilterOpen);
    setIsExportOpen(false); //Fechar o outro dropdown
  };

  const toggleExport = () => {
    setIsExportOpen(!isExportOpen);
    setIsFilterOpen(false); //Fechar o outro dropdown
  };

  const handleCloseExport = () => {
    setIsExportOpen(false);
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value
    });
  };

  const handleLimparFiltros = () => {
    setFiltros({
      isActive: 'todos'
    });
  };

  const handleNovo = () => {
    navigate('/paciente/cadastro');
  };
  
  const handleRefresh = () => {
    setRefreshData(prev => prev + 1);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  if (loading) {
    return <div className="loading">Carregando pacientes...</div>;
  }

  return (
    <div className="paciente-page">
      <div className="page-top">
        <div className="notification-container">
            <NotificationBell 
              count={notifications.total}
              baixoEstoque={notifications.baixoEstoque}
              semEstoque={notifications.semEstoque}
              loading={notificationLoading}
              onRefresh={refreshNotifications}
            />
        </div>
      </div>
      
      <div className="page-header">
        <h1 className="page-title">Pacientes</h1>
        <div className="header-actions">
          <div className="filter-container" ref={filterRef}>
            <ActionButton 
              label="Filtrar" 
              icon="filter"
              onClick={toggleFiltro} 
              active={isFilterOpen || filtros.isActive !== 'todos'}
            />
            
            {isFilterOpen && (
              <div className="filter-dropdown">
                <h3>Filtros</h3>
                <div className="filter-group">
                  <label htmlFor="isActive">Status</label>
                  <select
                    id="isActive"
                    name="isActive"
                    value={filtros.isActive}
                    onChange={handleFiltroChange}
                    className="filter-select"
                  >
                    <option value="todos">Todos</option>
                    <option value="ATIVO">Ativo</option>
                    <option value="INATIVO">Inativo</option>
                  </select>
                </div>
                <div className="filter-actions">
                  <button
                    type="button"
                    className="clear-filter-button"
                    onClick={handleLimparFiltros}
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <ExportDropdown 
            data={pacientesFiltrados}
            headers={['ID', 'Nome', 'Email', 'Telefone', 'Data de Nascimento', 'Último Serviço', 'Status']}
            fields={['id', 'nome', 'email', 'telefone', 'dataNascimento', 'ultimoServico', 'isActive']}
            filename="pacientes"
            isOpen={isExportOpen}
            toggleExport={toggleExport}
            onCloseDropdown={handleCloseExport}
            title="Lista de Pacientes"
            formatIdFn={(id) => `P${String(id).padStart(4, '0')}`}
          />
        </div>
      </div>
      
      <div className="search-container">
        <SearchBar 
          placeholder="Buscar por ID (P0001), nome, email, telefone..."
          onSearch={handleSearch} 
        />
        <ActionButton
          label="Novo"
          variant="primary"
          onClick={handleNovo}
        />
      </div>
      
      <div className="table-section">
        {searchQuery && pacientesFiltrados.length === 0 && (
          <div className="search-info">
            Nenhum paciente encontrado para a busca "{searchQuery}".
          </div>
        )}
        {!searchQuery && pacientesFiltrados.length === 0 && filtros.isActive !== 'todos' ? (
          <div className="filter-info">
            Nenhum paciente encontrado com os filtros aplicados.
          </div>
        ) : null}
        <PacienteTable 
          pacientes={pacientesFiltrados} 
          onPacienteDeleted={handlePacienteDeleted}
          onStatusChange={handleStatusChange}
          sortConfig={sortConfig}
          onSort={handleSort}
          isEmpty={pacientesFiltrados.length === 0}
        />
      </div>
    </div>
  );
};

export default PacientePage;
