import React, { useState } from 'react';
import GenericTable from '../GenericTable/GenericTable';
import PacienteActionMenu from './PacienteActionMenu';

// Função utilitária para formatar o ID do paciente
const formatPacienteId = (id) => `P${String(id).padStart(4, '0')}`;

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'nome', label: 'Nome', sortable: true },
  { key: 'telefone', label: 'Telefone' },
  { key: 'email', label: 'Email' },
  { key: 'dataNascimento', label: 'Data de Nascimento' },
  { key: 'ultimoServico', label: 'Último Serviço' },
  { key: 'isActive', label: 'Status', sortable: true },
  { key: 'actions', label: 'Ações' }
];

const PacienteTable = ({ pacientes = [], onPacienteDeleted, onStatusChange, sortConfig, onSort, isEmpty }) => {
  const [pacientesState, setPacientesState] = useState(pacientes);

  // Atualizar o estado local quando as props mudarem
  React.useEffect(() => {
    setPacientesState(pacientes);
  }, [pacientes]);

  const handleStatusChange = (pacienteId, newStatus) => {
    setPacientesState(prevState => 
      prevState.map(paciente => 
        paciente.id === pacienteId 
          ? { ...paciente, status: newStatus ? 'ATIVO' : 'INATIVO', isActive: newStatus ? 'ATIVO' : 'INATIVO' } 
          : paciente
      )
    );
    
    // Notificar o componente pai sobre a mudança
    if (onStatusChange) {
      onStatusChange(pacienteId, newStatus ? 'ATIVO' : 'INATIVO');
    }
  };

  return (
    <GenericTable
      data={pacientesState}
      onItemDeleted={onPacienteDeleted}
      onStatusChange={handleStatusChange}
      sortConfig={sortConfig}
      onSort={onSort}
      isEmpty={isEmpty}
      columns={columns}
      formatId={formatPacienteId}
      apiEndpoint="/paciente"
      emptyMessage="Nenhum paciente cadastrado"
      ActionMenuComponent={PacienteActionMenu}
      statusField="isActive"
    />
  );
}

export default PacienteTable; 