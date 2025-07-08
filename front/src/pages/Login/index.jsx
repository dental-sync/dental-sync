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
        // Erro da API - tentar extrair a mensagem específica
        let errorMessage = 'Usuário ou senha inválidos!'; // mensagem padrão
        
        if (error.response.data) {
          // Se a resposta tem uma propriedade message
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
          // Se a resposta é uma string diretamente
          else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          }
          // Se há erro específico em outras propriedades
          else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        }
        
        toast.error(errorMessage);
      } else if (error.request) {
        // Erro de rede - sem resposta do servidor
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        // Outros tipos de erro
        toast.error('Erro inesperado. Tente novamente.');
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