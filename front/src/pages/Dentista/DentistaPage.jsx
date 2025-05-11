import React, { useState, useEffect, useRef } from 'react';
import './DentistaPage.css';
import SearchBar from '../../components/SearchBar/SearchBar';
import ActionButton from '../../components/ActionButton/ActionButton';
import DentistaTable from '../../components/DentistaTable/DentistaTable';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import ExportDropdown from '../../components/ExportDropdown/ExportDropdown';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const DentistaPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dentistas, setDentistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    isActive: 'todos'
  });
  const [refreshData, setRefreshData] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  const filterRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Criando um ref para armazenar mensagens recentes e evitar duplicação de toasts
  const recentMessages = useRef(new Set());

  useEffect(() => {
    const fetchDentistas = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/dentistas');
        const dentistasFormatados = response.data.map(dentista => ({
          id: dentista.id,
          nome: dentista.nome,
          cro: dentista.cro,
          telefone: dentista.telefone || '-',
          email: dentista.email || '-',
          isActive: dentista.isActive ? 'ATIVO' : 'INATIVO'
        }));
        setDentistas(dentistasFormatados);
      } catch (err) {
        console.error('Erro ao buscar dentistas:', err);
        setDentistas([]);
        setError('Não foi possível carregar os dados do servidor. Tente novamente mais tarde.');
        toast.error('Não foi possível carregar os dados do servidor. Tente novamente mais tarde.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDentistas();
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
          pauseOnHover: true,
          draggable: true,
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

  const handleDentistaDeleted = (dentistaId) => {
    // Primeiro, remover o dentista do estado local para atualização imediata da UI
    setDentistas(prevDentistas => 
      prevDentistas.filter(dentista => dentista.id !== dentistaId)
    );
    
    // Forçar um refresh dos dados para sincronizar com o banco
    setRefreshData(prev => prev + 1);
    
    // Limpa qualquer estado de navegação existente
    window.history.replaceState({}, document.title);
    
    // Adicionamos uma mensagem de sucesso usando o padrão de state
    navigate('', { 
      state: { 
        success: "Dentista excluído com sucesso!",
        refresh: false // Não precisamos de refresh pois já fizemos acima
      },
      replace: true // Importante usar replace para não adicionar nova entrada no histórico
    });
  };

  const handleStatusChange = (dentistaId, newStatus) => {
    // Encontrar o dentista atual
    const dentistaAtual = dentistas.find(d => d.id === dentistaId);
    
    // Verificar se o status está realmente mudando
    const statusAtual = dentistaAtual.isActive === 'ATIVO';
    if (statusAtual === (newStatus === 'ATIVO')) {
      return; // Não faz nada se o status for o mesmo
    }

    // Atualizar o status do dentista na lista
    if (newStatus !== null) {
      setDentistas(prevDentistas =>
        prevDentistas.map(dentista =>
          dentista.id === dentistaId
            ? { ...dentista, isActive: newStatus }
            : dentista
        )
      );
      
      // Exibir o toast de forma padronizada
      const statusText = newStatus === 'ATIVO' ? 'Ativo' : 'Inativo';
      
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

  // Função utilitária para formatar o ID
  const formatDentistaId = (id) => `D${String(id).padStart(4, '0')}`;

  const dentistasFiltrados = dentistas
    .filter(dentista => {
      if (filtros.isActive !== 'todos' && dentista.isActive !== filtros.isActive) {
        return false;
      }
      
      if (searchQuery) {
        return (
          dentista.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dentista.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dentista.telefone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dentista.cro?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (dentista.id?.toString() || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          formatDentistaId(dentista.id).toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      return true;
    });

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const toggleFiltro = () => {
    setIsFilterOpen(!isFilterOpen);
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
    navigate('/dentista/cadastro');
  };

  const handleRefresh = () => {
    setRefreshData(prev => prev + 1);
  };

  const handleExportar = () => {
    // Implemente a lógica para exportar os dentistas
  };

  const toggleExport = () => {
    setIsExportOpen(!isExportOpen);
    setIsFilterOpen(false); // Fechar o outro dropdown
  };

  const handleCloseExport = () => {
    setIsExportOpen(false);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedDentistas = React.useMemo(() => {
    let sortableDentistas = [...dentistasFiltrados];
    if (sortConfig.key) {
      sortableDentistas.sort((a, b) => {
        // Para ordenação de IDs (números)
        if (sortConfig.key === 'id') {
          return sortConfig.direction === 'ascending'
            ? a.id - b.id
            : b.id - a.id;
        }
        
        // Para ordenação de status (ATIVO/INATIVO)
        if (sortConfig.key === 'isActive') {
          const aValue = a.isActive === 'ATIVO' ? 1 : 0;
          const bValue = b.isActive === 'ATIVO' ? 1 : 0;
          return sortConfig.direction === 'ascending'
            ? aValue - bValue
            : bValue - aValue;
        }
        
        // Para ordenação de strings (nome)
        const aValue = String(a[sortConfig.key]).toLowerCase();
        const bValue = String(b[sortConfig.key]).toLowerCase();
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableDentistas;
  }, [dentistasFiltrados, sortConfig]);

  if (loading) {
    return <div className="loading">Carregando dentistas...</div>;
  }

  return (
    <div className="dentista-page">
      <div className="page-top">
        <div className="notification-container">
          <NotificationBell count={2} />
        </div>
      </div>
      
      {toastMessage && (
        <div className="toast-message">
          {toastMessage}
        </div>
      )}
      
      <div className="page-header">
        <h1 className="page-title">Dentistas</h1>
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
            data={sortedDentistas}
            headers={['ID', 'Nome', 'CRO', 'Email', 'Telefone', 'Status']}
            fields={['id', 'nome', 'cro', 'email', 'telefone', 'isActive']}
            filename="dentistas"
            isOpen={isExportOpen}
            toggleExport={toggleExport}
            onCloseDropdown={handleCloseExport}
          />
        </div>
      </div>
      
      <div className="search-container">
        <SearchBar
          placeholder="Buscar por ID, nome, CRO, e-mail ou telefone..."
          onSearch={handleSearch}
        />
        <ActionButton
          label="Novo"
          variant="primary"
          onClick={handleNovo}
        />
      </div>
      
      <div className="table-section">
        {searchQuery && dentistasFiltrados.length === 0 && (
          <div className="search-info">
            Nenhum dentista encontrado para a busca "{searchQuery}".
          </div>
        )}
        {!searchQuery && dentistasFiltrados.length === 0 && filtros.isActive !== 'todos' ? (
          <div className="filter-info">
            Nenhum dentista encontrado com os filtros aplicados.
          </div>
        ) : null}
        <DentistaTable 
          dentistas={sortedDentistas} 
          onDentistaDeleted={handleDentistaDeleted}
          onStatusChange={handleStatusChange}
          sortConfig={sortConfig}
          onSort={handleSort}
          isEmpty={!searchQuery && dentistasFiltrados.length === 0 && filtros.isActive === 'todos'}
        />
      </div>
    </div>
  );
};

export default DentistaPage; 