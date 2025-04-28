import React, { useState, useEffect } from 'react';
import './ProteticoTable.css';
import StatusBadge from '../StatusBadge/StatusBadge';
import ActionMenu from '../ActionMenu/ActionMenu';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProteticoTable = ({ proteticos = [], onStatusChange, lastProteticoRef }) => {
  const [localProteticos, setLocalProteticos] = useState(proteticos);

  useEffect(() => {
    setLocalProteticos(proteticos);
  }, [proteticos]);

  const handleStatusChange = async (id, currentStatus) => {
    const novoStatus = currentStatus === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    
    // Atualizar status localmente para feedback imediato
    const updatedProteticos = localProteticos.map(p => 
      p.id === id ? { ...p, status: novoStatus } : p
    );
    
    setLocalProteticos(updatedProteticos);
    
    // Notificar componente pai sobre mudança
    if (onStatusChange) {
      onStatusChange(id, novoStatus === 'ATIVO');
    }
  };

  const handleStatusClick = async (id, currentStatus) => {
    const isCurrentlyActive = currentStatus === 'ATIVO';
    const newStatus = !isCurrentlyActive;
    
    try {
      await axios.patch(
        `http://localhost:8080/proteticos/${id}`, 
        { isActive: newStatus }
      );
      
      toast.success(`Protético ${newStatus ? 'ativado' : 'desativado'} com sucesso!`);
      handleStatusChange(id, currentStatus);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      
      // Restaurar status anterior em caso de erro
      setLocalProteticos(prev => prev.map(p => 
        p.id === id ? { ...p, status: currentStatus } : p
      ));
      
      toast.error(`Erro ao ${isCurrentlyActive ? 'desativar' : 'ativar'} protético. Tente novamente.`);
    }
  };

  if (!localProteticos || localProteticos.length === 0) {
    return (
      <div className="protetico-table-empty">
        <p>Nenhum protético cadastrado.</p>
      </div>
    );
  }

  return (
    <div className="protetico-table-container">
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
          {localProteticos.map((protetico, index) => {
            // Determine se este é o último item para aplicar a ref de observação
            const isLastItem = index === localProteticos.length - 1;
            
            return (
              <tr key={protetico.id} ref={isLastItem ? lastProteticoRef : null}>
                <td>{protetico.id}</td>
                <td className="protetico-name">{protetico.nome}</td>
                <td>{protetico.cro}</td>
                <td>{protetico.cargo}</td>
                <td>{protetico.telefone}</td>
                <td>
                  <StatusBadge 
                    status={protetico.status} 
                    onClick={(newStatus) => handleStatusClick(protetico.id, protetico.status)}
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProteticoTable; 