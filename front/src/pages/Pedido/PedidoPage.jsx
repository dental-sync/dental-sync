import React, { useState, useEffect, useRef } from 'react';
import './PedidoPage.css';
import SearchBar from '../../components/SearchBar/SearchBar';
import ActionButton from '../../components/ActionButton/ActionButton';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import ExportDropdown from '../../components/ExportDropdown/ExportDropdown';
import PedidoTable from '../../components/PedidoTable/PedidoTable';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../axios-config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';

const PedidoPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [dentistas, setDentistas] = useState([]);
  const [proteticos, setProteticos] = useState([]);
  const [filtros, setFiltros] = useState({
    dentista: 'todos',
    protetico: 'todos',
    prioridade: 'todos',
    dataEntrega: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const filterRef = useRef(null);
  const navigate = useNavigate();
  
  // Buscar dentistas e protéticos ao montar o componente
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [dentistasResponse, proteticosResponse] = await Promise.all([
          api.get('/dentistas'),
          api.get('/proteticos')
        ]);
        
        setDentistas(dentistasResponse.data);
        setProteticos(proteticosResponse.data);
      } catch (error) {
        console.error('Erro ao buscar dados de referência:', error);
        toast.error('Erro ao carregar dados para filtro.');
      }
    };

    fetchReferenceData();
  }, []);
  
  // Buscar todos os pedidos ao montar o componente
  useEffect(() => {
    const fetchPedidos = async () => {
      setLoading(true);
      try {
        const response = await api.get('/pedidos');
        const pedidosFormatados = response.data.map(pedido => ({
          id: pedido.id,
          paciente: pedido.cliente,
          dentista: pedido.dentista,
          protetico: pedido.protetico,
          servicos: pedido.servicos,
          dataEntrega: pedido.dataEntrega,
          createdAt: pedido.createdAt || pedido.created_at,
          prioridade: pedido.prioridade,
          odontograma: pedido.odontograma,
          observacao: pedido.observacao,
          status: pedido.status,
          valorTotal: Array.isArray(pedido.servicos) ? pedido.servicos.reduce((acc, s) => acc + (s.valorTotal || s.preco || 0), 0) : 0
        }));
        console.log('[LOG] pedidosFormatados:', pedidosFormatados);
        setPedidos(pedidosFormatados);
      } catch (error) {
        console.error('Não foi possível acessar a API:', error);
        toast.error('Erro ao buscar pedidos. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);
  
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

  // Filtrar pedidos conforme a busca e filtros aplicados
  const pedidosFiltrados = pedidos
    .filter(pedido => {
      // Aplicar filtro de dentista
      if (filtros.dentista !== 'todos' && pedido.dentista?.id !== parseInt(filtros.dentista)) {
        return false;
      }
      
      // Aplicar filtro de protético
      if (filtros.protetico !== 'todos' && pedido.protetico?.id !== parseInt(filtros.protetico)) {
        return false;
      }
      
      // Aplicar filtro de prioridade
      if (filtros.prioridade !== 'todos' && pedido.prioridade !== filtros.prioridade) {
        return false;
      }
      
      // Aplicar filtro de data de entrega
      if (filtros.dataEntrega && pedido.dataEntrega) {
        const dataFiltro = new Date(filtros.dataEntrega).toISOString().split('T')[0];
        const dataPedido = new Date(pedido.dataEntrega).toISOString().split('T')[0];
        if (dataFiltro !== dataPedido) {
          return false;
        }
      }
      
      // Aplicar busca textual
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          pedido.paciente?.nome?.toLowerCase().includes(searchLower) ||
          pedido.dentista?.nome?.toLowerCase().includes(searchLower) ||
          pedido.protetico?.nome?.toLowerCase().includes(searchLower) ||
          pedido.servicos?.nome?.toLowerCase().includes(searchLower) ||
          (pedido.id?.toString() || '').toLowerCase().includes(searchLower)
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
      dentista: 'todos',
      protetico: 'todos',
      prioridade: 'todos',
      dataEntrega: ''
    });
  };

  const handleNovo = () => {
    navigate('/pedidos/cadastro');
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/pedidos/${id}`);
      toast.success('Pedido excluído com sucesso!');
      // Atualizar lista após exclusão
      setPedidos(prev => prev.filter(p => p.id !== id));
      // Atualizar relatórios
      if (window.atualizarRelatorios) {
        window.atualizarRelatorios();
      }
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      toast.error('Erro ao excluir pedido. Por favor, tente novamente.');
    }
  };

  const handleStatusChange = async (newStatus, pedidoId) => {
    try {
      await api.patch(`/pedidos/${pedidoId}/status`, { status: newStatus });
      toast.success('Status do pedido atualizado com sucesso!');
      setPedidos(prev => prev.map(p => 
        p.id === pedidoId ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      toast.error('Erro ao atualizar status. Por favor, tente novamente.');
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedPedidos = React.useMemo(() => {
    let sortablePedidos = [...pedidosFiltrados];
    if (sortConfig.key) {
      sortablePedidos.sort((a, b) => {
        // Para ordenação de IDs (números)
        if (sortConfig.key === 'id') {
          return sortConfig.direction === 'ascending'
            ? a.id - b.id
            : b.id - a.id;
        }
        
        // Para ordenação de datas
        if (sortConfig.key === 'dataEntrega') {
          const dateA = a.dataEntrega ? new Date(a.dataEntrega).getTime() : 0;
          const dateB = b.dataEntrega ? new Date(b.dataEntrega).getTime() : 0;
          return sortConfig.direction === 'ascending'
            ? dateA - dateB
            : dateB - dateA;
        }

        // Para ordenação de prioridade
        if (sortConfig.key === 'prioridade') {
          const prioridadeMap = {
            'BAIXA': 1,
            'MEDIA': 2,
            'ALTA': 3
          };
          const valueA = prioridadeMap[a.prioridade] || 0;
          const valueB = prioridadeMap[b.prioridade] || 0;
          return sortConfig.direction === 'ascending'
            ? valueA - valueB
            : valueB - valueA;
        }
        
        // Para ordenação de campos aninhados (objetos com propriedades)
        if (sortConfig.key.includes('.')) {
          const [obj, prop] = sortConfig.key.split('.');
          const aValue = a[obj]?.[prop] || '';
          const bValue = b[obj]?.[prop] || '';
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        // Para ordenação de strings
        const aValue = String(a[sortConfig.key] || '').toLowerCase();
        const bValue = String(b[sortConfig.key] || '').toLowerCase();
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortablePedidos;
  }, [pedidosFiltrados, sortConfig]);

  if (loading) {
    return <div className="loading">Carregando pedidos...</div>;
  }

  // Função para formatar a data (YYYY-MM-DD -> DD/MM/YYYY)
  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Função utilitária para formatar o ID do pedido
  const formatPedidoId = (id) => `PD${String(id).padStart(4, '0')}`;

  return (
    <div className="pedido-page">
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
        <h1 className="page-title">Pedidos</h1>
        <div className="header-actions">
          <div className="filter-container" ref={filterRef}>
            <ActionButton 
              label="Filtrar" 
              icon="filter"
              onClick={toggleFiltro} 
              active={isFilterOpen || filtros.dentista !== 'todos' || filtros.protetico !== 'todos' || filtros.prioridade !== 'todos' || filtros.dataEntrega !== ''}
            />
            
            {isFilterOpen && (
              <div className="filter-dropdown">
                <h3>Filtros</h3>
                
                <div className="filter-group">
                  <label htmlFor="dentista">Dentista</label>
                  <select 
                    id="dentista" 
                    name="dentista" 
                    value={filtros.dentista} 
                    onChange={handleFiltroChange}
                    className="filter-select"
                  >
                    <option value="todos">Todos</option>
                    {dentistas.map(dentista => (
                      <option key={dentista.id} value={dentista.id}>
                        {dentista.nome}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label htmlFor="protetico">Protético</label>
                  <select 
                    id="protetico" 
                    name="protetico" 
                    value={filtros.protetico} 
                    onChange={handleFiltroChange}
                    className="filter-select"
                  >
                    <option value="todos">Todos</option>
                    {proteticos.map(protetico => (
                      <option key={protetico.id} value={protetico.id}>
                        {protetico.nome}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label htmlFor="prioridade">Prioridade</label>
                  <select 
                    id="prioridade" 
                    name="prioridade" 
                    value={filtros.prioridade} 
                    onChange={handleFiltroChange}
                    className="filter-select"
                  >
                    <option value="todos">Todas</option>
                    <option value="BAIXA">Baixa</option>
                    <option value="MEDIA">Média</option>
                    <option value="ALTA">Alta</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label htmlFor="dataEntrega">Data de Entrega</label>
                  <input 
                    type="date" 
                    id="dataEntrega" 
                    name="dataEntrega" 
                    value={filtros.dataEntrega} 
                    onChange={handleFiltroChange}
                    className="filter-input"
                  />
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
            data={pedidosFiltrados.map(pedido => ({
              id: formatPedidoId(pedido.id),
              cliente: pedido.paciente?.nome || 'N/A',
              dentista: pedido.dentista?.nome || 'N/A',
              protetico: pedido.protetico?.nome || 'N/A',
              servico: pedido.servicos?.nome || 'N/A',
              dataEntrega: formatarData(pedido.dataEntrega),
              prioridade: pedido.prioridade
            }))}
            headers={['ID', 'Cliente', 'Dentista', 'Protético', 'Serviço', 'Data Entrega', 'Prioridade']}
            fields={['id', 'cliente', 'dentista', 'protetico', 'servico', 'dataEntrega', 'prioridade']}
            filename="pedidos"
            isOpen={isExportOpen}
            toggleExport={toggleExport}
            onCloseDropdown={handleCloseExport}
          />
        </div>
      </div>
      
      <div className="search-container">
        <SearchBar 
          placeholder="Buscar por cliente, dentista ou protético..." 
          onSearch={handleSearch} 
        />
        <ActionButton 
          label="Novo" 
          variant="primary"
          onClick={handleNovo}
        />
      </div>

      <div className="table-container">
        <PedidoTable 
          pedidos={sortedPedidos}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      </div>
    </div>
  );
};

export default PedidoPage; 