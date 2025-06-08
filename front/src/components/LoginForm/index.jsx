import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PasswordInput from '../PasswordInput';
import EmailInput from '../EmailInput';
import './styles.css';

const LoginForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Validar email
    if (!formData.email.trim()) {
      toast.error('O email é obrigatório');
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.com$/.test(formData.email)) {
      toast.error('Formato de email inválido. O email deve terminar com .com');
      return false;
    }
    
    // Validar senha
    if (!formData.senha) {
      toast.error('A senha é obrigatória');
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

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="email" className="required">Email</label>
        <EmailInput
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="seu.email@exemplo.com"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="senha" className="required">Senha</label>
        <PasswordInput
          id="senha"
          name="senha"
          value={formData.senha}
          onChange={handleChange}
          placeholder="Sua senha"
          required
        />
      </div>
      
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
};

export default LoginForm; 