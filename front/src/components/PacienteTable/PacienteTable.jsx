import React, { useState, useEffect } from 'react';
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
  { 
    key: 'ultimoServico', 
    label: 'Último Serviço',
    render: (value) => value ? new Date(value).toLocaleDateString('pt-BR') : '-'
  },
  { key: 'isActive', label: 'Status', sortable: true },
  { key: 'actions', label: 'Ações' }
];

const PacienteTable = ({ pacientes = [], onPacienteDeleted, onStatusChange, sortConfig, onSort, isEmpty }) => {
  const [pacientesState, setPacientesState] = useState(pacientes);

  // Atualizar o estado local quando as props mudarem
  useEffect(() => {
    setPacientesState(pacientes);
  }, [pacientes]);

  const handleStatusChange = (pacienteId, newStatus) => {
    // Primeiro atualiza o estado local
    setPacientesState(prevState => 
      prevState.map(paciente => 
        paciente.id === pacienteId 
          ? { ...paciente, isActive: newStatus } 
          : paciente
      )
    );
    
    // Depois notifica o componente pai
    if (onStatusChange) {
      onStatusChange(pacienteId, newStatus);
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