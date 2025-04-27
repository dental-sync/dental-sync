import React, { useState } from 'react';
import './DentistaTable.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ActionMenuDentista from '../ActionMenuDentista/ActionMenuDentista';

const DentistaTable = ({ dentistas, onDentistaDeleted, onStatusChange }) => {
  const navigate = useNavigate();
  const [showStatusDropdown, setShowStatusDropdown] = useState(null);

  const handleEdit = (id) => {
    navigate(`/dentista/editar/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este dentista?')) {
      try {
        await axios.delete(`http://localhost:8080/dentistas/${id}`);
        onDentistaDeleted(id);
        toast.success('Dentista excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir dentista:', error);
        toast.error('Erro ao excluir dentista. Tente novamente.');
      }
    }
  };

  const handleStatusClick = (id) => {
    setShowStatusDropdown(showStatusDropdown === id ? null : id);
  };

  const handleStatusChange = async (dentistaId, newStatus) => {
    try {
      // Converte o status de string para booleano
      const statusBoolean = newStatus === 'ATIVO';
      
      await axios.patch(`http://localhost:8080/dentistas/${dentistaId}`, {
        status: statusBoolean
      });
      
      // Atualiza o estado local com o novo status em string
      onStatusChange(dentistaId, newStatus);
      setShowStatusDropdown(null);
      
      // Mostra mensagem de sucesso
      toast.success(`Dentista ${newStatus.toLowerCase()} com sucesso!`);
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
            <th>Nome</th>
            <th>CRO</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Clínicas</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {dentistas.length > 0 ? (
            dentistas.map((dentista) => (
              <tr key={dentista.id}>
                <td>{dentista.nome}</td>
                <td>{dentista.cro}</td>
                <td>{dentista.email}</td>
                <td>{dentista.telefone}</td>
                <td>
                  <div className="clinicas-cell">
                    {dentista.clinicas && Array.isArray(dentista.clinicas) && dentista.clinicas.length > 0 ? (
                      dentista.clinicas.map(clinica => (
                        <span key={clinica.id} className="clinica-tag">
                          {clinica.nome}
                        </span>
                      ))
                    ) : (
                      <span className="no-clinicas">Nenhuma clínica associada</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="status-container">
                    <button
                      className={`status-badge status-${dentista.status.toLowerCase()}`}
                      onClick={() => handleStatusClick(dentista.id)}
                    >
                      {dentista.status}
                    </button>
                    {showStatusDropdown === dentista.id && (
                      <div className="status-dropdown">
                        <button
                          className={`status-option ${dentista.status === 'ATIVO' ? 'active' : ''}`}
                          onClick={() => handleStatusChange(dentista.id, 'ATIVO')}
                        >
                          Ativo
                        </button>
                        <button
                          className={`status-option ${dentista.status === 'INATIVO' ? 'active' : ''}`}
                          onClick={() => handleStatusChange(dentista.id, 'INATIVO')}
                        >
                          Inativo
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <ActionMenuDentista dentistaId={dentista.id} onDentistaDeleted={onDentistaDeleted} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="empty-row">Nenhum dentista encontrado</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DentistaTable; 