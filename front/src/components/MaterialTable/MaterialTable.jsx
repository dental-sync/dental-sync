import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MaterialTable.css';
import StatusBadge from '../StatusBadge/StatusBadge';
import MaterialActionMenu from './MaterialActionMenu';

const MaterialTable = ({ materiais, onDelete, onStatusChange, lastElementRef, sortConfig, onSort }) => {
  const navigate = useNavigate();

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
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
    <div className="material-table-container">
      <table className="material-table">
        <thead>
          <tr>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort && onSort('id')}>
              <span className="sortable-content">
                ID
                <div className="sort-icon">{getSortIcon('id')}</div>
              </span>
            </th>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort && onSort('nome')}>
              <span className="sortable-content">
                Nome
                <div className="sort-icon">{getSortIcon('nome')}</div>
              </span>
            </th>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort && onSort('quantidade')}>
              <span className="sortable-content">
                Quantidade
                <div className="sort-icon">{getSortIcon('quantidade')}</div>
              </span>
            </th>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort && onSort('categoriaMaterial.nome')}>
              <span className="sortable-content">
                Categoria
                <div className="sort-icon">{getSortIcon('categoriaMaterial.nome')}</div>
              </span>
            </th>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort && onSort('status')}>
              <span className="sortable-content">
                Status
                <div className="sort-icon">{getSortIcon('status')}</div>
              </span>
            </th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {materiais.map((material, index) => (
            <tr 
              key={material.id}
              ref={index === materiais.length - 1 ? lastElementRef : null}
            >
              <td>{material.id}</td>
              <td>{material.nome}</td>
              <td>{material.quantidade}</td>
              <td>{material.categoriaMaterial?.nome || 'N/A'}</td>
              <td>
                <StatusBadge
                  status={material.status === 'ATIVO'}
                  onClick={(isActive) => onStatusChange(material.id, isActive ? true : false)}
                />
              </td>
              <td>
                <MaterialActionMenu
                  materialId={material.id}
                  materialStatus={material.status}
                  onDelete={onDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaterialTable; 