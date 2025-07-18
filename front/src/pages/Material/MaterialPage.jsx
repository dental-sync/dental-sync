import React, { useState, useEffect, useRef } from 'react';
import './MaterialPage.css';
import SearchBar from '../../components/SearchBar/SearchBar';
import ActionButton from '../../components/ActionButton/ActionButton';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import ExportDropdown from '../../components/ExportDropdown/ExportDropdown';
import MaterialTable from '../../components/MaterialTable/MaterialTable';
import { useNavigate } from 'react-router-dom';
import api from '../../axios-config';
import useToast from '../../hooks/useToast';
import useNotificationRefresh from '../../hooks/useNotificationRefresh';
import useNotifications from '../../hooks/useNotifications';

const MaterialPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    status: 'todos',
    tipo: 'todos'
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  
  const filterRef = useRef(null);
  const navigate = useNavigate();
  const { refreshAfterStockChange } = useNotificationRefresh();
  const { notifications, loading: notificationLoading, refreshNotifications } = useNotifications();
  const toast = useToast();
  
  // Função utilitária para formatar o ID
  const formatMaterialId = (id) => `M${String(id).padStart(4, '0')}`;
  
  // Buscar dados iniciais ao montar o componente
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriasResponse, materiaisResponse] = await Promise.all([
          api.get('/categoria-material'),
          api.get('/material')
        ]);
        
        setCategorias(categoriasResponse.data);
        setMateriais(materiaisResponse.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Função para atualizar a lista de materiais
  const refreshMateriais = async () => {
    try {
      const response = await api.get('/material');
      setMateriais(response.data);
    } catch (error) {
      console.error('Erro ao atualizar materiais:', error);
      toast.error('Erro ao carregar materiais');
    }
  };

  // Esconder dropdown de filtro ao clicar fora dele
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

  // Filtrar materiais conforme a busca e filtros aplicados
  const materiaisFiltrados = materiais
    .filter(material => {
      // Aplicar filtros de status
      if (filtros.status !== 'todos' && material.status !== filtros.status) {
        return false;
      }
      
      // Aplicar filtros de tipo
      if (filtros.tipo !== 'todos' && material.categoriaMaterial?.nome !== filtros.tipo) {
        return false;
      }
      
      // Aplicar busca textual
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          material.nome?.toLowerCase().includes(searchLower) ||
          material.categoriaMaterial?.nome?.toLowerCase().includes(searchLower) ||
          material.unidadeMedida?.toLowerCase().includes(searchLower) ||
          (material.id?.toString() || '').toLowerCase().includes(searchLower) ||
          formatMaterialId(material.id).toLowerCase().includes(searchLower)
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

  const toggleExport = () => {
    setIsExportOpen(!isExportOpen);
    setIsFilterOpen(false);
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
      status: 'todos',
      tipo: 'todos'
    });
  };

  const handleNovo = () => {
    navigate('/material/cadastro');
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/material/${id}`);
      toast.success('Material excluído com sucesso!');
      refreshMateriais();
      refreshAfterStockChange();
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      toast.error('Erro ao excluir material');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/material/${id}`, { isActive: !currentStatus });
      toast.success('Status alterado com sucesso!');
      refreshMateriais();
      refreshAfterStockChange();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedMateriais = React.useMemo(() => {
    let sortableMateriais = [...materiaisFiltrados];
    if (sortConfig.key) {
      sortableMateriais.sort((a, b) => {
        // Para ordenação de IDs (números)
        if (sortConfig.key === 'id') {
          return sortConfig.direction === 'ascending'
            ? a.id - b.id
            : b.id - a.id;
        }
        
        // Para ordenação de status
        if (sortConfig.key === 'status') {
          const statusOrder = {
            'EM_ESTOQUE': 0,
            'BAIXO_ESTOQUE': 1,
            'SEM_ESTOQUE': 2
          };
          const aValue = statusOrder[a.status] || 0;
          const bValue = statusOrder[b.status] || 0;
          return sortConfig.direction === 'ascending'
            ? aValue - bValue
            : bValue - aValue;
        }

        // Para ordenação de quantidade (números)
        if (sortConfig.key === 'quantidade') {
          return sortConfig.direction === 'ascending'
            ? a.quantidade - b.quantidade
            : b.quantidade - a.quantidade;
        }

        // Para ordenação de categoria (objeto aninhado)
        if (sortConfig.key === 'categoriaMaterial') {
          const aValue = a.categoriaMaterial?.nome || '';
          const bValue = b.categoriaMaterial?.nome || '';
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Para ordenação de preço (números)
        if (sortConfig.key === 'valorUnitario') {
          const aValue = Number(a.valorUnitario) || 0;
          const bValue = Number(b.valorUnitario) || 0;
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
    return sortableMateriais;
  }, [materiaisFiltrados, sortConfig]);

  if (loading) {
    return <div className="loading">Carregando materiais...</div>;
  }

  return (
    <div className="material-page">
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
        <h1 className="page-title">Materiais</h1>
        <div className="header-actions">
          <div className="filter-container" ref={filterRef}>
            <ActionButton 
              label="Filtrar" 
              icon="filter"
              onClick={toggleFiltro} 
              active={isFilterOpen || filtros.status !== 'todos' || filtros.tipo !== 'todos'}
            />
            
            {isFilterOpen && (
              <div className="filter-dropdown">
                <h3>Filtros</h3>
                
                <div className="filter-group">
                  <label htmlFor="status">Status</label>
                  <select 
                    id="status" 
                    name="status" 
                    value={filtros.status} 
                    onChange={handleFiltroChange}
                    className="filter-select"
                  >
                    <option value="todos">Todos</option>
                    <option value="EM_ESTOQUE">Em Estoque</option>
                    <option value="BAIXO_ESTOQUE">Baixo Estoque</option>
                    <option value="SEM_ESTOQUE">Sem Estoque</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label htmlFor="tipo">Categoria</label>
                  <select 
                    id="tipo" 
                    name="tipo" 
                    value={filtros.tipo} 
                    onChange={handleFiltroChange}
                    className="filter-select"
                  >
                    <option value="todos">Todas</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id} value={categoria.nome}>
                        {categoria.nome}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-actions">
                  <button onClick={handleLimparFiltros} className="clear-filter-button">
                    Limpar filtros
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <ExportDropdown 
            data={materiaisFiltrados.map(material => ({
              ...material,
              categoria: material.categoriaMaterial?.nome || 'N/A'
            }))}
            headers={['ID', 'Nome', 'Quantidade', 'Categoria', 'Status']}
            fields={['id', 'nome', 'quantidade', 'categoria', 'status']}
            filename="materiais"
            isOpen={isExportOpen}
            toggleExport={toggleExport}
            onCloseDropdown={handleCloseExport}
            title="Lista de Materiais"
            formatIdFn={formatMaterialId}
          />
        </div>
      </div>
      
      <div className="search-container">
        <SearchBar 
          placeholder="Buscar por ID, nome, categoria ou unidade..." 
          onSearch={handleSearch} 
        />
        <ActionButton 
          label="Novo" 
          variant="primary"
          onClick={handleNovo}
        />
      </div>

      <div className="table-container">
        {searchQuery && materiaisFiltrados.length === 0 && (
          <div className="search-info">
            Nenhum material encontrado para a busca "{searchQuery}".
          </div>
        )}
        {!searchQuery && materiaisFiltrados.length === 0 && (filtros.status !== 'todos' || filtros.tipo !== 'todos') ? (
          <div className="filter-info">
            Nenhum material encontrado com os filtros aplicados.
          </div>
        ) : null}
        
        <MaterialTable 
          materiais={sortedMateriais}
          onDelete={handleDelete}
          onStatusChange={handleToggleStatus}
          sortConfig={sortConfig}
          onSort={handleSort}
          hasFiltersApplied={filtros.status !== 'todos' || filtros.tipo !== 'todos' || searchQuery}
        />
      </div>
    </div>
  );
};

export default MaterialPage; 