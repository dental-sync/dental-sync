import React from 'react';
import './FieldValidation.css';

const FieldValidation = ({ errors, isValid, showValidation = true }) => {
  if (!showValidation || (!errors && isValid === undefined)) {
    return null;
  }

  // Se há erros, mostrar apenas o primeiro erro
  if (errors && errors.length > 0) {
    return (
      <div className="field-validation error">
        <span className="validation-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </span>
        <span className="validation-text">{errors[0]}</span>
      </div>
    );
  }

  // Se é válido, mostrar indicador de sucesso
  if (isValid) {
    return (
      <div className="field-validation success">
        <span className="validation-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="16,8 10,14 8,12"></polyline>
          </svg>
        </span>
        <span className="validation-text">Válido</span>
      </div>
    );
  }

  return null;
};

export default FieldValidation; 