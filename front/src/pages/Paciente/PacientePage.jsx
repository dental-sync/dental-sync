//importa funções do React e bibliotecas externas
import React, { useState, useEffect, useRef } from 'react';
import './PacientePage.css'; //estilo(style [css]) específico da página
import SearchBar from '../../components/SearchBar/SearchBar'; //barra de busca personalizada (SearchBar [componente])
import ActionButton from '../../components/ActionButton/ActionButton'; //botões com ícones (ActionButton [componente])
import PacienteTable from '../../components/PacienteTable/PacienteTable'; //tabela de pacientes (PacienteTable [componente])
import NotificationBell from '../../components/NotificationBell/NotificationBell'; //sininho de notificações (NotificationBell [componente])
import ExportDropdown from '../../components/ExportDropdown/ExportDropdown'; //componente de exportação de dados
import { useNavigate, useLocation } from 'react-router-dom'; //navegação e controle de rota (useNavigate [hook], useLocation [hook])
import api from '../../axios-config';
import { toast } from 'react-toastify';

const PacientePage = () => {
  
  const [searchQuery, setSearchQuery] = useState('');

  
  const [pacientes, setPacientes] = useState([]);

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
  
  // Criando um ref para armazenar mensagens recentes e evitar duplicação de toasts
  const recentMessages = useRef(new Set());

  useEffect(() => {
    const fetchPacientes = async () => {
      setLoading(true);
      try {
        const response = await api.get('/paciente');
        setPacientes(response.data);
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
    // Atualizar o status do paciente na lista
    if (newStatus !== null) {
      setPacientes(prevPacientes =>
        prevPacientes.map(paciente =>
          paciente.id === pacienteId
            ? { ...paciente, isActive: newStatus }
            : paciente
        )
      );
      
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
    }
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
        return (
          paciente.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          paciente.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          paciente.telefone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (paciente.id?.toString() || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      return true;
    })
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
          <NotificationBell count={2} />
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
          />
        </div>
      </div>
      
      <div className="search-container">
        <SearchBar 
          placeholder="Buscar por nome, email, telefone..."
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
