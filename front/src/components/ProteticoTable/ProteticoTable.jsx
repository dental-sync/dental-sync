import React from 'react';
import './ProteticoTable.css';
import StatusBadge from '../StatusBadge/StatusBadge';
import ActionMenu from '../ActionMenu/ActionMenu';

const ProteticoTable = ({ proteticos = [] }) => {
  return (
    <div className="table-container">
      <table className="protetico-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>CRO</th>
            <th>Cargo</th>
            <th>Telefone</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {proteticos.length > 0 ? (
            proteticos.map((protetico) => (
              <tr key={protetico.id}>
                <td>{protetico.id}</td>
                <td>{protetico.nome}</td>
                <td>{protetico.cro}</td>
                <td>{protetico.cargo}</td>
                <td>{protetico.telefone}</td>
                <td>
                  <StatusBadge status={protetico.status} />
                </td>
                <td>
                  <ActionMenu proteticoId={protetico.id} />
                </td>
              </tr>
            ))
          ) : (
            <tr className="empty-row">
              <td colSpan="7" className="empty-message">Nenhum protético encontrado</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProteticoTable; 