import React from 'react';
import GenericTable from '../GenericTable/GenericTable';
import ActionMenuClinica from '../ActionMenuClinica/ActionMenuClinica';

// Função utilitária para formatar o ID
const formatClinicaId = (id) => `C${String(id).padStart(4, '0')}`;

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'nome', label: 'Nome', sortable: true },
  { key: 'cnpj', label: 'CNPJ' },
  { key: 'actions', label: 'Ações' }
];

const ClinicaTable = ({ clinicas, onClinicaDeleted, sortConfig, onSort, isEmpty }) => {
  return (
    <GenericTable
      data={clinicas}
      onItemDeleted={onClinicaDeleted}
      sortConfig={sortConfig}
      onSort={onSort}
      isEmpty={isEmpty}
      columns={columns}
      formatId={formatClinicaId}
      apiEndpoint="/clinicas"
      emptyMessage="Nenhuma clínica cadastrada"
      ActionMenuComponent={ActionMenuClinica}
    />
  );
}

export default ClinicaTable; 