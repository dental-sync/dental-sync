import React from 'react';
import GenericTable from '../GenericTable/GenericTable';
import MaterialActionMenu from './MaterialActionMenu';
import { formatNome, formatCategoria, limitText } from '../../utils/textUtils';

// Função utilitária para formatar o ID
const formatMaterialId = (id) => `M${String(id).padStart(4, '0')}`;

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'nome', label: 'Nome', sortable: true, render: (nome) => formatNome(nome, 30) },
  { key: 'categoriaMaterial', label: 'Categoria', sortable: true, render: (categoriaMaterial) => 
    formatCategoria(categoriaMaterial?.nome || '-') },
  { key: 'quantidade', label: 'Quantidade Total', sortable: true, render: (quantidade) => {
    const num = Number(quantidade);
    return !isNaN(num) ? num.toLocaleString('pt-BR') : '-';
  } },
  { key: 'unidadeMedida', label: 'Unidade', sortable: false, render: (unidade) => limitText(unidade, 15) },
  { key: 'valorUnitario', label: 'Preço Unitário', sortable: true, render: (valor) => {
    const num = Number(valor);
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
              backgroundColor: '#28a745',
              color: 'white',
              padding: '3px 10px',
              borderRadius: '20px',
              fontWeight: '500',
              fontSize: '12px',
              display: 'inline-block',
              maxWidth: '300px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              verticalAlign: 'middle'
            };
          case 'BAIXO_ESTOQUE':
            return {
              backgroundColor: '#ffa500',
              color: 'white',
              padding: '3px 10px',
              borderRadius: '20px',
              fontWeight: '500',
              fontSize: '12px',
              display: 'inline-block',
              maxWidth: '300px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              verticalAlign: 'middle'
            };
          case 'SEM_ESTOQUE':
            return {
              backgroundColor: '#dc3545',
              color: 'white',
              padding: '3px 10px',
              borderRadius: '20px',
              fontWeight: '500',
              fontSize: '12px',
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

const MaterialTable = ({ materiais, onDelete, onStatusChange, sortConfig, onSort, hasFiltersApplied }) => {
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
      isEmpty={materiais.length === 0 && !hasFiltersApplied}
      columns={columns}
      formatId={formatMaterialId}
      apiEndpoint="/material"
      emptyMessage="Nenhum material cadastrado"
      ActionMenuComponent={MaterialActionMenu}
      statusField="status"
      useCustomStatusRender={true}
    />
  );
}

export default MaterialTable; 