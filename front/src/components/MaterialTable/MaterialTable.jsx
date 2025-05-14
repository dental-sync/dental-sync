import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MaterialTable.css';
import StatusBadge from '../StatusBadge/StatusBadge';
import MaterialActionMenu from './MaterialActionMenu';

const MaterialTable = ({ materiais, onDelete, onStatusChange, lastElementRef }) => {
  const navigate = useNavigate();

  return (
    <div className="material-table-container">
      <table className="material-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            {/* <th>Descrição</th> */}
            <th>Quantidade</th>
            <th>Categoria</th>
            <th>Status</th>
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
              {/* <td>{material.descricao}</td> */}
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