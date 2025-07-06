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
  const [expandedSections, setExpandedSections] = useState({
    semEstoque: false,
    baixoEstoque: false
  });

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

  const handleToggleSection = (section, event) => {
    event.stopPropagation();
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const totalMateriais = materiais.baixoEstoque.length + materiais.semEstoque.length;

  // Função para obter materiais a serem exibidos - sempre todos quando expandido
  const getMaterialsToShow = (section) => {
    return materiais[section]; // Mostrar todos quando expandido
  };

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
            {materiais.semEstoque.length > 0 && (
              <div className="notification-section">
                <div 
                  className="notification-section-header"
                  onClick={(e) => handleToggleSection('semEstoque', e)}
                  style={{ cursor: 'pointer' }}
                >
                  <h4 className="notification-section-title sem-estoque">
                    <svg 
                      className={`expand-icon ${expandedSections.semEstoque ? 'expanded' : ''}`}
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                    Sem Estoque ({materiais.semEstoque.length})
                    {!expandedSections.semEstoque && (
                      <span className="more-items-indicator">{materiais.semEstoque.length}</span>
                    )}
                  </h4>
                </div>
                {expandedSections.semEstoque && (
                  <div className="material-list">
                    {getMaterialsToShow('semEstoque').map((material) => (
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
                )}
              </div>
            )}
            
            {materiais.baixoEstoque.length > 0 && (
              <div className="notification-section">
                <div 
                  className="notification-section-header"
                  onClick={(e) => handleToggleSection('baixoEstoque', e)}
                  style={{ cursor: 'pointer' }}
                >
                  <h4 className="notification-section-title baixo-estoque">
                    <svg 
                      className={`expand-icon ${expandedSections.baixoEstoque ? 'expanded' : ''}`}
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                    Baixo Estoque ({materiais.baixoEstoque.length})
                    {!expandedSections.baixoEstoque && (
                      <span className="more-items-indicator">{materiais.baixoEstoque.length}</span>
                    )}
                  </h4>
                </div>
                {expandedSections.baixoEstoque && (
                  <div className="material-list">
                    {getMaterialsToShow('baixoEstoque').map((material) => (
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
                )}
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