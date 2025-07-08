import React from 'react';
import './styles.css';

const ConfigContainer = ({ children, title }) => {
  return (
    <div className="config-container">
      <h1 className="config-title">{title}</h1>
      {children}
    </div>
  );
};

export default ConfigContainer; 