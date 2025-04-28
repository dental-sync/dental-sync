import React from 'react';
import './PacienteTable.css';
import StatusBadge from '../StatusBadge/StatusBadge';
import PacienteActionMenu from './PacienteActionMenu';

const PacienteTable = ({ pacientes = [], onPacienteDeleted }) => {
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
          {pacientes.length > 0 ? (
            pacientes.map((paciente) => (
              <tr key={paciente.id}>
                <td>{paciente.id}</td>
                <td>{paciente.nome}</td>
                <td>{paciente.telefone}</td>
                <td>{paciente.email}</td>
                <td>{paciente.dataNascimento}</td>
                <td>{paciente.ultimoServico}</td>
                <td>
                  <StatusBadge status={paciente.isActive !== undefined ? paciente.isActive : paciente.status} />
                </td>
                <td>
                  <PacienteActionMenu 
                    pacienteId={paciente.id} 
                    onPacienteDeleted={onPacienteDeleted}
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