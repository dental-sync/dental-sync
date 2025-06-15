import React from 'react';
import './PedidoTable.css';
import GenericTable from '../GenericTable/GenericTable';
import PedidoActionMenu from './PedidoActionMenu';
import StatusBadge from '../StatusBadge/StatusBadge';

const formatPedidoId = (id) => `PD${String(id).padStart(4, '0')}`;

const PedidoTable = ({ pedidos, onDelete, sortConfig, onSort, onStatusChange }) => {
  // Move columns definition inside component to access onStatusChange prop
  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'paciente', label: 'Paciente', sortable: true, render: (paciente) => paciente?.nome || 'N/A' },
    { key: 'dentista', label: 'Dentista', sortable: true, render: (dentista) => dentista?.nome || 'N/A' },
    { key: 'protetico', label: 'Protético', sortable: true, render: (protetico) => protetico?.nome || 'N/A' },
    { key: 'servicos', label: 'Serviços', render: (servicos) => servicos && servicos.length > 0 ? servicos.map(s => s.nome).join(', ') : 'N/A' },
    { key: 'periodo', label: 'Período', render: (periodo) => {
      const formatDate = (date, label) => {
        if (!date) return 'N/A';
        const safeDate = typeof date === 'string' ? date.replace(/(\.\d{3})\d+/, '$1') : date;
        const d = new Date(safeDate);
        return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('pt-BR');
      };
      
      const dataInicio = formatDate(periodo?.createdAt, 'createdAt');
      const dataFim = formatDate(periodo?.dataEntrega, 'dataEntrega');
      
      return (
        <div className="periodo-container">
          <span className="periodo-texto">{dataInicio} - {dataFim}</span>
        </div>
      );
    } },
    { key: 'valorTotal', label: 'Valor', render: (valor) => valor ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00' },
    { key: 'status', label: 'Status', render: (status, item) => <StatusBadge status={status} tipo="pedido" pedidoId={item.id} onClick={onStatusChange} /> },
    { key: 'actions', label: 'Ações' }
  ];

  // Adaptar os dados para o formato esperado pelo GenericTable
  const data = pedidos.map(p => ({
    ...p,
    periodo: { createdAt: p.createdAt, dataEntrega: p.dataEntrega },
    actions: '', // campo fake só para render customizado
  }));

  return (
    <GenericTable
      data={data}
      columns={columns}
      formatId={formatPedidoId}
      sortConfig={sortConfig}
      onSort={onSort}
      ActionMenuComponent={({ itemId }) => (
        <PedidoActionMenu pedidoId={itemId} onDelete={onDelete} />
      )}
      emptyMessage="Nenhum pedido cadastrado"
      apiEndpoint="/pedidos"
    />
  );
};

export default PedidoTable; 