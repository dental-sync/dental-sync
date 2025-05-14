import React, { useState } from 'react';
import './PacienteTable.css';
import StatusBadge from '../StatusBadge/StatusBadge';
import PacienteActionMenu from './PacienteActionMenu';
import axios from 'axios';
import { toast } from 'react-toastify';

// Função utilitária para formatar o ID do paciente
const formatPacienteId = (id) => `P${String(id).padStart(4, '0')}`;

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
        
      }
    } catch (error) {
      console.error('Erro ao alterar status do paciente:', error);
      toast.error('Erro ao alterar status. Tente novamente.');
    }
  };

  //Função para obter o ícone de ordenação
  const getSortIcon = (key) => {
    if (sortConfig && sortConfig.key !== key) {
      return (
        <span style={{fontSize: '18px', opacity: 0.4, marginLeft: '2px', marginTop: '-2px'}}>–</span>
      );
    }
    return sortConfig && sortConfig.direction === 'ascending' ? (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    ) : (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    );
  };

  return (
    <div className={`paciente-table-container${isEmpty ? ' empty' : ''}`}>
      <table className="paciente-table">
        <thead>
          <tr>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort('id')}>
              <span className="sortable-content">
                ID
                <div className="sort-icon">{getSortIcon('id')}</div>
              </span>
            </th>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort('nome')}>
              <span className="sortable-content">
                Nome
                <div className="sort-icon">{getSortIcon('nome')}</div>
              </span>
            </th>
            <th>Telefone</th>
            <th>Email</th>
            <th>Data de Nascimento</th>
            <th>Último Serviço</th>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort('isActive')}>
              <span className="sortable-content">
                Status
                <div className="sort-icon">{getSortIcon('isActive')}</div>
              </span>
            </th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {isEmpty ? null : pacientesState.length > 0 ? (
            pacientesState.map((paciente) => (
              <tr key={paciente.id}>
                <td>{formatPacienteId(paciente.id)}</td>
                <td>{paciente.nome}</td>
                <td>{paciente.telefone}</td>
                <td>{paciente.email}</td>
                <td>{paciente.dataNascimento}</td>
                <td>{paciente.ultimoServico}</td>
                <td>
                  <StatusBadge 
                    status={paciente.status || paciente.isActive} 
                    onClick={(newStatus) => handleStatusClick(paciente.id, newStatus)}
                  />
                </td>
                <td>
                  <PacienteActionMenu 
                    pacienteId={paciente.id} 
                    pacienteStatus={paciente.status || paciente.isActive}
                    onPacienteDeleted={onPacienteDeleted}
                    onStatusChange={handleStatusChange}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="empty-row"></td>
            </tr>
          )}
        </tbody>
      </table>
      {isEmpty && (
        <div className="empty-table-message-absolute">
          Nenhum paciente cadastrado
        </div>
      )}
    </div>
  );
};

export default PacienteTable; 