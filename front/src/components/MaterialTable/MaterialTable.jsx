import React from 'react';
import GenericTable from '../GenericTable/GenericTable';
import MaterialActionMenu from './MaterialActionMenu';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'nome', label: 'Nome', sortable: true, render: (nome) => (
    <span
      title={nome}
      style={{
        display: 'inline-block',
        maxWidth: '300px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        verticalAlign: 'middle'
      }}
    >
      {nome}
    </span>
  ) },
  { key: 'categoriaMaterial', label: 'Categoria', sortable: true, render: (categoriaMaterial) => {
    const nome = categoriaMaterial?.nome || '-';
    return (
      <span
        title={nome}
        style={{
          display: 'inline-block',
          maxWidth: '300px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          verticalAlign: 'middle'
        }}
      >
        {nome}
      </span>
    );
  } },
  { key: 'quantidade', label: 'Quantidade Total', sortable: true },
  { key: 'unidadeMedida', label: 'Unidade', sortable: false },
  { key: 'valorUnitario', label: 'Preço Médio', sortable: false, render: (valor) => {
    console.log('valorUnitario recebido:', valor);
    const num = Number(valor);
    console.log('valorUnitario convertido para número:', num);
    return !isNaN(num) ? num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-';
  } },
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
              display: 'inline-block',
              maxWidth: '300px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              verticalAlign: 'middle'
            };
          case 'BAIXO_ESTOQUE':
            return {
              backgroundColor: '#fff3e0',
              color: '#e65100',
              padding: '4px 8px',
              borderRadius: '4px',
              fontWeight: '500',
              display: 'inline-block',
              maxWidth: '300px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              verticalAlign: 'middle'
            };
          case 'SEM_ESTOQUE':
            return {
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '4px 8px',
              borderRadius: '4px',
              fontWeight: '500',
              display: 'inline-block',
              maxWidth: '300px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              verticalAlign: 'middle'
            };
          default:
            return {
              display: 'inline-block',
              maxWidth: '300px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              verticalAlign: 'middle'
            };
        }
      };

      switch (status) {
        case 'EM_ESTOQUE':
          return <span style={getStatusStyle(status)} title="Em Estoque">Em Estoque</span>;
        case 'BAIXO_ESTOQUE':
          return <span style={getStatusStyle(status)} title="Baixo Estoque">Baixo Estoque</span>;
        case 'SEM_ESTOQUE':
          return <span style={getStatusStyle(status)} title="Sem Estoque">Sem Estoque</span>;
        default:
          return <span style={getStatusStyle(status)} title={status}>{status}</span>;
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