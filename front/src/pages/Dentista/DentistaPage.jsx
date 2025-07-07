import React, { useState, useEffect, useRef } from 'react';
import './DentistaPage.css';
import SearchBar from '../../components/SearchBar/SearchBar';
import ActionButton from '../../components/ActionButton/ActionButton';
import DentistaTable from '../../components/DentistaTable/DentistaTable';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import useNotifications from '../../hooks/useNotifications';
import useInactiveFilter from '../../hooks/useInactiveFilter';
import ExportDropdown from '../../components/ExportDropdown/ExportDropdown';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../axios-config';
import { toast } from 'react-toastify';

const DentistaPage = () => {
  const { notifications } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [dentistas, setDentistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    isActive: 'ATIVO'
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
  
  const {
    loading: filterLoading,
    error: filterError,
    fetchActiveDentistas,
    fetchInactiveDentistas,
    fetchAllDentistas,
    toggleRecordStatus
  } = useInactiveFilter();
  
  const recentMessages = useRef(new Set());

  const loadDentistas = async () => {
    setLoading(true);
    try {
      let dentistasData = [];
      
      switch (filtros.isActive) {
        case 'ATIVO':
          dentistasData = await fetchActiveDentistas();
          break;
        case 'INATIVO':
          dentistasData = await fetchInactiveDentistas();
          break;
        case 'todos':
        default:
          dentistasData = await fetchAllDentistas();
          break;
      }
      
      const dentistasFormatados = dentistasData.map(dentista => ({
        id: dentista.id,
        nome: dentista.nome,
        cro: dentista.cro,
        telefone: dentista.telefone || '-',
        email: dentista.email || '-',
        isActive: dentista.isActive ? 'ATIVO' : 'INATIVO'
      }));
      
      setDentistas(dentistasFormatados);
    } catch (error) {
      console.error('Erro ao buscar dentistas:', error);
      toast.error('Erro ao carregar dentistas');
      setError('Erro ao carregar dentistas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDentistas();
  }, [refreshData, filtros.isActive]);

  useEffect(() => {
    if (location.state && location.state.success) {
      const successMessage = location.state.success;
      const shouldRefresh = location.state.refresh;
      
      window.history.replaceState({}, document.title);
      
      const messageKey = `${successMessage}-${Date.now()}`;
      
      if (!recentMessages.current.has(messageKey)) {
        recentMessages.current.add(messageKey);
        
        toast.success(successMessage, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          toastId: successMessage
        });
        
        setTimeout(() => {
          recentMessages.current.delete(messageKey);
        }, 3000);
        
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
    setDentistas(prevDentistas => 
      prevDentistas.filter(dentista => dentista.id !== dentistaId)
    );
    
    setRefreshData(prev => prev + 1);
    
    window.history.replaceState({}, document.title);
    
    navigate('', { 
      state: { 
        success: "Dentista excluído com sucesso!",
        refresh: false
      },
      replace: true
    });
  };

  const handleStatusChange = (dentistaId, newStatus) => {
    const dentistaAtual = dentistas.find(d => d.id === dentistaId);
    
    if (!dentistaAtual) {
      console.error('Dentista não encontrado:', dentistaId);
      return;
    }
    
    const statusAtual = dentistaAtual.isActive;
    
    if (statusAtual === newStatus) {
      return;
    }

    const dentistasAtualizados = dentistas.map(dentista =>
      dentista.id === dentistaId
        ? { ...dentista, isActive: newStatus }
        : dentista
    );
    
    setDentistas(dentistasAtualizados);
    
    setRefreshData(prev => prev + 1);
    
    const statusText = newStatus === 'ATIVO' ? 'Ativo' : 'Inativo';
    
    window.history.replaceState({}, document.title);
    
    navigate('', { 
      state: { 
        success: `Status atualizado com sucesso para ${statusText}`,
        refresh: false
      },
      replace: true
    });
  };

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
    setIsFilterOpen(false);
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
        if (sortConfig.key === 'id') {
          return sortConfig.direction === 'ascending'
            ? a.id - b.id
            : b.id - a.id;
        }
        
        if (sortConfig.key === 'isActive') {
          const aValue = a.isActive === 'ATIVO' ? 1 : 0;
          const bValue = b.isActive === 'ATIVO' ? 1 : 0;
          return sortConfig.direction === 'ascending'
            ? aValue - bValue
            : bValue - aValue;
        }
        
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
            <NotificationBell 
            count={notifications.total}
            baixoEstoque={notifications.baixoEstoque}
            semEstoque={notifications.semEstoque}
            materiaisBaixoEstoque={notifications.materiaisBaixoEstoque}
            materiaisSemEstoque={notifications.materiaisSemEstoque}
          />
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
            title="Lista de Dentistas"
            formatIdFn={formatDentistaId}
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