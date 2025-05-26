import React from 'react';
import './styles.css';

const ChartContainer = ({ title, subtitle, children, className = '' }) => {
  return (
    <div className={`chart-container ${className}`}>
      <div className="chart-header">
        <div>
          <h3 className="chart-title">{title}</h3>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="chart-content">
        {children}
      </div>
    </div>
  );
};

export default ChartContainer; 