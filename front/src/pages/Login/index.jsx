import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';
import LoginCard from '../../components/LoginCard';
import './styles.css';
import api from '../../axios-config';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (formData) => {
    try {
      // Spring Security espera username e password
      const params = new URLSearchParams();
      params.append('username', formData.email);
      params.append('password', formData.password);
      const response = await api.post('/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      // Se chegou até aqui, login foi bem-sucedido
      const userData = {
        email: formData.email,
        // Outras informações do usuário podem ser obtidas de response.data
      };
      
      login(userData);
      navigate('/protetico');
    } catch (error) {
      alert('Usuário ou senha inválidos!');
    }
  };

  return (
    <AuthLayout>
      <LoginCard onSubmit={handleLogin} />
    </AuthLayout>
  );
};

export default LoginPage; 