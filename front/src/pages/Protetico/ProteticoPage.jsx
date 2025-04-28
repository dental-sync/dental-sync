import React, { useState, useEffect, useRef } from 'react';
import './ProteticoPage.css';
import SearchBar from '../../components/SearchBar/SearchBar';
import ActionButton from '../../components/ActionButton/ActionButton';
import ProteticoTable from '../../components/ProteticoTable/ProteticoTable';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProteticoPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [proteticos, setProteticos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    status: 'todos',
    cargo: 'todos'
  });
  const [refreshFlag, setRefreshFlag] = useState(0);

  const filterRef = useRef(null);
  const navigate = useNavigate();
  
  // Buscar lista de protéticos da API
  useEffect(() => {
    const fetchProteticos = async () => {
      try {
        setLoading(true);
        
        try {
          const response = await axios.get('http://localhost:8080/proteticos');
          
          // Se a chamada for bem-sucedida, usar os dados da API
          const proteticosFormatados = response.data.map(protetico => ({
            id: protetico.id,
            nome: protetico.nome,
            cro: protetico.cro,
            cargo: protetico.isAdmin ? 'Admin' : 'Técnico',
            telefone: protetico.telefone || '-',
            status: protetico.isActive ? 'ATIVO' : 'INATIVO'
          }));
          
          setProteticos(proteticosFormatados);
        } catch (apiErr) {
          console.error('Não foi possível acessar a API:', apiErr);
          // Inicializar com array vazio em caso de erro
          setProteticos([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar protéticos:', err);
        setProteticos([]);
        setLoading(false);
      }
    };
    
    fetchProteticos();
  }, [refreshFlag]);

  // Esconder o filtro ao clicar fora dele
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

  const handleExportar = () => {
    console.log('Exportando dados...');
    // Implementação futura: exportação para CSV ou PDF
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
          
          <ActionButton 
            label="Exportar" 
            icon="export"
            onClick={handleExportar} 
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
        />
      </div>
    </div>
  );
};

export default ProteticoPage; 