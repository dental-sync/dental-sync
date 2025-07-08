import React, { useState, useEffect, useRef } from 'react';
import './ProteticoPage.css';
import SearchBar from '../../components/SearchBar/SearchBar';
import ActionButton from '../../components/ActionButton/ActionButton';
import ProteticoTable from '../../components/ProteticoTable/ProteticoTable';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import useNotifications from '../../hooks/useNotifications';
import useInactiveFilter from '../../hooks/useInactiveFilter';
import ExportDropdown from '../../components/ExportDropdown/ExportDropdown';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../axios-config';
import useToast from '../../hooks/useToast';

const ProteticoPage = () => {
  const { notifications } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [proteticos, setProteticos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    isActive: 'ATIVO',
    cargo: 'todos'
  });
  const [refreshData, setRefreshData] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  const filterRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  const {
    loading: filterLoading,
    error: filterError,
    fetchActiveProteticos,
    fetchInactiveProteticos,
    fetchAllProteticos,
    toggleRecordStatus
  } = useInactiveFilter();
  
  const loadProteticos = async () => {
    setLoading(true);
    try {
      let proteticosData = [];
      
      switch (filtros.isActive) {
        case 'ATIVO':
          proteticosData = await fetchActiveProteticos();
          break;
        case 'INATIVO':
          proteticosData = await fetchInactiveProteticos();
          break;
        case 'todos':
        default:
          proteticosData = await fetchAllProteticos();
          break;
      }
      
      const proteticosFormatados = proteticosData.map(protetico => ({
        id: protetico.id,
        nome: protetico.nome,
        cro: protetico.cro,
        cargo: protetico.isAdmin ? 'Admin' : 'Protetico',
        telefone: protetico.telefone || '-',
        email: protetico.email || '-',
        isActive: protetico.isActive ? 'ATIVO' : 'INATIVO'
      }));
      
      setProteticos(proteticosFormatados);
    } catch (err) {
      console.error('Erro ao buscar protéticos:', err);
      setProteticos([]);
      setError('Não foi possível carregar os dados do servidor. Tente novamente mais tarde.');
      toast.error('Não foi possível carregar os dados do servidor. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProteticos();
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
  }, [location, toast]);

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

  const handleProteticoDeleted = (proteticoId) => {
    setProteticos(prevProteticos => 
      prevProteticos.filter(protetico => protetico.id !== proteticoId)
    );
    
    setRefreshData(prev => prev + 1);
    
    window.history.replaceState({}, document.title);
    
    navigate('', { 
      state: { 
        success: "Protético excluído com sucesso!",
        refresh: false
      },
      replace: true
    });
  };

  const handleStatusChange = async (proteticoId, newStatus) => {
    try {
      console.log('🔄 Iniciando mudança de status - ID:', proteticoId, 'Status:', newStatus);
      
      // Determinar o novo status como boolean
      const isActive = newStatus === 'ATIVO' || newStatus === true;
      
      console.log('📝 Convertendo status para boolean:', isActive);
      
      // Usar o hook para alternar o status
      await toggleRecordStatus('proteticos', proteticoId, isActive);
      
      // Atualizar o status do protético no estado local
      setProteticos(prevProteticos => 
        prevProteticos.map(protetico => 
          protetico.id === proteticoId 
            ? { ...protetico, isActive: isActive ? 'ATIVO' : 'INATIVO' } 
            : protetico
        )
      );
      
      // Exibir mensagem de sucesso
      const statusText = isActive ? 'ativado' : 'desativado';
      toast.success(`Protético ${statusText} com sucesso!`);
      
      // Recarregar dados se necessário para manter consistência
      if (filtros.isActive === 'ATIVO' && !isActive) {
        // Se estava mostrando apenas ativos e desativou um, recarregar para removê-lo da vista
        loadProteticos();
      } else if (filtros.isActive === 'INATIVO' && isActive) {
        // Se estava mostrando apenas inativos e ativou um, recarregar para removê-lo da vista
        loadProteticos();
      }
      
      console.log('✅ Mudança de status concluída com sucesso');
    } catch (error) {
      console.error('❌ Erro ao alterar status do protético:', error);
      toast.error('Erro ao alterar status do protético');
    }
  };

  const formatProteticoId = (id) => `PT${String(id).padStart(4, '0')}`;

  // Filtrar apenas por cargo e busca de texto, já que o filtro de status é feito no backend
  const proteticosFiltrados = proteticos
    .filter(protetico => {
      if (filtros.cargo !== 'todos' && protetico.cargo !== filtros.cargo) {
        return false;
      }
      
      if (searchQuery) {
        return (
          protetico.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          protetico.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          protetico.telefone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          protetico.cro?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (protetico.id?.toString() || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          formatProteticoId(protetico.id).toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      return true;
    });

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const toggleFiltro = () => {
    setIsFilterOpen(!isFilterOpen);
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
      isActive: 'ATIVO', // Volta ao padrão de mostrar apenas ativos
      cargo: 'todos'
    });
  };

  const handleNovo = () => {
    navigate('/protetico/cadastro');
  };

  const handleRefresh = () => {
    setRefreshData(prev => prev + 1);
  };

  const handleExportar = () => {
    // Implemente a lógica para exportar os protéticos
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

  const sortedProteticos = React.useMemo(() => {
    let sortableProteticos = [...proteticosFiltrados];
    if (sortConfig.key) {
      sortableProteticos.sort((a, b) => {
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
    return sortableProteticos;
  }, [proteticosFiltrados, sortConfig]);

  if (loading) {
    return <div className="loading">Carregando protéticos...</div>;
  }

  return (
    <div className="protetico-page">
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
        <h1 className="page-title">Protéticos</h1>
        <div className="header-actions">
          <div className="filter-container" ref={filterRef}>
            <ActionButton 
              label="Filtrar" 
              icon="filter"
              onClick={toggleFiltro} 
              active={isFilterOpen || filtros.isActive !== 'ATIVO' || filtros.cargo !== 'todos'}
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
                
                <div className="filter-group">
                  <label htmlFor="cargo">Cargo</label>
                  <select 
                    id="cargo" 
                    name="cargo" 
                    value={filtros.cargo} 
                    onChange={handleFiltroChange}
                    className="filter-select"
                  >
                    <option value="todos">Todos</option>
                    <option value="Admin">Admin</option>
                    <option value="Protetico">Protetico</option>
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
            data={sortedProteticos}
            headers={['ID', 'Nome', 'CRO', 'Cargo', 'Email', 'Telefone', 'Status']}
            fields={['id', 'nome', 'cro', 'cargo', 'email', 'telefone', 'isActive']}
            filename="proteticos"
            isOpen={isExportOpen}
            toggleExport={toggleExport}
            onCloseDropdown={handleCloseExport}
            title="Lista de Protéticos"
            formatIdFn={formatProteticoId}
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
        {searchQuery && proteticosFiltrados.length === 0 && (
          <div className="search-info">
            Nenhum protético encontrado para a busca "{searchQuery}".
          </div>
        )}
        {!searchQuery && proteticosFiltrados.length === 0 && (filtros.isActive !== 'todos' || filtros.cargo !== 'todos') ? (
          <div className="filter-info">
            Nenhum protético encontrado com os filtros aplicados.
          </div>
        ) : null}
        <ProteticoTable 
          proteticos={sortedProteticos} 
          onProteticoDeleted={handleProteticoDeleted}
          onStatusChange={handleStatusChange}
          sortConfig={sortConfig}
          onSort={handleSort}
          isEmpty={!searchQuery && proteticosFiltrados.length === 0 && filtros.isActive === 'todos' && filtros.cargo === 'todos'}
        />
      </div>
    </div>
  );
};

export default ProteticoPage; 