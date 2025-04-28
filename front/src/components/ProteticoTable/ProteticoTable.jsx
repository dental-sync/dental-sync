import React, { useState } from 'react';
import './ProteticoTable.css';
import StatusBadge from '../StatusBadge/StatusBadge';
import ActionMenu from '../ActionMenu/ActionMenu';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProteticoTable = ({ proteticos = [], onStatusChange }) => {
  const [proteticosState, setProteticosState] = useState(proteticos);

  // Atualizar o estado local quando as props mudarem
  React.useEffect(() => {
    setProteticosState(proteticos);
  }, [proteticos]);

  const handleStatusChange = (proteticoId, newStatus) => {
    setProteticosState(prevState => 
      prevState.map(protetico => 
        protetico.id === proteticoId 
          ? { ...protetico, status: newStatus ? 'ATIVO' : 'INATIVO' } 
          : protetico
      )
    );
    
    // Notificar o componente pai sobre a mudança
    if (onStatusChange) {
      onStatusChange(proteticoId, newStatus);
    }
  };
  
  const handleStatusClick = async (proteticoId, newStatus) => {
    try {
      console.log(`Atualizando status do protético ${proteticoId} para ${newStatus ? 'Ativo' : 'Inativo'}`);
      
      // Verificar o formato do corpo da requisição
      const requestBody = { isActive: newStatus };
      console.log('Corpo da requisição:', JSON.stringify(requestBody));
      
      const response = await axios.patch(`http://localhost:8080/proteticos/${proteticoId}`, requestBody);
      
      console.log('Resposta da API:', response);
      
      if (response.status === 200) {
        handleStatusChange(proteticoId, newStatus);
        toast.success(`Status atualizado com sucesso para ${newStatus ? 'Ativo' : 'Inativo'}`);
      }
    } catch (error) {
      console.error('Erro ao alterar status do protético:', error);
      toast.error('Erro ao alterar status. Tente novamente.');
    }
  };

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
          {proteticosState.length > 0 ? (
            proteticosState.map((protetico) => (
              <tr key={protetico.id}>
                <td>{protetico.id}</td>
                <td>{protetico.nome}</td>
                <td>{protetico.cro}</td>
                <td>{protetico.cargo}</td>
                <td>{protetico.telefone}</td>
                <td>
                  <StatusBadge 
                    status={protetico.status} 
                    onClick={(newStatus) => handleStatusClick(protetico.id, newStatus)}
                  />
                </td>
                <td>
                  <ActionMenu 
                    proteticoId={protetico.id} 
                    proteticoStatus={protetico.status}
                    onStatusChange={handleStatusChange}
                  />
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