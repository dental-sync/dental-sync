import React, { useState, useEffect } from 'react';
import './DentistaTable.css';
import { useNavigate } from 'react-router-dom';

const DentistaTable = ({ dentistas, onDentistaDeleted }) => {
  const navigate = useNavigate();
  const [clinicas, setClinicas] = useState([]);
  const [loadingClinicas, setLoadingClinicas] = useState(true);

  useEffect(() => {
    const fetchClinicas = async () => {
      try {
        const response = await fetch('http://localhost:8080/clinicas');
        const data = await response.json();
        setClinicas(data);
      } catch (error) {
        console.error('Erro ao buscar clínicas:', error);
      } finally {
        setLoadingClinicas(false);
      }
    };

    fetchClinicas();
  }, []);

  const handleEdit = (id) => {
    navigate(`/dentista/editar/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este dentista?')) {
      try {
        await fetch(`http://localhost:8080/dentistas/${id}`, {
          method: 'DELETE',
        });
        onDentistaDeleted(id);
      } catch (error) {
        console.error('Erro ao excluir dentista:', error);
        alert('Erro ao excluir dentista. Tente novamente.');
      }
    }
  };

  const handleNovaClinica = () => {
    navigate('/clinica/cadastro');
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
          {dentistas.map((dentista) => (
            <tr key={dentista.id}>
              <td>{dentista.nome}</td>
              <td>{dentista.cro}</td>
              <td>{dentista.email}</td>
              <td>{dentista.telefone}</td>
              <td>
                <div className="clinicas-cell">
                  <select 
                    className="clinicas-select"
                    value={dentista.clinicas}
                    disabled
                  >
                    {loadingClinicas ? (
                      <option>Carregando clínicas...</option>
                    ) : (
                      clinicas.map(clinica => (
                        <option key={clinica.id} value={clinica.id}>
                          {clinica.nome}
                        </option>
                      ))
                    )}
                  </select>
                  <button 
                    className="nova-clinica-button"
                    onClick={handleNovaClinica}
                    title="Cadastrar nova clínica"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
              </td>
              <td>
                <span className={`status-badge status-${dentista.status.toLowerCase()}`}>
                  {dentista.status}
                </span>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DentistaTable; 