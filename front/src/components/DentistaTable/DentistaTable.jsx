import React from 'react';
import './DentistaTable.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ActionMenuDentista from '../ActionMenuDentista/ActionMenuDentista';
import StatusBadge from '../StatusBadge/StatusBadge';

function DentistaTable({ dentistas, onDentistaDeleted, onStatusChange }) {
  const navigate = useNavigate();

  const handleStatusChange = async (dentistaId, newStatus) => {
    try {
      await axios.patch(`http://localhost:8080/dentistas/${dentistaId}`, {
        isActive: newStatus
      });
      
      onStatusChange(dentistaId, newStatus ? 'ATIVO' : 'INATIVO');
      toast.success(`Dentista ${newStatus ? 'ativado' : 'inativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status. Tente novamente.');
    }
  };

  return (
    <div className="dentista-table-container">
      <table className="dentista-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>CRO</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {dentistas.length > 0 ? (
            dentistas.map((dentista) => (
              <tr key={dentista.id}>
                <td>{dentista.id}</td>
                <td>{dentista.nome}</td>
                <td>{dentista.cro}</td>
                <td>{dentista.email}</td>
                <td>{dentista.telefone}</td>
                <td>
                  <StatusBadge
                    status={dentista.isActive === 'ATIVO'}
                    onClick={(newStatus) => handleStatusChange(dentista.id, newStatus)}
                  />
                </td>
                <td>
                  <ActionMenuDentista 
                    dentistaId={dentista.id} 
                    onDentistaDeleted={onDentistaDeleted}
                    isActive={dentista.isActive === 'ATIVO'}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="empty-row"></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DentistaTable; 