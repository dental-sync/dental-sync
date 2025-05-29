import React, { useState, useEffect, useRef } from 'react';
import './ServicoPage.css';
import SearchBar from '../../components/SearchBar/SearchBar';
import ActionButton from '../../components/ActionButton/ActionButton';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import ExportDropdown from '../../components/ExportDropdown/ExportDropdown';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';

const ServicoPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
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
  
  // Buscar categorias ao montar o componente
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await axios.get('http://localhost:8080/categoria-servico');
        setCategorias(response.data);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        toast.error('Erro ao carregar categorias para filtro.');
      }
    };

    fetchCategorias();
  }, []);
  
  // Função para buscar serviços da API
  const fetchServicosData = async (pageNum, pageSize) => {
    try {
      const response = await axios.get(`http://localhost:8080/servico/paginado?page=${pageNum}&size=${pageSize}`);
      
      const responseData = response.data;
      const servicosFormatados = responseData.content.map(servico => ({
        id: servico.id,
        nome: servico.nome,
        descricao: servico.descricao || '-',
        valor: servico.valor,
        categoriaServico: servico.categoriaServico,
        status: servico.status,
        isActive: servico.isActive
      }));
      
      return {
        content: servicosFormatados,
        totalElements: responseData.totalElements,
        last: responseData.last
      };
    } catch (error) {
      console.error('Não foi possível acessar a API:', error);
      toast.error('Erro ao buscar serviços. Por favor, tente novamente.');
      throw error;
    }
  };
  
  // Usar o hook de paginação infinita
  const {
    data: servicos,
    loading,
    loadingMore,
    lastElementRef: lastServicoElementRef,
    refresh: refreshServicos
  } = useInfiniteScroll(fetchServicosData);

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

  // Filtrar serviços conforme a busca e filtros aplicados
  const servicosFiltrados = servicos
    .filter(servico => {
      // Aplicar filtros de status
      if (filtros.status !== 'todos' && servico.status !== filtros.status) {
        return false;
      }
      
      // Aplicar filtros de tipo
      if (filtros.tipo !== 'todos' && servico.categoriaServico?.nome !== filtros.tipo) {
        return false;
      }
      
      // Aplicar busca textual
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          servico.nome?.toLowerCase().includes(searchLower) ||
          servico.descricao?.toLowerCase().includes(searchLower) ||
          servico.categoriaServico?.nome?.toLowerCase().includes(searchLower) ||
          (servico.id?.toString() || '').toLowerCase().includes(searchLower)
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
    navigate('/servico/cadastro');
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/servico/${id}`);
      toast.success('Serviço excluído com sucesso!');
      refreshServicos();
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      toast.error('Erro ao excluir serviço. Por favor, tente novamente.');
    }
  };

  const handleStatusChange = async (id, isActive) => {
    try {
      await axios.patch(`http://localhost:8080/servico/${id}`, { isActive });
      refreshServicos();
      setTimeout(() => {
        toast.success(`Serviço ${isActive ? 'Ativado' : 'Inativado'} com sucesso!`);
      }, 100);
    } catch (error) {
      console.error('Erro ao alterar status do serviço:', error);
      toast.error('Erro ao alterar status do serviço. Por favor, tente novamente.');
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="servico-page">
      <ToastContainer />
      <div className="servico-header">
        <h1>Serviços</h1>
        <div className="servico-actions">
          <SearchBar onSearch={handleSearch} placeholder="Buscar serviços..." />
          <div className="servico-buttons">
            <ActionButton
              icon="filter"
              onClick={toggleFiltro}
              isActive={isFilterOpen}
              tooltip="Filtros"
            />
            <ActionButton
              icon="export"
              onClick={toggleExport}
              isActive={isExportOpen}
              tooltip="Exportar"
            />
            <ActionButton
              icon="plus"
              onClick={handleNovo}
              tooltip="Novo Serviço"
            />
            <NotificationBell />
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="filter-dropdown" ref={filterRef}>
          <div className="filter-section">
            <h3>Status</h3>
            <select
              name="status"
              value={filtros.status}
              onChange={handleFiltroChange}
            >
              <option value="todos">Todos</option>
              <option value="ATIVO">Ativos</option>
              <option value="INATIVO">Inativos</option>
            </select>
          </div>
          <div className="filter-section">
            <h3>Categoria</h3>
            <select
              name="tipo"
              value={filtros.tipo}
              onChange={handleFiltroChange}
            >
              <option value="todos">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.nome}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>
          <button className="clear-filters" onClick={handleLimparFiltros}>
            Limpar Filtros
          </button>
        </div>
      )}

      {isExportOpen && (
        <ExportDropdown
          onClose={handleCloseExport}
          data={servicosFiltrados}
          filename="servicos"
          columns={[
            { header: 'ID', accessor: 'id' },
            { header: 'Nome', accessor: 'nome' },
            { header: 'Descrição', accessor: 'descricao' },
            { header: 'Valor', accessor: 'valor' },
            { header: 'Categoria', accessor: 'categoriaServico.nome' },
            { header: 'Status', accessor: 'status' }
          ]}
        />
      )}

      <div className="servico-table-container">
        <table className="servico-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>
                ID {sortConfig.key === 'id' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('nome')}>
                Nome {sortConfig.key === 'nome' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('descricao')}>
                Descrição {sortConfig.key === 'descricao' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('valor')}>
                Valor {sortConfig.key === 'valor' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('categoriaServico.nome')}>
                Categoria {sortConfig.key === 'categoriaServico.nome' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('status')}>
                Status {sortConfig.key === 'status' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicosFiltrados.map((servico, index) => (
              <tr
                key={servico.id}
                ref={index === servicosFiltrados.length - 1 ? lastServicoElementRef : null}
              >
                <td>{servico.id}</td>
                <td>{servico.nome}</td>
                <td>{servico.descricao}</td>
                <td>R$ {servico.valor?.toFixed(2)}</td>
                <td>{servico.categoriaServico?.nome || '-'}</td>
                <td>
                  <span className={`status-badge ${servico.status?.toLowerCase()}`}>
                    {servico.status}
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
                      onClick={() => handleDelete(servico.id)}
                      title="Excluir"
                    >
                      🗑️
                    </button>
                    <button
                      className="action-button status"
                      onClick={() => handleStatusChange(servico.id, !servico.isActive)}
                      title={servico.isActive ? 'Inativar' : 'Ativar'}
                    >
                      {servico.isActive ? '🔴' : '🟢'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="loading">Carregando...</div>}
        {loadingMore && <div className="loading-more">Carregando mais...</div>}
      </div>
    </div>
  );
};

export default ServicoPage; 