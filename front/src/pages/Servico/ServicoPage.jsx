import React, { useState, useEffect, useRef } from 'react';
import './ServicoPage.css';
import SearchBar from '../../components/SearchBar/SearchBar';
import ActionButton from '../../components/ActionButton/ActionButton';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import ExportDropdown from '../../components/ExportDropdown/ExportDropdown';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ServicoPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [servicos, setServicos] = useState([]);
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
    const fetchServicos = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/servico');
        const servicosFormatados = response.data.map(servico => ({
          id: servico.id,
          nome: servico.nome,
          descricao: servico.descricao || '-',
          valor: servico.valor,
          categoriaServico: servico.categoriaServico,
          isActive: servico.isActive ? 'ATIVO' : 'INATIVO'
        }));
        setServicos(servicosFormatados);
      } catch (err) {
        console.error('Erro ao buscar serviços:', err);
        setServicos([]);
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

    fetchServicos();
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

  const handleStatusChange = (servicoId, newStatus) => {
    // Encontrar o serviço atual
    const servicoAtual = servicos.find(s => s.id === servicoId);
    
    // Verificar se o status está realmente mudando
    const statusAtual = servicoAtual.isActive === 'ATIVO';
    if (statusAtual === (newStatus === 'ATIVO')) {
      return; // Não faz nada se o status for o mesmo
    }

    // Atualizar o status do serviço na lista
    if (newStatus !== null) {
      setServicos(prevServicos =>
        prevServicos.map(servico =>
          servico.id === servicoId
            ? { ...servico, isActive: newStatus }
            : servico
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
          refresh: false
        },
        replace: true
      });
    }
  };

  // Função utilitária para formatar o ID
  const formatServicoId = (id) => `S${String(id).padStart(4, '0')}`;

  const servicosFiltrados = servicos
    .filter(servico => {
      if (filtros.isActive !== 'todos' && servico.isActive !== filtros.isActive) {
        return false;
      }
      
      if (searchQuery) {
        return (
          servico.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          servico.descricao?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          servico.categoriaServico?.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (servico.valor?.toString() || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (servico.id?.toString() || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          formatServicoId(servico.id).toLowerCase().includes(searchQuery.toLowerCase())
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
          <NotificationBell count={2} />
        </div>
      </div>
      
      {toastMessage && (
        <div className="toast-message">
          {toastMessage}
        </div>
      )}
      
      <div className="page-header">
        <h1 className="page-title">Serviços</h1>
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
            data={sortedServicos}
            headers={['ID', 'Nome', 'Descrição', 'Valor', 'Categoria', 'Status']}
            fields={['id', 'nome', 'descricao', 'valor', 'categoriaServico.nome', 'isActive']}
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
          placeholder="Buscar por ID, nome, descrição, categoria ou valor..."
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
        {!searchQuery && servicosFiltrados.length === 0 && filtros.isActive !== 'todos' ? (
          <div className="filter-info">
            Nenhum serviço encontrado com os filtros aplicados.
          </div>
        ) : null}
        
        <table className="servico-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} data-sortable="true">
                ID {sortConfig.key === 'id' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('nome')} data-sortable="true">
                Nome {sortConfig.key === 'nome' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('descricao')} data-sortable="true">
                Descrição {sortConfig.key === 'descricao' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('valor')} data-sortable="true">
                Valor {sortConfig.key === 'valor' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('categoriaServico.nome')} data-sortable="true">
                Categoria {sortConfig.key === 'categoriaServico.nome' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('isActive')} data-sortable="true">
                Status {sortConfig.key === 'isActive' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedServicos.map((servico) => (
              <tr key={servico.id}>
                <td>{formatServicoId(servico.id)}</td>
                <td>{servico.nome}</td>
                <td>{servico.descricao}</td>
                <td>R$ {servico.valor?.toFixed(2)}</td>
                <td>{servico.categoriaServico?.nome || '-'}</td>
                <td>
                  <span className={`status-badge ${servico.isActive?.toLowerCase()}`}>
                    {servico.isActive}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-button edit"
                      onClick={() => navigate(`/servico/editar/${servico.id}`)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => handleServicoDeleted(servico.id)}
                      title="Excluir"
                    >
                      🗑️
                    </button>
                    <button
                      className="action-button status"
                      onClick={() => handleStatusChange(servico.id, servico.isActive === 'ATIVO' ? 'INATIVO' : 'ATIVO')}
                      title={servico.isActive === 'ATIVO' ? 'Inativar' : 'Ativar'}
                    >
                      {servico.isActive === 'ATIVO' ? '🔴' : '🟢'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!searchQuery && servicosFiltrados.length === 0 && filtros.isActive === 'todos' && (
          <div className="empty-table-message">
            Nenhum serviço cadastrado.
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicoPage; 