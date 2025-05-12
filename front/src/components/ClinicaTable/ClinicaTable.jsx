import React from 'react';
import './ClinicaTable.css';
import { useNavigate } from 'react-router-dom';
import ActionMenuClinica from '../ActionMenuClinica/ActionMenuClinica';

// Função utilitária para formatar o ID
const formatClinicaId = (id) => `C${String(id).padStart(4, '0')}`;

const ClinicaTable = ({ clinicas, onClinicaDeleted, sortConfig, onSort, isEmpty }) => {
  const navigate = useNavigate();

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <span style={{fontSize: '18px', opacity: 0.4, marginLeft: '2px', marginTop: '-2px'}}>–</span>
      );
    }
    return sortConfig.direction === 'ascending' ? (
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
    <div className={`clinica-table-container${isEmpty ? ' empty' : ''}`}>
      <table className="clinica-table">
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
            <th>CNPJ</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {isEmpty ? null : clinicas.length > 0 ? (
            clinicas.map((clinica) => (
              <tr key={clinica.id}>
                <td>{formatClinicaId(clinica.id)}</td>
                <td>{clinica.nome}</td>
                <td>{clinica.cnpj}</td>
                <td>
                  <ActionMenuClinica 
                    clinicaId={clinica.id} 
                    onClinicaDeleted={onClinicaDeleted}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="empty-row"></td>
            </tr>
          )}
        </tbody>
      </table>
      {isEmpty && (
        <div className="empty-table-message-absolute">
          Nenhuma clínica cadastrada
        </div>
      )}
    </div>
  );
}

export default ClinicaTable; 