import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';
import ResetPasswordForm from '../../components/ResetPasswordForm';
import api from '../../axios-config';
import { toast } from 'react-toastify';

// CSS para animação de loading
const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inserir CSS no head se não existir
if (!document.querySelector('#spin-animation')) {
  const style = document.createElement('style');
  style.id = 'spin-animation';
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null); // null = verificando, true = válido, false = inválido
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    // Verificar se há token na URL
    if (!token) {
      toast.error('Token de recuperação não encontrado');
      navigate('/login');
      return;
    }

    // Token presente, pode proceder
    setTokenValid(true);
  }, [token, navigate]);

  const handleReset = async ({ password, confirmPassword }) => {
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    // Validação adicional é feita no componente ResetPasswordForm
    // Essa validação é mantida como fallback

    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('token', token);
      params.append('newPassword', password);

      const response = await api.post('/password/reset', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data.success) {
        setSuccess(true);
        
        toast.success('Senha alterada com sucesso! Redirecionando para o login...', {
          position: "top-right",
          autoClose: 3000
        });

        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        toast.error(response.data.message || 'Erro ao redefinir senha');
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      
      let errorMessage = 'Erro ao redefinir senha'; // mensagem padrão
      
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
        
        // Se o token é inválido, redirecionar para recuperação
        if (errorMessage.includes('Token inválido') || errorMessage.includes('expirado')) {
          toast.error('Token expirado ou inválido. Solicite uma nova recuperação.');
          setTimeout(() => {
            navigate('/forgot-password');
          }, 2000);
          return;
        }
      } else if (error.request) {
        // Erro de rede - sem resposta do servidor
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else {
        // Outros tipos de erro
        errorMessage = 'Erro inesperado. Tente novamente.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading enquanto verifica token
  if (tokenValid === null) {
    return (
      <AuthLayout>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '3px solid #f3f3f3', 
              borderTop: '3px solid #2563EB', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
          </div>
          <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>
            Verificando token de recuperação...
          </p>
        </div>
      </AuthLayout>
    );
  }

  // Token inválido
  if (tokenValid === false) {
    return (
      <AuthLayout>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#111827', 
            marginBottom: '0.5rem' 
          }}>
            Token Inválido
          </h2>
          <p style={{ 
            color: '#6B7280', 
            marginBottom: '1.5rem',
            lineHeight: '1.5'
          }}>
            O link de recuperação é inválido ou expirou.
          </p>
          <button 
            onClick={() => navigate('/forgot-password')} 
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: '#2563EB',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1D4ED8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563EB'}
          >
            Solicitar Nova Recuperação
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <ResetPasswordForm 
        onSubmit={handleReset} 
        loading={loading} 
        success={success}
      />
    </AuthLayout>
  );
};

export default ResetPasswordPage; 