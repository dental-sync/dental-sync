import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';
import LoginCard from '../../components/LoginCard';
import './styles.css';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = (formData) => {
    console.log('Login attempt:', formData);
    // Implementar autenticação aqui
    // Por enquanto, vamos apenas redirecionar para o dashboard
    navigate('/dashboard');
  };

  return (
    <AuthLayout>
      <LoginCard onSubmit={handleLogin} />
    </AuthLayout>
  );
};

export default LoginPage; 