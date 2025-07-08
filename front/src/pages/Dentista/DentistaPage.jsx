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
import useToast from '../../hooks/useToast';

const DentistaPage = () => {
  const { notifications } = useNotifications();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [dentistas, setDentistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    isActive: 'ATIVO' // Mudança: filtro padrão é ATIVO
  });
  const [refreshData, setRefreshData] = useState(0);
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
      
      toast.success(successMessage);
      
      if (shouldRefresh) {
        setRefreshData(prev => prev + 1);
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
    // Apenas remove o dentista do estado local
    setDentistas(prevDentistas => 
      prevDentistas.filter(dentista => dentista.id !== dentistaId)
    );
    
    // Exibe sucesso direto sem navigate
    toast.success("Dentista excluído com sucesso!");
  };

  const handleStatusChange = async (dentistaId, newStatus) => {
    try {
      const isActive = newStatus === 'ATIVO';

      await toggleRecordStatus('dentistas', dentistaId, isActive);

      setDentistas(prevDentistas => 
        prevDentistas.map(dentista => 
          dentista.id === dentistaId 
            ? { ...dentista, isActive: isActive ? 'ATIVO' : 'INATIVO' } 
            : dentista
        )
      );
      
      const statusText = isActive ? 'ativado' : 'desativado';
      toast.success(`Dentista ${statusText} com sucesso!`);
      
      if (filtros.isActive === 'ATIVO' && !isActive) {
        loadDentistas();
      } else if (filtros.isActive === 'INATIVO' && isActive) {
        loadDentistas();
      }
      
    } catch (error) {
      console.error('❌ Erro ao alterar status do dentista:', error);
      toast.error('Erro ao alterar status do dentista');
    }
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
      isActive: 'ATIVO' // Volta ao padrão de mostrar apenas ativos
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
      
      
      
      <div className="page-header">
        <h1 className="page-title">Dentistas</h1>
        <div className="header-actions">
          <div className="filter-container" ref={filterRef}>
            <ActionButton 
              label="Filtrar" 
              icon="filter"
              onClick={toggleFiltro} 
              active={isFilterOpen || filtros.isActive !== 'ATIVO'}
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
        {!searchQuery && dentistasFiltrados.length === 0 && filtros.isActive !== 'ATIVO' ? (
          <div className="filter-info">
            Nenhum dentista {filtros.isActive === 'INATIVO' ? 'inativo' : ''} encontrado.
          </div>
        ) : null}
        <DentistaTable 
          dentistas={sortedDentistas} 
          onDentistaDeleted={handleDentistaDeleted}
          onStatusChange={handleStatusChange}
          sortConfig={sortConfig}
          onSort={handleSort}
          isEmpty={dentistasFiltrados.length === 0}
        />
      </div>
    </div>
  );
};

export default DentistaPage; 