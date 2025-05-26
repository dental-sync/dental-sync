import React from 'react';
import GenericTable from '../GenericTable/GenericTable';
import ActionMenuDentista from '../ActionMenuDentista/ActionMenuDentista';

// Função utilitária para formatar o ID
const formatDentistaId = (id) => `D${String(id).padStart(4, '0')}`;

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'nome', label: 'Nome', sortable: true },
  { key: 'cro', label: 'CRO' },
  { key: 'email', label: 'Email' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'isActive', label: 'Status', sortable: true },
  { key: 'actions', label: 'Ações' }
];

const DentistaTable = ({ dentistas, onDentistaDeleted, onStatusChange, sortConfig, onSort, isEmpty }) => {
  return (
    <GenericTable
      data={dentistas}
      onItemDeleted={onDentistaDeleted}
      onStatusChange={onStatusChange}
      sortConfig={sortConfig}
      onSort={onSort}
      isEmpty={isEmpty}
      columns={columns}
      formatId={formatDentistaId}
      apiEndpoint="/dentistas"
      emptyMessage="Nenhum dentista cadastrado"
      ActionMenuComponent={ActionMenuDentista}
    />
  );
}

export default DentistaTable; 