import React, { useState } from 'react';
import './ServicosTooltip.css';

const ServicosTooltip = ({ servicos, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="servicos-tooltip-container"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && servicos.length > 1 && (
        <div className="servicos-tooltip">
          <div className="servicos-tooltip-content">
            <div className="servicos-tooltip-title">Todos os serviços:</div>
            {servicos.map((servico, index) => (
              <div key={index} className="servicos-tooltip-item">
                {servico}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicosTooltip; 