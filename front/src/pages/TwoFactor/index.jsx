import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';
import TwoFactorCard from '../../components/TwoFactorCard';
import api from '../../axios-config';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './styles.css';

const TwoFactorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Verificar se há dados do login anterior
  const email = location.state?.email;
  
  // Redirecionar se não houver dados válidos
  React.useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  const handleVerifyCode = async (totpCode) => {
    try {
      const params = new URLSearchParams();
      params.append('totpCode', totpCode);
      
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
        
        toast.success('Login realizado com sucesso!', {
          position: "top-right",
          autoClose: 3000
        });
        
        navigate('/protetico');
      } else {
        throw new Error(response.data.message || 'Código inválido');
      }
    } catch (error) {
      console.error('Erro na verificação 2FA:', error);
      
      let errorMessage = 'Código inválido. Tente novamente.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        
        // Se a sessão expirou, redirecionar para login
        if (errorMessage.includes('Sessão expirada') || errorMessage.includes('Dados de autenticação não encontrados')) {
          toast.error(errorMessage);
          navigate('/login', { replace: true });
          return;
        }
      } else if (error.message) {
        errorMessage = error.message;
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