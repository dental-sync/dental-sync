import React, { useEffect, useState } from 'react';
import api from '../../axios-config';
import './Kanban.css';

const statusLabels = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDO: 'Concluído',
};

const prioridadeColors = {
  BAIXA: '#28a745',
  MEDIA: '#ffc107',
  ALTA: '#dc3545',
  URGENTE: '#b71c1c',
};

function Kanban() {
  const [pedidos, setPedidos] = useState([]);
  const [dragged, setDragged] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const onDrop = async (status) => {
    if (!dragged || dragged.status === status) return;
    try {
      await api.patch(`/pedidos/${dragged.id}/status`, { status });
      setPedidos((prev) => prev.map((p) => p.id === dragged.id ? { ...p, status } : p));
    } catch {
      setError('Erro ao atualizar status do pedido.');
    }
    setDragged(null);
  };

  const renderCard = (pedido) => {
    const servico = pedido.servicos && pedido.servicos.length > 0 ? pedido.servicos[0].nome : '-';
    return (
      <div
        key={pedido.id}
        className="kanban-card"
        draggable
        onDragStart={() => onDragStart(pedido)}
      >
        <div className="kanban-card-title">{servico} - {pedido.cliente?.nome}</div>
        <div className="kanban-card-desc">{pedido.observacao || 'Sem descrição.'}</div>
        <div className="kanban-card-footer">
          <span className="kanban-card-date">Entrega: {pedido.dataEntrega ? new Date(pedido.dataEntrega).toLocaleDateString('pt-BR') : '-'}</span>
          <span className="kanban-card-prioridade" style={{ background: prioridadeColors[pedido.prioridade] || '#ccc' }}>
            {pedido.prioridade?.charAt(0) + pedido.prioridade?.slice(1).toLowerCase()}
          </span>
        </div>
        <div className="kanban-card-resp">Responsável: {pedido.protetico?.nome || '-'}</div>
      </div>
    );
  };

  const renderColumn = (status) => (
    <div
      className="kanban-column"
      onDragOver={e => e.preventDefault()}
      onDrop={() => onDrop(status)}
    >
      <div className="kanban-column-header">
        {statusLabels[status]} <span className="kanban-column-count">{pedidos.filter(p => p.status === status).length}</span>
      </div>
      <div className="kanban-column-cards">
        {pedidos.filter(p => p.status === status).map(renderCard)}
      </div>
    </div>
  );

  if (loading) return <div className="kanban-loading">Carregando pedidos...</div>;
  if (error) return <div className="kanban-error">{error}</div>;

  return (
    <div className="kanban-container">
      <h1 className="kanban-title">Kanban</h1>
      <div className="kanban-board">
        {renderColumn('PENDENTE')}
        {renderColumn('EM_ANDAMENTO')}
        {renderColumn('CONCLUIDO')}
      </div>
    </div>
  );
}

export default Kanban; 