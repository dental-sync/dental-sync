import React, { useState } from 'react';
import './ExpandableClinicaTable.css';
import ActionMenuClinica from '../ActionMenuClinica/ActionMenuClinica';
import api from '../../axios-config';
import { toast } from 'react-toastify';

// Função utilitária para formatar o ID da clínica
const formatClinicaId = (id) => `C${String(id).padStart(4, '0')}`;

// Função utilitária para formatar o ID do dentista
const formatDentistaId = (id) => `D${String(id).padStart(4, '0')}`;

const ExpandableClinicaTable = ({ 
  clinicas, 
  onClinicaDeleted, 
  sortConfig, 
  onSort, 
  isEmpty 
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [dentistasByClinica, setDentistasByClinica] = useState({});
  const [loadingDentistas, setLoadingDentistas] = useState(new Set());

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

  const handleRowClick = async (clinicaId) => {
    const newExpandedRows = new Set(expandedRows);
    
    if (expandedRows.has(clinicaId)) {
      // Se já está expandido, colapsar
      newExpandedRows.delete(clinicaId);
    } else {
      // Se não está expandido, expandir e carregar dentistas
      newExpandedRows.add(clinicaId);
      
      // Carregar dentistas se ainda não foram carregados
      if (!dentistasByClinica[clinicaId]) {
        setLoadingDentistas(prev => new Set(prev).add(clinicaId));
        
        try {
          const response = await api.get(`/clinicas/${clinicaId}/dentistas`);
          setDentistasByClinica(prev => ({
            ...prev,
            [clinicaId]: response.data
          }));
        } catch (error) {
          console.error('Erro ao carregar dentistas:', error);
          toast.error('Erro ao carregar dentistas da clínica');
          newExpandedRows.delete(clinicaId); // Remove da expansão se houve erro
        } finally {
          setLoadingDentistas(prev => {
            const newSet = new Set(prev);
            newSet.delete(clinicaId);
            return newSet;
          });
        }
      }
    }
    
    setExpandedRows(newExpandedRows);
  };

  if (isEmpty) {
    return (
      <div className="expandable-clinica-table-container empty">
        <div className="empty-table-message-absolute">
          Nenhuma clínica cadastrada
        </div>
      </div>
    );
  }

  return (
    <div className="expandable-clinica-table-container">
      <table className="expandable-clinica-table">
        <thead>
          <tr>
            <th 
              className="sortable-header"
              data-sortable="true"
              data-column="id"
              onClick={() => onSort('id')}
            >
              <span className="sortable-content">
                ID
                <div className="sort-icon">{getSortIcon('id')}</div>
              </span>
            </th>
            <th 
              className="sortable-header"
              data-sortable="true"
              data-column="nome"
              onClick={() => onSort('nome')}
            >
              <span className="sortable-content">
                Nome
                <div className="sort-icon">{getSortIcon('nome')}</div>
              </span>
            </th>
            <th data-column="cnpj">CNPJ</th>
            <th data-column="actions">Ações</th>
          </tr>
        </thead>
        <tbody>
          {clinicas.map((clinica) => (
            <React.Fragment key={clinica.id}>
              {/* Linha principal da clínica */}
              <tr className="clinica-row">
                <td data-column="id" className="id-with-expand">
                  <div className="id-expand-container">
                    <button
                      className="expand-button"
                      onClick={() => handleRowClick(clinica.id)}
                      aria-expanded={expandedRows.has(clinica.id)}
                    >
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        style={{
                          transform: expandedRows.has(clinica.id) ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }}
                      >
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </button>
                    <span className="clinica-id">{formatClinicaId(clinica.id)}</span>
                  </div>
                </td>
                <td data-column="nome">{clinica.nome}</td>
                <td data-column="cnpj">{clinica.cnpj}</td>
                <td data-column="actions">
                  <ActionMenuClinica 
                    itemId={clinica.id} 
                    onItemDeleted={onClinicaDeleted}
                    clinicaId={clinica.id}
                  />
                </td>
              </tr>
              
              {/* Linha expandida com dentistas */}
              {expandedRows.has(clinica.id) && (
                <tr className="expanded-row">
                  <td colSpan="4" className="expanded-content">
                    <div className="dentistas-container">
                      <h4 className="dentistas-title">Dentistas Vinculados</h4>
                      {loadingDentistas.has(clinica.id) ? (
                        <div className="loading-dentistas">Carregando...</div>
                      ) : (
                        <div className="dentistas-list">
                          {dentistasByClinica[clinica.id]?.length > 0 ? (
                            <table className="dentistas-table">
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Nome</th>
                                  <th>CRO</th>
                                  <th>E-mail</th>
                                  <th>Telefone</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dentistasByClinica[clinica.id].map((dentista) => (
                                  <tr key={dentista.id} className="dentista-row">
                                    <td className="dentista-id-cell">
                                      <span className="dentista-id-badge">{formatDentistaId(dentista.id)}</span>
                                    </td>
                                    <td className="dentista-nome-cell" title={dentista.nome}>
                                      {dentista.nome}
                                    </td>
                                    <td className="dentista-cro-cell">{dentista.cro}</td>
                                    <td className="dentista-email-cell" title={dentista.email}>
                                      {dentista.email}
                                    </td>
                                    <td className="dentista-telefone-cell">{dentista.telefone}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="no-dentistas">
                              Nenhum dentista vinculado
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpandableClinicaTable; 