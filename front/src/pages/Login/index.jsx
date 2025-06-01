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
      params.append('rememberMe', formData.rememberMe);
      
      const response = await api.post('/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      // Verificar se o login foi bem-sucedido
      if (response.data.success) {
        // Verificar se requer 2FA
        if (response.data.requiresTwoFactor) {
          // Redirecionar para página de 2FA
          navigate('/two-factor', { 
            state: { 
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
          rememberMe: response.data.rememberMe,
          sessionDuration: response.data.sessionDuration
        };
        
        login(userData);
        
        // Mostrar duração da sessão se "Lembrar de mim" estiver marcado
        if (formData.rememberMe) {
          console.log(`Sessão configurada para: ${response.data.sessionDuration}`);
        }
        
        navigate('/protetico');
      } else {
        alert(response.data.message || 'Erro no login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.response) {
        // Erro da API
        const errorMessage = error.response.data?.message || 'Usuário ou senha inválidos!';
        alert(errorMessage);
      } else {
        // Erro de rede ou outro
        alert('Erro de conexão. Tente novamente.');
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