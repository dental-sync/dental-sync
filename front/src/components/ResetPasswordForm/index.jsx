import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
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
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Validar senha
    if (!formData.password) {
      toast.error('A nova senha é obrigatória');
      return false;
    } else if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    
    // Validar confirmação de senha
    if (!formData.confirmPassword) {
      toast.error('Confirme sua nova senha');
      return false;
    } else if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (success) {
    return <SuccessMessage />;
  }

  return (
    <form className="reset-password-form" onSubmit={handleSubmit}>
      <h2 className="reset-title">Redefinir senha</h2>
      <p className="reset-subtitle">Crie uma nova senha para sua conta</p>
      
      <div className="form-group">
        <label htmlFor="password" className="required">Nova Senha</label>
        <PasswordInput
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Crie uma nova senha"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="confirmPassword" className="required">Confirmar Nova Senha</label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirme sua nova senha"
          required
        />
      </div>
      
      <button type="submit" className="btn-primary" disabled={loading}>
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