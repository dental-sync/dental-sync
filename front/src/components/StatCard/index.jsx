import React from 'react';
import './styles.css';

const StatCard = ({ title, value, description, trend, descriptionOriginal }) => {
  // Determina as classes para a descrição com base na tendência (up, down, neutral)
  const getTrendClass = () => {
    switch(trend) {
      case 'up':
        return 'trend-up';
      case 'down':
        return 'trend-down';
      default:
        return 'trend-neutral';
    }
  };

  // Verifica se a descrição foi truncada para mostrar tooltip
  const temDescricaoTruncada = descriptionOriginal && descriptionOriginal !== description;

  return (
    <div className="stat-card">
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <span className="stat-value">{value}</span>
      </div>
      {description && (
        <p 
          className={`stat-description ${getTrendClass()}`}
          title={temDescricaoTruncada ? descriptionOriginal : undefined}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default StatCard; 