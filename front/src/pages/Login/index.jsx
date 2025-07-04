import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthLayout from '../../components/AuthLayout';
import LoginCard from '../../components/LoginCard';
import './styles.css';
import api from '../../axios-config';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (formData) => {
    setLoading(true);
    try {
      // Spring Security espera username e password
      const params = new URLSearchParams();
      params.append('username', formData.email);
      params.append('password', formData.senha);
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
        
      navigate('/kanban');
      } else {
        toast.error(response.data.message || 'Erro no login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.response) {
        // Erro da API
        const errorMessage = error.response.data?.message || 'Usuário ou senha inválidos!';
        toast.error(errorMessage);
      } else {
        // Erro de rede ou outro
        toast.error('Erro de conexão. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <LoginCard onSubmit={handleLogin} loading={loading} />
    </AuthLayout>
  );
};

export default LoginPage; 