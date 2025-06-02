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
  const tempAuthId = location.state?.tempAuthId;
  const email = location.state?.email;
  
  // Redirecionar se não houver dados válidos
  React.useEffect(() => {
    if (!tempAuthId || !email) {
      navigate('/login', { replace: true });
    }
  }, [tempAuthId, email, navigate]);

  const handleVerifyCode = async (totpCode, trustThisDevice = false) => {
    try {
      const params = new URLSearchParams();
      params.append('tempAuthId', tempAuthId);
      params.append('totpCode', totpCode);
      params.append('trustThisDevice', trustThisDevice);
      
      const response = await api.post('/auth/verify-2fa', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      if (response.data.success) {
        const userData = {
          email: email,
          ...response.data.user,
          rememberMe: response.data.rememberMe
        };
        
        login(userData, response.data.accessToken, response.data.refreshToken);
        
        let successMessage = 'Login realizado com sucesso!';
        if (trustThisDevice) {
          successMessage += ' Dispositivo será lembrado.';
        }
        
        toast.success(successMessage, {
          position: "top-right",
          autoClose: 4000
        });
        
        navigate('/protetico');
      } else {
        throw new Error(response.data.message || 'Código inválido');
      }
    } catch (error) {
      console.error('Erro na verificação 2FA:', error);
      let errorMessage = 'Erro ao verificar código';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000
      });
    }
  };

  const handleBack = () => {
    navigate('/login', { replace: true });
  };

  return (
    <AuthLayout>
      <TwoFactorCard 
        onSubmit={handleVerifyCode}
        email={email}
        onBack={handleBack}
      />
    </AuthLayout>
  );
};

export default TwoFactorPage; 