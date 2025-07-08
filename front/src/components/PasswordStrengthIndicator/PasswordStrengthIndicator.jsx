import React from 'react';
import { getPasswordStrengthLevel, getPasswordStrengthText, getPasswordStrengthColor } from '../../utils/passwordValidator';
import './PasswordStrengthIndicator.css';

const PasswordStrengthIndicator = ({ password, showIndicator = true }) => {
  if (!showIndicator || !password) {
    return null;
  }

  const strengthLevel = getPasswordStrengthLevel(password);
  const strengthText = getPasswordStrengthText(strengthLevel);
  const strengthColor = getPasswordStrengthColor(strengthLevel);

  return (
    <div className="password-strength-indicator">
      <div className="strength-label">
        <span>Força da senha:</span>
        <span 
          className="strength-text"
          style={{ color: strengthColor }}
        >
          {strengthText}
        </span>
      </div>
      
      <div className="strength-bars">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`strength-bar ${strengthLevel >= level ? 'active' : ''}`}
            style={{
              backgroundColor: strengthLevel >= level ? strengthColor : '#e9ecef'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator; 