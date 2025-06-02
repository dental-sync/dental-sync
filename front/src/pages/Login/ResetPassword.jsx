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
  const [error, setError] = useState('');

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

  const handleSubmit = async (formData) => {
    setLoading(true);
    
    try {
      // Temporariamente desabilitado
      throw new Error('Funcionalidade temporariamente indisponível. Entre em contato com o suporte.');
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      setError('Funcionalidade de reset temporariamente indisponível. Entre em contato com o suporte.');
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
          onSubmit={handleSubmit} 
          loading={loading} 
          success={success}
          error={error}
        />
      </main>
      <footer className="reset-footer">
        <p>© {new Date().getFullYear()} DentalSync - Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

export default ResetPasswordPage; 