import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';
import TwoFactorCard from '../../components/TwoFactorCard';
import api from '../../axios-config';
import { useAuth } from '../../contexts/AuthContext';
import useToast from '../../hooks/useToast';
import './styles.css';

const TwoFactorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();
  
  // Verificar se há dados do login anterior
  const email = location.state?.email;
  
  // Redirecionar se não houver dados válidos
  React.useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  const handleVerifyCode = async (totpCode, trustThisDevice = false) => {
    try {
      const params = new URLSearchParams();
      params.append('totpCode', totpCode);
      params.append('trustThisDevice', trustThisDevice);
      
      const response = await api.post('/login/verify-2fa', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      if (response.data.success) {
        const userData = {
          email: email,
          ...response.data.user,
          rememberMe: response.data.rememberMe,
          sessionDuration: response.data.sessionDuration
        };
        
        login(userData);
        
        let successMessage = 'Login realizado com sucesso!';
        if (trustThisDevice) {
          successMessage += ' Dispositivo será lembrado por 10 minutos.';
        }
        
        toast.success(successMessage, { autoClose: 4000 });
        
        navigate('/protetico');
      } else {
        throw new Error(response.data.message || 'Código inválido');
      }
    } catch (error) {
      console.error('Erro na verificação 2FA:', error);
      
      let errorMessage = 'Código inválido. Tente novamente.'; // mensagem padrão
      
      if (error.response) {
        // Erro da API - tentar extrair a mensagem específica
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
        
        // Se a sessão expirou, redirecionar para login
        if (errorMessage.includes('Sessão expirada') || errorMessage.includes('Dados de autenticação não encontrados')) {
          toast.error(errorMessage);
          navigate('/login', { replace: true });
          return;
        }
      } else if (error.message) {
        // Erro customizado
        errorMessage = error.message;
      } else if (error.request) {
        // Erro de rede - sem resposta do servidor
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const handleBack = () => {
    navigate('/login', { replace: true });
  };

  if (!email) {
    return null; // Ou componente de loading
  }

  return (
    <AuthLayout>
      <TwoFactorCard 
        email={email}
        onSubmit={handleVerifyCode}
        onBack={handleBack}
      />
    </AuthLayout>
  );
};

export default TwoFactorPage; 