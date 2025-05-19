import React from 'react';
import './styles.css';

const FormSection = ({ title, children }) => {
  return (
    <div className="form-section">
      {title && <h3 className="form-section-title">{title}</h3>}
      <div className="form-section-content">
        {children}
      </div>
    </div>
  );
};

export default FormSection; 