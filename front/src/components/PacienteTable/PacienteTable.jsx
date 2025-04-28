import React, { useState } from 'react';
import './PacienteTable.css';
import StatusBadge from '../StatusBadge/StatusBadge';
import PacienteActionMenu from './PacienteActionMenu';
import axios from 'axios';
import { toast } from 'react-toastify';

const PacienteTable = ({ pacientes = [], onPacienteDeleted, onStatusChange }) => {
  const [pacientesState, setPacientesState] = useState(pacientes);

  // Atualizar o estado local quando as props mudarem
  React.useEffect(() => {
    setPacientesState(pacientes);
  }, [pacientes]);

  const handleStatusChange = (pacienteId, newStatus) => {
    setPacientesState(prevState => 
      prevState.map(paciente => 
        paciente.id === pacienteId 
          ? { ...paciente, status: newStatus ? 'ATIVO' : 'INATIVO' } 
          : paciente
      )
    );
    
    // Notificar o componente pai sobre a mudança
    if (onStatusChange) {
      onStatusChange(pacienteId, newStatus);
    }
  };
  
  const handleStatusClick = async (pacienteId, newStatus) => {
    try {
      console.log(`Atualizando status do paciente ${pacienteId} para ${newStatus ? 'Ativo' : 'Inativo'}`);
      
      // Verificar o formato do corpo da requisição
      const requestBody = { isActive: newStatus };
      console.log('Corpo da requisição:', JSON.stringify(requestBody));
      
      const response = await axios.patch(`http://localhost:8080/paciente/${pacienteId}`, requestBody);
      
      console.log('Resposta da API:', response);
      
      if (response.status === 200) {
        handleStatusChange(pacienteId, newStatus);
        toast.success(`Status atualizado com sucesso para ${newStatus ? 'Ativo' : 'Inativo'}`);
      }
    } catch (error) {
      console.error('Erro ao alterar status do paciente:', error);
      toast.error('Erro ao alterar status. Tente novamente.');
    }
  };

  return (
    <div className="table-container">
      <table className="paciente-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Email</th>
            <th>Data de Nascimento</th>
            <th>Último Serviço</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {pacientesState.length > 0 ? (
            pacientesState.map((paciente) => (
              <tr key={paciente.id}>
                <td>{paciente.id}</td>
                <td>{paciente.nome}</td>
                <td>{paciente.telefone}</td>
                <td>{paciente.email}</td>
                <td>{paciente.dataNascimento}</td>
                <td>{paciente.ultimoServico}</td>
                <td>
                  <StatusBadge 
                    status={paciente.status || (paciente.isActive ? 'ATIVO' : 'INATIVO')} 
                    onClick={(newStatus) => handleStatusClick(paciente.id, newStatus)}
                  />
                </td>
                <td>
                  <PacienteActionMenu 
                    pacienteId={paciente.id} 
                    pacienteStatus={paciente.status || (paciente.isActive ? 'ATIVO' : 'INATIVO')}
                    onPacienteDeleted={onPacienteDeleted}
                    onStatusChange={handleStatusChange}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr className="empty-row">
              <td colSpan="8" className="empty-message">Nenhum paciente encontrado</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PacienteTable; 