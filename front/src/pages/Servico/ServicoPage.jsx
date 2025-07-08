import React, { useState, useEffect, useRef } from 'react';
import './ServicoPage.css';
import SearchBar from '../../components/SearchBar/SearchBar';
import ActionButton from '../../components/ActionButton/ActionButton';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import ExportDropdown from '../../components/ExportDropdown/ExportDropdown';
import ActionMenu from '../../components/ActionMenu/ActionMenu';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../axios-config';
import useToast from '../../hooks/useToast';
import ServicoTable from '../../components/ServicoTable/ServicoTable';
import useNotifications from '../../hooks/useNotifications';


// Função utilitária para formatar o ID
const formatServicoId = (id) => `S${String(id).padStart(4, '0')}`;

const ServicoPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [servicos, setServicos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    categoria: 'todas'
  });
  const [refreshData, setRefreshData] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  
  const filterRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, loading: notificationLoading, refreshNotifications } = useNotifications();
  const toast = useToast();

  useEffect(() => {
    const fetchServicos = async () => {
      setLoading(true);
      try {
        const response = await api.get('/servico');
        const servicosFormatados = response.data.map(servico => ({
          id: servico.id,
          nome: servico.nome,
          descricao: servico.descricao || '-',
          valor: servico.preco,
          valorTotal: servico.valorTotal,
          
          tempoPrevisto: servico.tempoPrevisto || '-',
          categoriaServico: servico.categoriaServico,
          isActive: servico.isActive ? 'ATIVO' : 'INATIVO'
        }));
        setServicos(servicosFormatados);
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        toast.error('Erro ao carregar serviços');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategorias = async () => {
      try {
        const response = await api.get('/categoria-servico');
        setCategorias(response.data);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };

    fetchServicos();
    fetchCategorias();
  }, [refreshData]);

  useEffect(() => {
    if (location.state && location.state.success) {
      const successMessage = location.state.success;
      const shouldRefresh = location.state.refresh;
      
      // Limpa o state imediatamente
      window.history.replaceState({}, document.title);
      
      // Exibe o toast
      toast.success(successMessage);
      
      // Se é necessário atualizar os dados
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

  const handleServicoDeleted = (servicoId) => {
    // Primeiro, remover o serviço do estado local para atualização imediata da UI
    setServicos(prevServicos => 
      prevServicos.filter(servico => servico.id !== servicoId)
    );
    
    // Forçar um refresh dos dados para sincronizar com o banco
    setRefreshData(prev => prev + 1);
    
    // Limpa qualquer estado de navegação existente
    window.history.replaceState({}, document.title);
    
    // Adicionamos uma mensagem de sucesso usando o padrão de state
    navigate('', { 
      state: { 
        success: "Serviço excluído com sucesso!",
        refresh: false
      },
      replace: true
    });
  };

  const handleStatusChange = async (servicoId, newStatus) => {
    try {
      const requestBody = newStatus === 'ATIVO' ? { isActive: true } : { isActive: false };
      
      const response = await api.patch(`/servico/${servicoId}`, requestBody);
      
      if (response.status === 200) {
        // Atualizar o status do serviço na lista
        setServicos(prevServicos =>
          prevServicos.map(servico =>
            servico.id === servicoId
              ? { ...servico, isActive: newStatus }
              : servico
          )
        );
        
        const statusText = newStatus === 'ATIVO' ? 'Ativo' : 'Inativo';
        toast.success(`Status alterado para ${statusText} com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao alterar status do serviço:', error);
      toast.error('Erro ao alterar status do serviço');
      // Recarregar dados em caso de erro
      setRefreshData(prev => prev + 1);
    }
  };

  const servicosFiltrados = servicos
    .filter(servico => {
      if (filtros.categoria !== 'todas' && String(servico.categoriaServico?.id) !== String(filtros.categoria)) {
        return false;
      }
      
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          formatServicoId(servico.id).toLowerCase().includes(searchLower) ||
          servico.nome?.toLowerCase().includes(searchLower) ||
          servico.descricao?.toLowerCase().includes(searchLower) ||
          servico.categoriaServico?.nome?.toLowerCase().includes(searchLower)
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
      categoria: 'todas'
    });
  };

  const handleNovo = () => {
    navigate('/servico/cadastro');
  };

  const handleRefresh = () => {
    setRefreshData(prev => prev + 1);
  };

  const handleExportar = () => {
    // Implemente a lógica para exportar os serviços
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

  const sortedServicos = React.useMemo(() => {
    let sortableServicos = [...servicosFiltrados];
    if (sortConfig.key) {
      sortableServicos.sort((a, b) => {
        // Para ordenação de IDs (números)
        if (sortConfig.key === 'id') {
          return sortConfig.direction === 'ascending'
            ? a.id - b.id
            : b.id - a.id;
        }
        
        // Para ordenação de Tempo Previsto (números)
        if (sortConfig.key === 'tempoPrevisto') {
          const aValue = parseInt(a.tempoPrevisto) || 0;
          const bValue = parseInt(b.tempoPrevisto) || 0;
          return sortConfig.direction === 'ascending'
            ? aValue - bValue
            : bValue - aValue;
        }
        
        // Para ordenação de status (ATIVO/INATIVO)
        if (sortConfig.key === 'isActive') {
          const aValue = a.isActive === 'ATIVO' ? 1 : 0;
          const bValue = b.isActive === 'ATIVO' ? 1 : 0;
          return sortConfig.direction === 'ascending'
            ? aValue - bValue
            : bValue - aValue;
        }
        
        // Para ordenação de strings (nome, descrição, categoria)
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
    return sortableServicos;
  }, [servicosFiltrados, sortConfig]);

  if (loading) {
    return <div className="loading">Carregando serviços...</div>;
  }

  return (
    <div className="servico-page">
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
        <h1 className="page-title">Serviços</h1>
        <div className="header-actions">
          <div className="filter-container" ref={filterRef}>
            <ActionButton 
              label="Filtrar" 
              icon="filter"
              onClick={toggleFiltro} 
              active={isFilterOpen || filtros.categoria !== 'todas'}
            />
            
            {isFilterOpen && (
              <div className="filter-dropdown">
                <h3>Filtros</h3>
                <div className="filter-group">
                  <label htmlFor="categoria">Categoria</label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={filtros.categoria}
                    onChange={handleFiltroChange}
                    className="filter-select"
                  >
                    <option value="todas">Todas</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                    ))}
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
            data={sortedServicos.map(servico => ({
              ...servico,
              categoriaServico: servico.categoriaServico?.nome || '-'
            }))}
            headers={['ID', 'Nome', 'Categoria', 'Valor Total', 'Tempo Previsto', 'Descrição']}
            fields={['id', 'nome', 'categoriaServico', 'valorTotal', 'tempoPrevisto', 'descricao']}
            filename="servicos"
            isOpen={isExportOpen}
            toggleExport={toggleExport}
            onCloseDropdown={handleCloseExport}
            title="Lista de Serviços"
            formatIdFn={formatServicoId}
          />
        </div>
      </div>
      
      <div className="search-container">
        <SearchBar
          placeholder="Buscar por ID, nome, categoria ou descrição..."
          onSearch={handleSearch}
        />
        <ActionButton
          label="Novo"
          variant="primary"
          onClick={handleNovo}
        />
      </div>
      
      <div className="table-section">
        {searchQuery && servicosFiltrados.length === 0 && (
          <div className="search-info">
            Nenhum serviço encontrado para a busca "{searchQuery}".
          </div>
        )}
        {!searchQuery && servicosFiltrados.length === 0 && filtros.categoria !== 'todas' ? (
          <div className="filter-info">
            Nenhum serviço encontrado com os filtros aplicados.
          </div>
        ) : null}
        
        <ServicoTable 
          servicos={sortedServicos} 
          onServicoDeleted={handleServicoDeleted}
          onStatusChange={handleStatusChange}
          sortConfig={sortConfig}
          onSort={handleSort}
          isEmpty={!searchQuery && servicosFiltrados.length === 0 && filtros.categoria === 'todas'}
        />
      </div>
    </div>
  );
};

export default ServicoPage; 