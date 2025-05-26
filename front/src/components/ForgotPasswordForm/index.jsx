import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './styles.css';

const ForgotPasswordForm = ({ onSubmit, loading, message }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(email);
  };

  return (
    <form className="forgot-form" onSubmit={handleSubmit}>
      <h2 className="forgot-title">Recuperar senha</h2>
      <p className="forgot-subtitle">Informe seu e-mail para receber instruções de recuperação</p>
      <div className="forgot-group">
        <label htmlFor="email" className="forgot-label">E-mail</label>
        <div className="forgot-input-container">
          <span className="forgot-input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </span>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>
      </div>
      {message && <div className="forgot-message">{message}</div>}
      <button type="submit" className="forgot-btn" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar instruções'}
      </button>
      <div className="forgot-link-container">
        <Link to="/login" className="forgot-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 2}}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar para o login
        </Link>
      </div>
    </form>
  );
};

export default ForgotPasswordForm; 