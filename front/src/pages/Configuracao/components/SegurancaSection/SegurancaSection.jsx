import React, { useState } from 'react';
import './SegurancaSection.css';

const SegurancaSection = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when field is updated
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'A senha atual é obrigatória';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'A nova senha é obrigatória';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'A senha deve ter pelo menos 8 caracteres';
    } else if (!/[A-Z]/.test(passwordData.newPassword) || 
               !/[a-z]/.test(passwordData.newPassword) || 
               !/[0-9]/.test(passwordData.newPassword) || 
               !/[^A-Za-z0-9]/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'A senha deve incluir letras maiúsculas, minúsculas, números e símbolos';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'A confirmação da senha é obrigatória';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Implementar a lógica para alterar a senha
      console.log('Alterar senha:', passwordData);
      // Aqui você faria uma chamada API para alterar a senha
    }
  };

  return (
    <div className="seguranca-section">
      <div className="section-header">
        <h2>Segurança</h2>
        <p className="section-description">Configure as opções de segurança do sistema</p>
      </div>

      <div className="password-change-section">
        <h3>Alterar Senha</h3>
        
        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Senha Atual</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handleChange}
              className={`form-input ${errors.currentPassword ? 'input-error' : ''}`}
            />
            {errors.currentPassword && <div className="error-message">{errors.currentPassword}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="newPassword">Nova Senha</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleChange}
                className={`form-input ${errors.newPassword ? 'input-error' : ''}`}
              />
              {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
              />
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>
          </div>

          <p className="password-hint">
            A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas,
            minúsculas, números e símbolos.
          </p>

          <div className="form-actions">
            <button type="submit" className="alterar-senha-button">Alterar Senha</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SegurancaSection; 