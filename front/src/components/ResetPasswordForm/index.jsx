import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PasswordInput from '../PasswordInput';
import './styles.css';

const SuccessMessage = () => (
  <div className="reset-success-container">
    <div className="reset-success-icon">✅</div>
    <h2 className="reset-title">Senha Redefinida!</h2>
    <p className="reset-subtitle">Sua senha foi alterada com sucesso</p>
    <div className="reset-success-message">
      Você será redirecionado para a página de login em instantes.
    </div>
    <div className="reset-link-container">
      <Link to="/login" className="reset-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 2}}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Ir para o login
      </Link>
    </div>
  </div>
);

const ResetPasswordForm = ({ onSubmit, loading, success }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = 'Nova senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit && onSubmit({ password, confirmPassword });
    }
  };

  if (success) {
    return <SuccessMessage />;
  }

  return (
    <form className="reset-form" onSubmit={handleSubmit}>
      <h2 className="reset-title">Redefinir senha</h2>
      <p className="reset-subtitle">Crie uma nova senha para sua conta</p>
      
      <div className="reset-group">
        <label htmlFor="password" className="reset-label">Nova senha</label>
        <PasswordInput
          id="password"
          name="password"
          value={password}
          onChange={e => {
            setPassword(e.target.value);
            if (errors.password) setErrors(prev => ({ ...prev, password: null }));
          }}
          placeholder="Nova senha"
          disabled={loading}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="reset-field-error">{errors.password}</span>}
      </div>
      
      <div className="reset-group">
        <label htmlFor="confirmPassword" className="reset-label">Confirmar nova senha</label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={e => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: null }));
          }}
          placeholder="Confirmar nova senha"
          disabled={loading}
          className={errors.confirmPassword ? 'error' : ''}
        />
        {errors.confirmPassword && <span className="reset-field-error">{errors.confirmPassword}</span>}
      </div>
      
      <button type="submit" className="reset-btn" disabled={loading}>
        {loading ? 'Redefinindo...' : 'Redefinir senha'}
      </button>
      
      <div className="reset-link-container">
        <Link to="/login" className="reset-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 2}}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar para o login
        </Link>
      </div>
    </form>
  );
};

export default ResetPasswordForm; 