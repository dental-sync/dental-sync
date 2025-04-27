import React, { useState } from 'react';
import './DentistaTable.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

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
                  <div className="action-buttons">
                    <button
                      className="action-button edit-button"
                      onClick={() => handleEdit(dentista.id)}
                      title="Editar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      className="action-button delete-button"
                      onClick={() => handleDelete(dentista.id)}
                      title="Excluir"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr className="empty-row">
              <td colSpan="7" className="empty-message">Nenhum dentista encontrado</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DentistaTable; 