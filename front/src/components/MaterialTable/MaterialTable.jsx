import React from 'react';
import GenericTable from '../GenericTable/GenericTable';
import MaterialActionMenu from './MaterialActionMenu';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'nome', label: 'Nome', sortable: true },
  { key: 'quantidade', label: 'Quantidade', sortable: true },
  { key: 'categoriaMaterial.nome', label: 'Categoria', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Ações' }
];

const MaterialTable = ({ materiais, onDelete, onStatusChange, lastElementRef, sortConfig, onSort }) => {
  const handleStatusChange = (materialId, newStatus) => {
    // Converte o status para booleano antes de enviar para o backend
    const statusBoolean = newStatus === 'ATIVO';
    if (onStatusChange) {
      onStatusChange(materialId, statusBoolean);
    }
  };

  return (
    <GenericTable
      data={materiais}
      onItemDeleted={onDelete}
      onStatusChange={handleStatusChange}
      sortConfig={sortConfig}
      onSort={onSort}
      isEmpty={materiais.length === 0}
      columns={columns}
      formatId={(id) => id.toString()}
      apiEndpoint="/material"
      emptyMessage="Nenhum material cadastrado"
      ActionMenuComponent={MaterialActionMenu}
      statusField="status"
      lastElementRef={lastElementRef}
    />
  );
}

export default MaterialTable; 