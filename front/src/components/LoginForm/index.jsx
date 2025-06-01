import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PasswordInput from '../PasswordInput';
import EmailInput from '../EmailInput';
import './styles.css';

const LoginForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Validar senha
    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="email" className="form-label">E-mail</label>
        <EmailInput
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="seu@email.com"
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-message" style={{color: 'red', fontSize: '12px'}}>{errors.email}</span>}
      </div>

      <div className="form-group">
        <div className="form-label-row">
          <label htmlFor="password" className="form-label">Senha</label>
          <Link to="/esqueci-senha" className="forgot-password-link">
            Esqueceu a senha?
          </Link>
        </div>
        <PasswordInput
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Senha"
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="error-message" style={{color: 'red', fontSize: '12px'}}>{errors.password}</span>}
      </div>

      <div className="form-options">
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="checkbox-input"
          />
          <label htmlFor="rememberMe" className="checkbox-label">Lembrar de mim</label>
        </div>
      </div>

      <button type="submit" className="login-button">
        Entrar
      </button>

      <div className="register-link-container">
        <span>Não tem uma conta?</span>
        <Link to="/registre-se" className="register-link">
          Registre-se
        </Link>
      </div>
    </form>
  );
};

export default LoginForm; 