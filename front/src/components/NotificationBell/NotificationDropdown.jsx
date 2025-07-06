import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../../axios-config';

const NotificationDropdown = ({ 
  baixoEstoque = 0, 
  semEstoque = 0, 
  materiaisBaixoEstoque = [], 
  materiaisSemEstoque = [],
  onClose
}) => {
  const navigate = useNavigate();
  const [materiais, setMateriais] = useState({
    baixoEstoque: [],
    semEstoque: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMateriais();
  }, []);

  const fetchMateriais = async () => {
    setLoading(true);
    try {
      const response = await api.get('/material');
      const todosMateriais = response.data;
      
      const baixoEstoqueList = todosMateriais.filter(material => 
        material.status === 'BAIXO_ESTOQUE'
      );
      
      const semEstoqueList = todosMateriais.filter(material => 
        material.status === 'SEM_ESTOQUE'
      );
      
      setMateriais({
        baixoEstoque: baixoEstoqueList,
        semEstoque: semEstoqueList
      });
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialClick = (materialId, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Fechar o dropdown primeiro
    if (onClose) {
      onClose();
    }
    
    // Navegar usando window.location.href para garantir que funcione
    setTimeout(() => {
      window.location.href = `/material/editar/${materialId}`;
    }, 100);
  };

  const totalMateriais = materiais.baixoEstoque.length + materiais.semEstoque.length;

  // Limitar total de materiais mostrados a 5, priorizando sem estoque
  const getTotalMateriais = () => {
    const maxItens = 5;
    let materiaisParaMostrar = {
      semEstoque: [],
      baixoEstoque: []
    };
    
    // Primeiro, adicionar materiais sem estoque (prioridade)
    if (materiais.semEstoque.length > 0) {
      materiaisParaMostrar.semEstoque = materiais.semEstoque.slice(0, maxItens);
    }
    
    // Depois, adicionar materiais com baixo estoque se ainda tiver espaço
    const restante = maxItens - materiaisParaMostrar.semEstoque.length;
    if (restante > 0 && materiais.baixoEstoque.length > 0) {
      materiaisParaMostrar.baixoEstoque = materiais.baixoEstoque.slice(0, restante);
    }
    
    return materiaisParaMostrar;
  };

  const materiaisParaMostrar = getTotalMateriais();

  const dropdownContent = (
    <div 
      className="notification-dropdown"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="notification-header">
        <h3 className="notification-title">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          Notificações de Estoque
        </h3>
      </div>
      
      <div className="notification-content">
        {loading ? (
          <div className="notification-empty">
            <p>Carregando materiais...</p>
          </div>
        ) : totalMateriais === 0 ? (
          <div className="notification-empty">
            <p>Todos os materiais estão em estoque adequado!</p>
          </div>
        ) : (
          <>
            {materiaisParaMostrar.semEstoque.length > 0 && (
              <div className="notification-section">
                <div className="notification-section-header">
                  <h4 className="notification-section-title sem-estoque">
                    Sem Estoque ({materiais.semEstoque.length})
                  </h4>
                </div>
                <div className="material-list">
                  {materiaisParaMostrar.semEstoque.map((material) => (
                    <div 
                      key={material.id} 
                      className="material-item"
                      onClick={(e) => handleMaterialClick(material.id, e)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="material-info">
                        <span className="material-name">{material.nome}</span>
                        <div className="material-details">
                          <span className="material-quantity">
                            {material.quantidade} {material.unidadeMedida}
                          </span>
                          <span className="material-status sem-estoque">
                            Sem Estoque
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {materiaisParaMostrar.baixoEstoque.length > 0 && (
              <div className="notification-section">
                <div className="notification-section-header">
                  <h4 className="notification-section-title baixo-estoque">
                    Baixo Estoque ({materiais.baixoEstoque.length})
                  </h4>
                </div>
                <div className="material-list">
                  {materiaisParaMostrar.baixoEstoque.map((material) => (
                    <div 
                      key={material.id} 
                      className="material-item"
                      onClick={(e) => handleMaterialClick(material.id, e)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="material-info">
                        <span className="material-name">{material.nome}</span>
                        <div className="material-details">
                          <span className="material-quantity">
                            {material.quantidade} {material.unidadeMedida}
                          </span>
                          <span className="material-status baixo-estoque">
                            Baixo Estoque
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    dropdownContent,
    document.body
  );
};

export default NotificationDropdown; 