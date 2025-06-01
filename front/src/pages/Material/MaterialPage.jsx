import React, { useState, useEffect, useRef } from 'react';
import './MaterialPage.css';
import SearchBar from '../../components/SearchBar/SearchBar';
import ActionButton from '../../components/ActionButton/ActionButton';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import ExportDropdown from '../../components/ExportDropdown/ExportDropdown';
import MaterialTable from '../../components/MaterialTable/MaterialTable';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';

const MaterialPage = () => {
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
        const response = await axios.get('http://localhost:8080/categoria-material');
        setCategorias(response.data);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        toast.error('Erro ao carregar categorias para filtro.');
      }
    };

    fetchCategorias();
  }, []);
  
  // Função para buscar materiais da API
  const fetchMateriaisData = async (pageNum, pageSize) => {
    try {
      const response = await axios.get(`http://localhost:8080/material/paginado?page=${pageNum}&size=${pageSize}`);
      
      const responseData = response.data;
      const materiaisFormatados = responseData.content.map(material => {
        console.log('material recebido da API:', material);
        return {
          id: material.id,
          nome: material.nome,
          descricao: material.descricao || '-',
          quantidade: material.quantidade,
          unidadeMedida: material.unidadeMedida,
          valorUnitario: material.valorUnitario,
          categoriaMaterial: material.categoriaMaterial,
          status: material.status,
          isActive: material.isActive
        };
      });
      
      return {
        content: materiaisFormatados,
        totalElements: responseData.totalElements,
        last: responseData.last
      };
    } catch (error) {
      console.error('Não foi possível acessar a API:', error);
      toast.error('Erro ao buscar materiais. Por favor, tente novamente.');
      throw error;
    }
  };
  
  // Usar o hook de paginação infinita
  const {
    data: materiais,
    loading,
    loadingMore,
    lastElementRef: lastMaterialElementRef,
    refresh: refreshMateriais
  } = useInfiniteScroll(fetchMateriaisData);

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
          material.descricao?.toLowerCase().includes(searchLower) ||
          material.categoriaMaterial?.nome?.toLowerCase().includes(searchLower) ||
          (material.id?.toString() || '').toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });

  console.log('materiaisFiltrados:', materiaisFiltrados);

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
    console.log('Navegando para /material/cadastro');
    navigate('/material/cadastro');
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/material/${id}`);
      toast.success('Material excluído com sucesso!');
      refreshMateriais();
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      toast.error('Erro ao excluir material. Por favor, tente novamente.');
    }
  };

  const handleStatusChange = async (id, isActive) => {
    try {
      await axios.patch(`http://localhost:8080/material/${id}`, { isActive });
      refreshMateriais();
      setTimeout(() => {
        toast.success(`Material ${isActive ? 'Ativado' : 'Inativado'} com sucesso!`);
      }, 100);
    } catch (error) {
      console.error('Erro ao alterar status do material:', error);
      toast.error('Erro ao alterar status do material. Por favor, tente novamente.');
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
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="page-top">
        <div className="notification-container">
          <NotificationBell count={2} />
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
          />
        </div>
      </div>
      
      <div className="search-container">
        <SearchBar 
          placeholder="Buscar por nome, descrição ou tipo..." 
          onSearch={handleSearch} 
        />
        <ActionButton 
          label="Novo" 
          variant="primary"
          onClick={handleNovo}
        />
      </div>

      <div className="table-container">
        <MaterialTable 
          materiais={sortedMateriais}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          lastElementRef={lastMaterialElementRef}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
        
        {loadingMore && <div className="loading-more">Carregando mais materiais...</div>}
      </div>
    </div>
  );
};

export default MaterialPage; 