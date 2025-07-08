import React, { useEffect, useState, useRef } from 'react';
import api from '../../axios-config';
import './Kanban.css';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal/DeleteConfirmationModal';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../components/SearchBar/SearchBar';
import ActionButton from '../../components/ActionButton/ActionButton';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import useNotifications from '../../hooks/useNotifications';
import { useSidebar } from '../../contexts/SidebarContext';

const statusLabels = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDO: 'Concluído',
};

const prioridadeColors = {
  BAIXA: '#28a745',
  MEDIA: '#ffc107',
  ALTA: '#dc3545'
};

function Kanban() {
  const { setActiveItem } = useSidebar();
  const { notifications } = useNotifications();
  const [pedidos, setPedidos] = useState([]);
  const [dragged, setDragged] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [pedidoParaExcluir, setPedidoParaExcluir] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    prioridade: 'todos'
  });
  const filterRef = useRef(null);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/pedidos');
      setPedidos(response.data);
    } catch (err) {
      setError('Erro ao carregar pedidos.');
    } finally {
      setLoading(false);
    }
  };

  const onDragStart = (pedido) => {
    setDragged(pedido);
  };

  const onDragOver = (e, status) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const onDragLeave = () => {
    setDragOverColumn(null);
  };

  const onDrop = async (status) => {
    if (!dragged) return;
    
    if (dragged.status !== status) {
      try {
        await api.patch(`/pedidos/${dragged.id}/status`, { status });
        setPedidos((prev) => prev.map((p) => p.id === dragged.id ? { ...p, status } : p));
      } catch {
        setError('Erro ao atualizar status do pedido.');
      }
    }
    
    setDragged(null);
    setDragOverColumn(null);
  };

  const handleMoveStatus = async (pedido, novoStatus) => {
    setMenuOpenId(null);
    if (pedido.status !== novoStatus) {
      try {
        await api.patch(`/pedidos/${pedido.id}/status`, { status: novoStatus });
        setPedidos((prev) => prev.map((p) => p.id === pedido.id ? { ...p, status: novoStatus } : p));
      } catch {
        setError('Erro ao atualizar status do pedido.');
      }
    }
  };

  const handleEditPedido = (id) => {
    setMenuOpenId(null);
    setActiveItem('pedidos');
    navigate(`/pedidos/editar/${id}`);
  };

  const handleDeletePedido = (id) => {
    setMenuOpenId(null);
    setPedidoParaExcluir(id);
  };

  const confirmarExclusaoPedido = async () => {
    if (!pedidoParaExcluir) return;
    setIsDeleting(true);
    try {
      await api.delete(`/pedidos/${pedidoParaExcluir}`);
      setPedidos((prev) => prev.filter((p) => p.id !== pedidoParaExcluir));
      setPedidoParaExcluir(null);
    } catch {
      setError('Erro ao excluir pedido.');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const handleClick = () => setMenuOpenId(null);
    if (menuOpenId !== null) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [menuOpenId]);

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
      prioridade: 'todos'
    });
  };

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const servico = pedido.servicos && pedido.servicos.length > 0 ? pedido.servicos[0].nome.toLowerCase() : '';
    const paciente = pedido.cliente?.nome?.toLowerCase() || '';
    const responsavel = pedido.protetico?.nome?.toLowerCase() || '';
    
    if (filtros.prioridade !== 'todos' && pedido.prioridade !== filtros.prioridade) {
      return false;
    }

    if (!searchQuery) return true;
    const termo = searchQuery.toLowerCase();
    return (
      servico.includes(termo) ||
      paciente.includes(termo) ||
      responsavel.includes(termo)
    );
  });

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleNovoPedido = () => {
    setActiveItem('pedidos');
    navigate('/pedidos/cadastro');
  };

  const renderCard = (pedido) => {
    const servico = pedido.servicos && pedido.servicos.length > 0 ? pedido.servicos[0].nome : '-';
    const iniciais = pedido.protetico?.nome
      ? pedido.protetico.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
      : '-';

    return (
      <div
        key={pedido.id}
        className={`kanban-card ${dragged?.id === pedido.id ? 'dragging' : ''}`}
        draggable
        onDragStart={() => onDragStart(pedido)}
        style={{ position: 'relative' }}
      >
        <button
          className="kanban-card-menu"
          onClick={e => {
            e.stopPropagation();
            setMenuOpenId(menuOpenId === pedido.id ? null : pedido.id);
          }}
          aria-label="Abrir menu do card"
          type="button"
        >
          ⋯
        </button>
        {menuOpenId === pedido.id && (
          <div
            className="kanban-card-dropdown"
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            draggable={false}
          >
            {(pedido.status === 'PENDENTE' || pedido.status === 'CONCLUIDO') && (
              <div onClick={() => handleMoveStatus(pedido, 'EM_ANDAMENTO')}>Mover para Em Andamento</div>
            )}
            {(pedido.status === 'EM_ANDAMENTO' || pedido.status === 'CONCLUIDO') && (
              <div onClick={() => handleMoveStatus(pedido, 'PENDENTE')}>Mover para Pendente</div>
            )}
            {pedido.status !== 'CONCLUIDO' && (
              <div onClick={() => handleMoveStatus(pedido, 'CONCLUIDO')}>Mover para Concluído</div>
            )}
            <div onClick={() => handleEditPedido(pedido.id)}>Editar</div>
            <div className="danger" onClick={() => handleDeletePedido(pedido.id)}>Excluir</div>
          </div>
        )}
        <div className="kanban-card-title">
          {servico.length > 15 ? servico.slice(0, 15) + '...' : servico} - {pedido.cliente?.nome?.length > 15 ? pedido.cliente.nome.slice(0, 15) + '...' : pedido.cliente?.nome}
        </div>
        <div className="kanban-card-desc">
          {(pedido.observacao || 'Sem descrição.').length > 60 ? (pedido.observacao || 'Sem descrição.').slice(0, 60) + '...' : (pedido.observacao || 'Sem descrição.')}
        </div>
        <div className="kanban-card-footer">
          <span className="kanban-card-date">Entrega: {pedido.dataEntrega ? new Date(pedido.dataEntrega).toLocaleDateString('pt-BR') : '-'}</span>
          <span className="kanban-card-prioridade" style={{ background: prioridadeColors[pedido.prioridade] || '#ccc' }}>
            {pedido.prioridade?.charAt(0) + pedido.prioridade?.slice(1).toLowerCase()}
          </span>
        </div>
        <div className="kanban-card-resp">
          <span>Responsável:</span>
          <span className="kanban-card-resp-info">
            <span className="kanban-card-resp-circle">{iniciais}</span>
            {pedido.protetico?.nome || '-'}
          </span>
        </div>
      </div>
    );
  };

  const renderColumn = (status) => (
    <div
      className={`kanban-column ${dragOverColumn === status ? 'drag-over' : ''}`}
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={() => onDrop(status)}
    >
      <div className="kanban-column-header">
        {statusLabels[status]} <span className="kanban-column-count">{pedidosFiltrados.filter(p => p.status === status).length}</span>
      </div>
      <div className="kanban-column-cards">
        {pedidosFiltrados.filter(p => p.status === status).map(renderCard)}
      </div>
    </div>
  );

  if (loading) return <div className="kanban-loading">Carregando pedidos...</div>;
  if (error) return <div className="kanban-error">{error}</div>;

  return (
    <div className="kanban-container">
      <div className="kanban-content">
        <div className="page-top" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <div className="notification-container" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <NotificationBell 
            count={notifications.total}
            baixoEstoque={notifications.baixoEstoque}
            semEstoque={notifications.semEstoque}
            materiaisBaixoEstoque={notifications.materiaisBaixoEstoque}
            materiaisSemEstoque={notifications.materiaisSemEstoque}
          />
          </div>
        </div>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 className="kanban-title" style={{ fontSize: 24, fontWeight: 700, color: '#212529', margin: 0 }}>Kanban</h1>
          <div className="header-actions" style={{ display: 'flex', gap: 10, position: 'relative', alignItems: 'center' }}>
            <SearchBar placeholder="Buscar pedidos..." onSearch={handleSearch} variant="kanban" />
            <div className="filter-container" ref={filterRef} style={{ position: 'relative' }}>
              <ActionButton 
                label="Filtrar" 
                icon="filter" 
                onClick={toggleFiltro}
                active={isFilterOpen || filtros.prioridade !== 'todos'}
              />
              
              {isFilterOpen && (
                <div className="filter-dropdown">
                  <h3>Filtros</h3>
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
            <ActionButton label="Novo Pedido" icon="plus" variant="primary novo-button" onClick={handleNovoPedido} style={{ whiteSpace: 'nowrap', minWidth: 0 }} />
          </div>
        </div>
        <div className="kanban-board">
          {renderColumn('PENDENTE')}
          {renderColumn('EM_ANDAMENTO')}
          {renderColumn('CONCLUIDO')}
        </div>
        <DeleteConfirmationModal
          isOpen={!!pedidoParaExcluir}
          onClose={() => setPedidoParaExcluir(null)}
          onConfirm={confirmarExclusaoPedido}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir permanentemente este pedido? Esta ação não poderá ser desfeita."
        />
      </div>
    </div>
  );
}

export default Kanban; 