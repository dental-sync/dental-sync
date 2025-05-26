import React, { useState, useEffect, useRef } from 'react';
import './ProteticoPage.css';
import SearchBar from '../../components/SearchBar/SearchBar';
import ActionButton from '../../components/ActionButton/ActionButton';
import ProteticoTable from '../../components/ProteticoTable/ProteticoTable';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import ExportDropdown from '../../components/ExportDropdown/ExportDropdown';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProteticoPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [proteticos, setProteticos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    isActive: 'todos',
    cargo: 'todos'
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
    const fetchProteticos = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/proteticos');
        const proteticosFormatados = response.data.map(protetico => ({
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

    fetchProteticos();
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

  const handleProteticoDeleted = (proteticoId) => {
    // Primeiro, remover o protético do estado local para atualização imediata da UI
    setProteticos(prevProteticos => 
      prevProteticos.filter(protetico => protetico.id !== proteticoId)
    );
    
    // Forçar um refresh dos dados para sincronizar com o banco
    setRefreshData(prev => prev + 1);
    
    // Limpa qualquer estado de navegação existente
    window.history.replaceState({}, document.title);
    
    // Adicionamos uma mensagem de sucesso usando o padrão de state
    navigate('', { 
      state: { 
        success: "Protético excluído com sucesso!",
        refresh: false // Não precisamos de refresh pois já fizemos acima
      },
      replace: true // Importante usar replace para não adicionar nova entrada no histórico
    });
  };

  const handleStatusChange = (proteticoId, newStatus) => {
    // Encontrar o protético atual
    const proteticoAtual = proteticos.find(d => d.id === proteticoId);
    
    // Verificar se o status está realmente mudando
    const statusAtual = proteticoAtual.isActive === 'ATIVO';
    if (statusAtual === (newStatus === 'ATIVO')) {
      return; // Não faz nada se o status for o mesmo
    }

    // Atualizar o status do protético na lista
    if (newStatus !== null) {
      setProteticos(prevProteticos =>
        prevProteticos.map(protetico =>
          protetico.id === proteticoId
            ? { ...protetico, isActive: newStatus }
            : protetico
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
  const formatProteticoId = (id) => `PT${String(id).padStart(4, '0')}`;

  const proteticosFiltrados = proteticos
    .filter(protetico => {
      if (filtros.isActive !== 'todos' && protetico.isActive !== filtros.isActive) {
        return false;
      }
      
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
    setIsExportOpen(false); // Fechar o outro dropdown
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
      isActive: 'todos',
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

  const sortedProteticos = React.useMemo(() => {
    let sortableProteticos = [...proteticosFiltrados];
    if (sortConfig.key) {
      sortableProteticos.sort((a, b) => {
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
    return sortableProteticos;
  }, [proteticosFiltrados, sortConfig]);

  if (loading) {
    return <div className="loading">Carregando protéticos...</div>;
  }

  return (
    <div className="protetico-page">
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
        <h1 className="page-title">Protéticos</h1>
        <div className="header-actions">
          <div className="filter-container" ref={filterRef}>
            <ActionButton 
              label="Filtrar" 
              icon="filter"
              onClick={toggleFiltro} 
              active={isFilterOpen || filtros.isActive !== 'todos' || filtros.cargo !== 'todos'}
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