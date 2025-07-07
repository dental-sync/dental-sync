import React, { useState, useEffect } from 'react';
import GenericTable from '../GenericTable/GenericTable';
import PacienteActionMenu from './PacienteActionMenu';
import { formatNome, formatEmail, formatTelefone } from '../../utils/textUtils';
import api from '../../axios-config';
import { toast } from 'react-toastify';

// Função utilitária para formatar o ID do paciente
const formatPacienteId = (id) => `P${String(id).padStart(4, '0')}`;

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'nome', label: 'Nome', sortable: true, render: (nome) => formatNome(nome) },
  { key: 'telefone', label: 'Telefone', render: (telefone) => formatTelefone(telefone) },
  { key: 'email', label: 'Email', render: (email) => formatEmail(email) },
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

  const handleStatusChange = async (pacienteId, newStatus) => {
    try {
      // Converter string para boolean
      const isActiveBoolean = newStatus === 'ATIVO' || newStatus === true;
      
      console.log('🔄 PacienteTable - handleStatusChange:');
      console.log('  - Paciente ID:', pacienteId);
      console.log('  - Status recebido:', newStatus);
      console.log('  - Boolean convertido:', isActiveBoolean);
      
      // Fazer a requisição diretamente aqui ao invés de delegar
      const requestBody = { isActive: isActiveBoolean };
      const response = await api.patch(`/paciente/${pacienteId}`, requestBody);
      
      if (response.status === 200) {
        // Atualizar estado local com sucesso
        setPacientesState(prevState => 
          prevState.map(paciente => 
            paciente.id === pacienteId 
              ? { ...paciente, isActive: isActiveBoolean } 
              : paciente
          )
        );
        
        // Notificar componente pai para possível refresh
        if (onStatusChange) {
          onStatusChange(pacienteId, isActiveBoolean);
        }
        
        // Exibir toast de sucesso
        const statusText = isActiveBoolean ? 'ativado' : 'desativado';
        toast.success(`Paciente ${statusText} com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao alterar status do paciente:', error);
      toast.error('Erro ao alterar status do paciente');
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