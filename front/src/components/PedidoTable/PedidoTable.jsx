import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PedidoTable.css';
import StatusBadge from '../StatusBadge/StatusBadge';
import PedidoActionMenu from './PedidoActionMenu';

const PedidoTable = ({ pedidos, onDelete, onStatusChange, lastElementRef, sortConfig, onSort }) => {
  const navigate = useNavigate();

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return (
        <span style={{fontSize: '18px', opacity: 0.4, marginLeft: '2px', marginTop: '-2px'}}>–</span>
      );
    }
    return sortConfig.direction === 'ascending' ? (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    ) : (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    );
  };

  // Função para formatar a data (YYYY-MM-DD -> DD/MM/YYYY)
  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Função para converter enum de prioridade para texto em português
  const formatarPrioridade = (prioridade) => {
    const prioridadeMap = {
      'BAIXA': 'Baixa',
      'MEDIA': 'Média',
      'ALTA': 'Alta',
      'URGENTE': 'Urgente'
    };
    return prioridadeMap[prioridade] || prioridade;
  };

  // Função para obter a cor da prioridade
  const getPrioridadeColor = (prioridade) => {
    const colorMap = {
      'BAIXA': '#28a745',
      'MEDIA': '#17a2b8',
      'ALTA': '#ffc107',
      'URGENTE': '#dc3545'
    };
    return colorMap[prioridade] || '#6c757d';
  };

  return (
    <div className="pedido-table-container">
      <table className="pedido-table">
        <thead>
          <tr>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort && onSort('id')}>
              <span className="sortable-content">
                ID
                <div className="sort-icon">{getSortIcon('id')}</div>
              </span>
            </th>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort && onSort('cliente.nome')}>
              <span className="sortable-content">
                Cliente
                <div className="sort-icon">{getSortIcon('cliente.nome')}</div>
              </span>
            </th>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort && onSort('dentista.nome')}>
              <span className="sortable-content">
                Dentista
                <div className="sort-icon">{getSortIcon('dentista.nome')}</div>
              </span>
            </th>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort && onSort('protetico.nome')}>
              <span className="sortable-content">
                Protético
                <div className="sort-icon">{getSortIcon('protetico.nome')}</div>
              </span>
            </th>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort && onSort('servico.nome')}>
              <span className="sortable-content">
                Serviço
                <div className="sort-icon">{getSortIcon('servico.nome')}</div>
              </span>
            </th>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort && onSort('dataEntrega')}>
              <span className="sortable-content">
                Data Entrega
                <div className="sort-icon">{getSortIcon('dataEntrega')}</div>
              </span>
            </th>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort && onSort('prioridade')}>
              <span className="sortable-content">
                Prioridade
                <div className="sort-icon">{getSortIcon('prioridade')}</div>
              </span>
            </th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido, index) => (
            <tr 
              key={pedido.id}
              ref={index === pedidos.length - 1 ? lastElementRef : null}
            >
              <td>{pedido.id}</td>
              <td>{pedido.cliente?.nome || 'N/A'}</td>
              <td>{pedido.dentista?.nome || 'N/A'}</td>
              <td>{pedido.protetico?.nome || 'N/A'}</td>
              <td>{pedido.servicos && pedido.servicos.length > 0 ? pedido.servicos.map(s => s.nome).join(', ') : 'N/A'}</td>
              <td>{formatarData(pedido.dataEntrega)}</td>
              <td>
                <span 
                  className="prioridade-badge"
                  style={{ backgroundColor: getPrioridadeColor(pedido.prioridade) }}
                >
                  {formatarPrioridade(pedido.prioridade)}
                </span>
              </td>
              <td>
                <PedidoActionMenu
                  pedidoId={pedido.id}
                  onDelete={onDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PedidoTable; 