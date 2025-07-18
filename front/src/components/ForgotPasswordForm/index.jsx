import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../axios-config';
import { toast } from 'react-toastify';
import './styles.css';

const TwoFactorStep = ({ email, recoveryToken, onSuccess, onBack, onRequestEmailLink }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (error) setError('');

    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name="code-${index + 1}"]`);
      nextInput?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Digite todos os 6 dígitos do código');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      params.append('email', email);
      params.append('recoveryToken', recoveryToken);
      params.append('totpCode', parseInt(fullCode));

      const response = await api.post('/password/verify-2fa', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data.success) {
        onSuccess(response.data.resetToken);
      } else {
        setError(response.data.message || 'Código inválido');
      }
    } catch (error) {
      console.error('Erro na verificação 2FA:', error);
      
      let errorMessage = 'Código inválido. Tente novamente.'; // mensagem padrão
      
      if (error.response && error.response.data) {
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
      
      setError(errorMessage);
      setCode(['', '', '', '', '', '']);
      document.querySelector('input[name="code-0"]')?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-form">
      <h2 className="forgot-title">Verificação em Duas Etapas</h2>
      <p className="forgot-subtitle">
        Digite o código de 6 dígitos do Google Authenticator para <strong>{email}</strong>
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="code-inputs-container">
          <div className="code-inputs">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                name={`code-${index}`}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="code-input"
                maxLength="1"
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        {error && <div className="forgot-error">{error}</div>}

        <div className="forgot-actions">
          <button
            type="button"
            onClick={onBack}
            className="forgot-btn-secondary"
            disabled={isLoading}
          >
            Voltar
          </button>
          
          <button
            type="submit"
            className="forgot-btn"
            disabled={isLoading || code.join('').length !== 6}
          >
            {isLoading ? 'Verificando...' : 'Verificar'}
          </button>
        </div>
      </form>
      
      <div className="forgot-help">
        <p>Não consegue acessar seu dispositivo?</p>
        <button 
          type="button" 
          className="forgot-link-button" 
          disabled={isLoading}
          onClick={onRequestEmailLink}
        >
          Receber link por email
        </button>
      </div>
    </div>
  );
};

const SuccessMessage = ({ email, emailSent }) => (
  <div className="forgot-success-container">
    <h2 className="forgot-title">Email Enviado!</h2>
    <p className="forgot-subtitle">Verifique sua caixa de entrada</p>
    <div className="forgot-success-message">
      {emailSent ? (
        <>Enviamos um link de recuperação para <b>{email}</b>. Clique no link para redefinir sua senha.</>
      ) : (
        <>Enviamos instruções de recuperação para <b>{email}</b>. Por favor, verifique sua caixa de entrada.</>
      )}
    </div>
    <div className="forgot-link-container">
      <Link to="/login" className="forgot-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 2}}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Voltar para o login
      </Link>
    </div>
  </div>
);

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // 'email', '2fa', 'success'
  const [loading, setLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('O email é obrigatório');
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.com$/.test(email)) {
      toast.error('Formato de email inválido. O email deve terminar com .com');
      return;
    }
    
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('email', email);

      const response = await api.post('/password/forgot', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data.success) {
        if (response.data.requiresTwoFactor) {
          setRequiresTwoFactor(true);
          setRecoveryToken(response.data.recoveryToken);
          setStep('2fa');
        } else {
          setEmailSent(true);
          setStep('success');
        }
        
        toast.success(response.data.message, {
          position: "top-right",
          autoClose: 5000
        });
      } else {
        toast.error(response.data.message || 'Erro ao processar solicitação');
      }
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      
      let errorMessage = 'Erro ao processar solicitação. Tente novamente.'; // mensagem padrão
      
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
      } else if (error.request) {
        // Erro de rede - sem resposta do servidor
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSuccess = (resetToken) => {
    toast.success('2FA verificado! Redirecionando para redefinição de senha...', {
      position: "top-right",
      autoClose: 3000
    });
    
    // Redirecionar para página de reset com o token
    navigate(`/reset-password?token=${resetToken}`);
  };

  const handleRequestEmailLink = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('email', email);

      const response = await api.post('/password/request-email-link', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data.success) {
        setEmailSent(true);
        setStep('success');
        
        toast.success(response.data.message, {
          position: "top-right",
          autoClose: 5000
        });
      } else {
        toast.error(response.data.message || 'Erro ao enviar email');
      }
    } catch (error) {
      console.error('Erro ao solicitar link por email:', error);
      
      let errorMessage = 'Erro ao enviar email. Tente novamente.'; // mensagem padrão
      
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
      } else if (error.request) {
        // Erro de rede - sem resposta do servidor
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return <SuccessMessage email={email} emailSent={emailSent} />;
  }

  if (step === '2fa') {
    return (
      <TwoFactorStep 
        email={email}
        recoveryToken={recoveryToken}
        onSuccess={handleTwoFactorSuccess}
        onBack={() => setStep('email')}
        onRequestEmailLink={handleRequestEmailLink}
      />
    );
  }

  return (
    <form className="forgot-form" onSubmit={handleEmailSubmit}>
      <h2 className="forgot-title">Recuperar senha</h2>
      <p className="forgot-subtitle">Informe seu e-mail para receber instruções de recuperação</p>
      
      <div className="forgot-group">
        <label htmlFor="email" className="forgot-label required">E-mail</label>
        <div className="forgot-input-container">
          <span className="forgot-input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </span>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="forgot-input"
            required
            disabled={loading}
          />
        </div>
      </div>
      
      <button type="submit" className="forgot-btn" disabled={loading}>
        {loading ? 'Processando...' : 'Continuar'}
      </button>
      
      <div className="forgot-link-container">
        <Link to="/login" className="forgot-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 2}}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar para o login
        </Link>
      </div>
    </form>
  );
};

export default ForgotPasswordForm; 