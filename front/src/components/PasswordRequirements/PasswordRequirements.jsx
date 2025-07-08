import React from 'react';
import { getPasswordCriteria, validatePassword } from '../../utils/passwordValidator';
import './PasswordRequirements.css';

const PasswordRequirements = ({ password, showRequirements = true }) => {
  const criteria = getPasswordCriteria();
  const errors = validatePassword(password);
  
  if (!showRequirements) {
    return null;
  }

  const isValid = (criterion) => {
    switch (criterion) {
      case 'Pelo menos 8 caracteres':
        return password && password.length >= 8;
      case 'Pelo menos uma letra maiúscula (A-Z)':
        return password && /[A-Z]/.test(password);
      case 'Pelo menos uma letra minúscula (a-z)':
        return password && /[a-z]/.test(password);
      case 'Pelo menos um número (0-9)':
        return password && /[0-9]/.test(password);
      case 'Pelo menos um caractere especial (!@#$%^&*()_+-=[]{}|;\':"\\,.<>?/~`)':
        return password && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?/~`]/.test(password);
      default:
        return false;
    }
  };

  return (
    <div className="password-requirements">
      <div className="requirements-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16v-4"></path>
          <path d="M12 8h.01"></path>
        </svg>
        <span>Requisitos da senha:</span>
      </div>
      <ul className="requirements-list">
        {criteria.map((criterion, index) => (
          <li 
            key={index}
            className={`requirement-item ${isValid(criterion) ? 'valid' : 'invalid'}`}
          >
            <span className="requirement-icon">
              {isValid(criterion) ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              )}
            </span>
            <span className="requirement-text">{criterion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordRequirements; 