import React, { useState, useEffect, useRef } from 'react';
import './PedidoPage.css';
import SearchBar from '../../components/SearchBar/SearchBar';
import ActionButton from '../../components/ActionButton/ActionButton';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import ExportDropdown from '../../components/ExportDropdown/ExportDropdown';
import PedidoTable from '../../components/PedidoTable/PedidoTable';
import Dropdown from '../../components/Dropdown/Dropdown';
import { useNavigate } from 'react-router-dom';
// axios removido - usando api do axios-config
import api from '../../axios-config';
import useToast from '../../hooks/useToast';
import useNotifications from '../../hooks/useNotifications';

const PedidoPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [dentistas, setDentistas] = useState([]);
  const [proteticos, setProteticos] = useState([]);
  const [filtros, setFiltros] = useState({
    dentista: 'todos',
    protetico: 'todos',
    status: 'todos'
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const filterRef = useRef(null);
  const navigate = useNavigate();
  const { notifications, loading: notificationLoading, refreshNotifications } = useNotifications();
  const toast = useToast();
  
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
        
        // Buscar quantidades para cada pedido em paralelo
        const pedidosComQuantidades = await Promise.all(
          response.data.map(async (pedido) => {
            try {
              const quantidadesResponse = await api.get(`/pedidos/${pedido.id}/quantidades-servicos`);
              console.log(`Quantidades para pedido ${pedido.id}:`, quantidadesResponse.data);
              return {
                ...pedido,
                quantidadesServicos: quantidadesResponse.data
              };
            } catch (err) {
              console.warn(`Erro ao buscar quantidades para pedido ${pedido.id}:`, err);
              return {
                ...pedido,
                quantidadesServicos: []
              };
            }
          })
        );
        
        const pedidosFormatados = pedidosComQuantidades.map(pedido => ({
          id: pedido.id,
          paciente: pedido.cliente,
          dentista: pedido.dentista,
          protetico: pedido.protetico,
          servicos: pedido.servicos,
          quantidadesServicos: pedido.quantidadesServicos,
          dataEntrega: pedido.dataEntrega,
          createdAt: pedido.createdAt || pedido.created_at,
          prioridade: pedido.prioridade,
          odontograma: pedido.odontograma,
          observacao: pedido.observacao,
          status: pedido.status,
          valorTotal: Array.isArray(pedido.servicos) ? pedido.servicos.reduce((acc, s) => {
            // Calcular valor considerando as quantidades
            const quantidade = pedido.quantidadesServicos?.find(qs => qs.servico.id === s.id)?.quantidade || 1;
            return acc + ((s.valorTotal || s.preco || 0) * quantidade);
          }, 0) : 0
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
      
      // Aplicar filtro de status
      if (filtros.status !== 'todos' && pedido.status !== filtros.status) {
        return false;
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

  // Função helper para mapear status
  const getStatusObject = (statusValue) => {
    const statusMap = {
      'todos': 'Todos',
      'PENDENTE': 'Pendente',
      'EM_ANDAMENTO': 'Em Andamento',
      'CONCLUIDO': 'Concluído'
    };
    return { id: statusValue, nome: statusMap[statusValue] || statusValue };
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    // Função mantida por compatibilidade, mas não é mais usada
    setFiltros({
      ...filtros,
      [name]: value
    });
  };

  const handleLimparFiltros = () => {
    setFiltros({
      dentista: 'todos',
      protetico: 'todos',
      status: 'todos'
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

        // Para ordenação de status
        if (sortConfig.key === 'status') {
          const statusMap = {
            'PENDENTE': 1,
            'EM_ANDAMENTO': 2,
            'CONCLUIDO': 3
          };
          const valueA = statusMap[a.status] || 0;
          const valueB = statusMap[b.status] || 0;
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
        <h1 className="page-title">Pedidos</h1>
        <div className="header-actions">
          <div className="filter-container" ref={filterRef}>
            <ActionButton 
              label="Filtrar" 
              icon="filter"
              onClick={toggleFiltro} 
              active={isFilterOpen || filtros.dentista !== 'todos' || filtros.protetico !== 'todos' || filtros.status !== 'todos'}
            />
            
            {isFilterOpen && (
              <div className="filter-dropdown">
                <h3>Filtros</h3>
                
                <div className="filter-group">
                  <label htmlFor="dentista">Dentista</label>
                  <Dropdown 
                    items={[{ id: 'todos', nome: 'Todos' }, ...dentistas]}
                    value={filtros.dentista === 'todos' ? { id: 'todos', nome: 'Todos' } : dentistas.find(d => d.id.toString() === filtros.dentista)}
                    onChange={(selected) => {
                      const value = selected ? selected.id.toString() : 'todos';
                      setFiltros({ ...filtros, dentista: value });
                    }}
                    placeholder="Selecionar dentista..."
                    searchPlaceholder="Buscar dentista..."
                    searchable={true}
                    allowClear={false}
                    displayProperty="nome"
                    valueProperty="id"
                    variant="outline"
                    size="small"
                    buttonClassName="filter-select"
                  />
                </div>
                
                <div className="filter-group">
                  <label htmlFor="protetico">Protético</label>
                  <Dropdown 
                    items={[{ id: 'todos', nome: 'Todos' }, ...proteticos]}
                    value={filtros.protetico === 'todos' ? { id: 'todos', nome: 'Todos' } : proteticos.find(p => p.id.toString() === filtros.protetico)}
                    onChange={(selected) => {
                      const value = selected ? selected.id.toString() : 'todos';
                      setFiltros({ ...filtros, protetico: value });
                    }}
                    placeholder="Selecionar protético..."
                    searchPlaceholder="Buscar protético..."
                    searchable={true}
                    allowClear={false}
                    displayProperty="nome"
                    valueProperty="id"
                    variant="outline"
                    size="small"
                    buttonClassName="filter-select"
                  />
                </div>
                
                <div className="filter-group">
                  <label htmlFor="status">Status</label>
                  <Dropdown 
                    items={[
                      { id: 'todos', nome: 'Todos' },
                      { id: 'PENDENTE', nome: 'Pendente' },
                      { id: 'EM_ANDAMENTO', nome: 'Em Andamento' },
                      { id: 'CONCLUIDO', nome: 'Concluído' }
                    ]}
                    value={getStatusObject(filtros.status)}
                    onChange={(selected) => {
                      const value = selected ? selected.id : 'todos';
                      setFiltros({ ...filtros, status: value });
                    }}
                    placeholder="Selecionar status..."
                    searchable={false}
                    allowClear={false}
                    displayProperty="nome"
                    valueProperty="id"
                    variant="outline"
                    size="small"
                    buttonClassName="filter-select"
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
            data={pedidosFiltrados.map(pedido => {
              // Formatar serviços corretamente para exportação
              let servicosFormatados = 'N/A';
              if (pedido.servicos && Array.isArray(pedido.servicos) && pedido.servicos.length > 0) {
                // Criar lista de serviços únicos com quantidades
                const servicosUnicos = [];
                const servicosVistos = new Set();
                
                pedido.servicos.forEach(servico => {
                  if (!servicosVistos.has(servico.id)) {
                    servicosVistos.add(servico.id);
                    servicosUnicos.push(servico);
                  }
                });
                
                // Formatar com quantidades - usar " | " em vez de vírgula para evitar conflito com separador CSV
                const servicosComQuantidade = servicosUnicos.map(servico => {
                  const quantidade = pedido.quantidadesServicos?.find(qs => qs.servico.id === servico.id)?.quantidade || 1;
                  return quantidade > 1 ? `${servico.nome} x${quantidade}` : servico.nome;
                });
                
                servicosFormatados = servicosComQuantidade.join(' | ');
              }
              
              return {
                id: formatPedidoId(pedido.id),
                cliente: pedido.paciente?.nome || 'N/A',
                dentista: pedido.dentista?.nome || 'N/A',
                protetico: pedido.protetico?.nome || 'N/A',
                servicos: servicosFormatados,
                dataEntrega: formatarData(pedido.dataEntrega),
                status: pedido.status
              };
            })}
            headers={['ID', 'Cliente', 'Dentista', 'Protético', 'Serviços', 'Data Entrega', 'Status']}
            fields={['id', 'cliente', 'dentista', 'protetico', 'servicos', 'dataEntrega', 'status']}
            filename="pedidos"
            isOpen={isExportOpen}
            toggleExport={toggleExport}
            onCloseDropdown={handleCloseExport}
            title="Lista de Pedidos"
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