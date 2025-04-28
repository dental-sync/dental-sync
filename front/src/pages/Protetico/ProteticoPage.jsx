import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ProteticoPage.css';
import SearchBar from '../../components/SearchBar/SearchBar';
import ActionButton from '../../components/ActionButton/ActionButton';
import ProteticoTable from '../../components/ProteticoTable/ProteticoTable';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import ExportDropdown from '../../components/ExportDropdown/ExportDropdown';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProteticoPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [proteticos, setProteticos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    status: 'todos',
    cargo: 'todos'
  });
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  const observer = useRef();
  const filterRef = useRef(null);
  const navigate = useNavigate();
  
  // Callback para elemento de observação do scroll
  const lastProteticoElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreProteticos();
      }
    }, { threshold: 0.8 });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);
  
  // Função para carregar mais protéticos (próxima página)
  const loadMoreProteticos = async () => {
    if (!hasMore || loadingMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      await fetchProteticos(nextPage);
      setPage(nextPage);
    } catch (err) {
      console.error('Erro ao carregar mais protéticos:', err);
      toast.error('Não foi possível carregar mais protéticos.');
    } finally {
      setLoadingMore(false);
    }
  };
  
  // Buscar lista de protéticos da API de forma paginada
  const fetchProteticos = async (pageNum = 0) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
        setProteticos([]);
      }
      
      try {
        const response = await axios.get(`http://localhost:8080/proteticos/paginado?page=${pageNum}&size=${pageSize}`);
        
        // Se a chamada for bem-sucedida, usar os dados da API
        const responseData = response.data;
        const proteticosFormatados = responseData.content.map(protetico => ({
          id: protetico.id,
          nome: protetico.nome,
          cro: protetico.cro,
          cargo: protetico.isAdmin ? 'Admin' : 'Técnico',
          telefone: protetico.telefone || '-',
          status: protetico.isActive ? 'ATIVO' : 'INATIVO'
        }));
        
        // Atualizar lista de protéticos (adicionar à lista existente se não for a primeira página)
        setProteticos(prev => pageNum === 0 ? proteticosFormatados : [...prev, ...proteticosFormatados]);
        
        // Atualizar informações de paginação
        setTotalElements(responseData.totalElements);
        setHasMore(!responseData.last);
      } catch (apiErr) {
        console.error('Não foi possível acessar a API:', apiErr);
        if (pageNum === 0) {
          // Inicializar com array vazio em caso de erro na primeira página
          setProteticos([]);
        }
        toast.error('Erro ao buscar protéticos. Por favor, tente novamente.');
      }
      
      if (pageNum === 0) {
        setLoading(false);
      }
    } catch (err) {
      console.error('Erro ao buscar protéticos:', err);
      if (pageNum === 0) {
        setProteticos([]);
        setLoading(false);
      }
    }
  };
  
  // Efeito para carregar a primeira página
  useEffect(() => {
    setPage(0);
    fetchProteticos(0);
  }, [refreshFlag]);

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

  // Filtrar protéticos conforme a busca e filtros aplicados
  const proteticosFiltrados = proteticos
    .filter(protetico => {
      // Aplicar filtros de status
      if (filtros.status !== 'todos' && protetico.status !== filtros.status) {
        return false;
      }
      
      // Aplicar filtros de cargo
      if (filtros.cargo !== 'todos' && protetico.cargo !== filtros.cargo) {
        return false;
      }
      
      // Aplicar busca textual
      if (searchQuery) {
        return (
          protetico.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          protetico.cro?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (protetico.id?.toString() || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      return true;
    });

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const toggleFiltro = () => {
    setIsFilterOpen(!isFilterOpen);
    setIsExportOpen(false); // Fechar o outro dropdown
  };

  const toggleExport = () => {
    setIsExportOpen(!isExportOpen);
    setIsFilterOpen(false); // Fechar o outro dropdown
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
      cargo: 'todos'
    });
  };

  const handleNovo = () => {
    navigate('/protetico/cadastro');
  };

  // Função para forçar atualização da listagem
  const handleStatusChange = () => {
    setRefreshFlag(prev => prev + 1);
  };

  if (loading) {
    return <div className="loading">Carregando protéticos...</div>;
  }

  return (
    <div className="protetico-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="page-top">
        <div className="notification-container">
          <NotificationBell count={2} />
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
              active={isFilterOpen || filtros.status !== 'todos' || filtros.cargo !== 'todos'}
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
                  <button onClick={handleLimparFiltros} className="clear-filter-button">
                    Limpar filtros
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <ExportDropdown 
            data={proteticosFiltrados}
            headers={['ID', 'Nome', 'CRO', 'Cargo', 'Telefone', 'Status']}
            fields={['id', 'nome', 'cro', 'cargo', 'telefone', 'status']}
            filename="proteticos"
            isOpen={isExportOpen}
            toggleExport={toggleExport}
            onCloseDropdown={handleCloseExport}
          />
        </div>
      </div>
      
      <div className="search-container">
        <SearchBar 
          placeholder="Buscar por ID, nome ou CRO..." 
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
        {!searchQuery && proteticosFiltrados.length === 0 && filtros.status !== 'todos' || filtros.cargo !== 'todos' ? (
          <div className="filter-info">
            Nenhum protético encontrado com os filtros aplicados.
          </div>
        ) : null}
        <ProteticoTable 
          proteticos={proteticosFiltrados} 
          onStatusChange={handleStatusChange}
          lastProteticoRef={lastProteticoElementRef}
        />
        {loadingMore && (
          <div className="loading-more">Carregando mais protéticos...</div>
        )}
      </div>
    </div>
  );
};

export default ProteticoPage; 