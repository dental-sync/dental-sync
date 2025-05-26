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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
        />
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
        />
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