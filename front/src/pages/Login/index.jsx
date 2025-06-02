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
      const params = new URLSearchParams();
      params.append('username', formData.email);
      params.append('password', formData.password);
      params.append('rememberMe', formData.rememberMe);
      
      const response = await api.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      if (response.data.success) {
        if (response.data.requiresTwoFactor) {
          // Redirecionar para página de 2FA
          navigate('/two-factor', { 
            state: { 
              tempAuthId: response.data.tempAuthId,
              email: response.data.email 
            },
            replace: true 
          });
          return;
        }
        
        // Login normal sem 2FA
        const userData = {
          email: formData.email,
          ...response.data.user,
          rememberMe: response.data.rememberMe
        };
        
        login(userData, response.data.accessToken, response.data.refreshToken);
        
        navigate('/protetico');
      } else {
        alert(response.data.message || 'Erro no login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Erro ao fazer login. Tente novamente.');
      }
    }
  };

  return (
    <AuthLayout>
      <LoginCard onSubmit={handleLogin} />
    </AuthLayout>
  );
};

export default LoginPage; 