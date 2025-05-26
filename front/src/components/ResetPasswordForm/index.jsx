import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PasswordInput from '../PasswordInput';
import './styles.css';

const ResetPasswordForm = ({ onSubmit, loading, message }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({ password, confirmPassword });
  };

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
          onChange={e => setPassword(e.target.value)}
          placeholder="Nova senha"
        />
      </div>
      <div className="reset-group">
        <label htmlFor="confirmPassword" className="reset-label">Confirmar nova senha</label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Confirmar nova senha"
        />
      </div>
      {message && <div className="reset-message">{message}</div>}
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