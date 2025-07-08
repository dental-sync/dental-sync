import React from 'react';
import GenericTable from '../GenericTable/GenericTable';
import ActionMenu from '../ActionMenu/ActionMenu';
import { formatNome, formatEmail, formatTelefone, limitText } from '../../utils/textUtils';

// Função utilitária para formatar o ID
const formatProteticoId = (id) => `PT${String(id).padStart(4, '0')}`;

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'nome', label: 'Nome', sortable: true, render: (nome) => formatNome(nome) },
  { key: 'cro', label: 'CRO' },
  { key: 'cargo', label: 'Cargo', render: (cargo) => limitText(cargo, 20) },
  { key: 'email', label: 'Email', render: (email) => formatEmail(email) },
  { key: 'telefone', label: 'Telefone', render: (telefone) => formatTelefone(telefone) },
  { key: 'isActive', label: 'Status', sortable: true },
  { key: 'actions', label: 'Ações' }
];

const ProteticoTable = ({ proteticos, onProteticoDeleted, onStatusChange, sortConfig, onSort, isEmpty }) => {
  return (
    <GenericTable
      data={proteticos}
      onItemDeleted={onProteticoDeleted}
      onStatusChange={onStatusChange}
      sortConfig={sortConfig}
      onSort={onSort}
      isEmpty={isEmpty}
      columns={columns}
      formatId={formatProteticoId}
      apiEndpoint="/proteticos"
      emptyMessage="Nenhum protético cadastrado"
      ActionMenuComponent={(props) => (
        <ActionMenu
          {...props}
          deleteMessage="Tem certeza que deseja excluir este protético? Esta ação não pode ser desfeita."
        />
      )}
      url="proteticos"
    />
  );
}

export default ProteticoTable; 