import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../../components/Logo';
import ResetPasswordForm from '../../components/ResetPasswordForm';
import api from '../../axios-config';
import { toast } from 'react-toastify';
import './ResetPassword.css';

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

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

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
      
      let errorMessage = 'Erro ao redefinir senha';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        
        // Se o token é inválido, redirecionar para recuperação
        if (errorMessage.includes('Token inválido') || errorMessage.includes('expirado')) {
          toast.error('Token expirado ou inválido. Solicite uma nova recuperação.');
          setTimeout(() => {
            navigate('/forgot-password');
          }, 2000);
          return;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading enquanto verifica token
  if (tokenValid === null) {
    return (
      <div className="reset-page">
        <header className="reset-header">
          <Logo size="small" withText={true} />
        </header>
        <main className="reset-main">
          <div className="reset-loading">
            <p>Verificando token de recuperação...</p>
          </div>
        </main>
      </div>
    );
  }

  // Token inválido
  if (tokenValid === false) {
    return (
      <div className="reset-page">
        <header className="reset-header">
          <Logo size="small" withText={true} />
        </header>
        <main className="reset-main">
          <div className="reset-error">
            <h2>Token Inválido</h2>
            <p>O link de recuperação é inválido ou expirou.</p>
            <button onClick={() => navigate('/forgot-password')} className="reset-btn">
              Solicitar Nova Recuperação
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="reset-page">
      <header className="reset-header">
        <Logo size="small" withText={true} />
      </header>
      <main className="reset-main">
        <ResetPasswordForm 
          onSubmit={handleReset} 
          loading={loading} 
          success={success}
        />
      </main>
      <footer className="reset-footer">
        <p>© {new Date().getFullYear()} DentalSync - Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

export default ResetPasswordPage; 