import React from 'react';
import GenericTable from '../GenericTable/GenericTable';
import MaterialActionMenu from './MaterialActionMenu';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'nome', label: 'Nome', sortable: true },
  { key: 'quantidade', label: 'Quantidade', sortable: true },
  { 
    key: 'categoriaMaterial', 
    label: 'Categoria', 
    sortable: true,
    render: (categoriaMaterial) => categoriaMaterial?.nome || '-'
  },
  { 
    key: 'status', 
    label: 'Status', 
    sortable: true,
    render: (status) => {
      const getStatusStyle = (status) => {
        switch (status) {
          case 'EM_ESTOQUE':
            return {
              backgroundColor: '#e8f5e9',
              color: '#2e7d32',
              padding: '4px 8px',
              borderRadius: '4px',
              fontWeight: '500',
              display: 'inline-block'
            };
          case 'BAIXO_ESTOQUE':
            return {
              backgroundColor: '#fff3e0',
              color: '#e65100',
              padding: '4px 8px',
              borderRadius: '4px',
              fontWeight: '500',
              display: 'inline-block'
            };
          case 'SEM_ESTOQUE':
            return {
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '4px 8px',
              borderRadius: '4px',
              fontWeight: '500',
              display: 'inline-block'
            };
          default:
            return {};
        }
      };

      switch (status) {
        case 'EM_ESTOQUE':
          return <span style={getStatusStyle(status)}>Em Estoque</span>;
        case 'BAIXO_ESTOQUE':
          return <span style={getStatusStyle(status)}>Baixo Estoque</span>;
        case 'SEM_ESTOQUE':
          return <span style={getStatusStyle(status)}>Sem Estoque</span>;
        default:
          return status;
      }
    }
  },
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
      useCustomStatusRender={true}
    />
  );
}

export default MaterialTable; 