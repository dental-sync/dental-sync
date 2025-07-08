import React, { useState, useEffect, useRef } from 'react';
import api from '../../axios-config';
import { toast } from 'react-toastify';
import './styles.css';

const TwoFactorForm = ({ onSubmit, onBack, email }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(false);
  const [recoveryCodeSent, setRecoveryCodeSent] = useState(false);
  const [trustThisDevice, setTrustThisDevice] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focar no primeiro input quando o componente montar
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index, value) => {
    // Permitir apenas números
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Limpar erro quando usuário digitar
    if (error) setError('');

    // Mover para o próximo input automaticamente
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Voltar para o input anterior no backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Enviar formulário no Enter
    if (e.key === 'Enter' && code.every(digit => digit)) {
      handleSubmit(e);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Verificar se são 6 dígitos
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      
      // Focar no último input
      inputRefs.current[5]?.focus();
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
      await onSubmit(parseInt(fullCode), trustThisDevice);
    } catch (error) {
      setError(error.message || 'Código inválido. Tente novamente.');
      // Limpar o código em caso de erro
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestRecoveryCode = async () => {
    setIsRecoveryLoading(true);
    
    try {
      const params = new URLSearchParams();
      params.append('email', email);
      
      const response = await api.post('/login/request-recovery-code', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      if (response.data.success) {
        setRecoveryCodeSent(true);
        toast.success('Código de recuperação enviado para seu email! Pode demorar alguns minutos para chegar.', {
          position: "top-right",
          autoClose: 8000
        });
      } else {
        throw new Error(response.data.message || 'Erro ao enviar código');
      }
    } catch (error) {
      console.error('Erro ao solicitar código de recuperação:', error);
      
      let errorMessage = 'Erro ao enviar código de recuperação';
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        // Em caso de timeout, assumir que o email foi enviado
        errorMessage = 'O servidor está demorando para responder, mas o email pode ter sido enviado. Verifique sua caixa de entrada e continue com o processo.';
        setRecoveryCodeSent(true); // Permitir continuar o processo
        
        toast.warning(errorMessage, {
          position: "top-right",
          autoClose: 10000
        });
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000
        });
      } else {
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000
        });
      }
    } finally {
      setIsRecoveryLoading(false);
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    
    if (!recoveryCode || recoveryCode.length !== 6) {
      toast.error('Digite o código de 6 dígitos recebido no email');
      return;
    }

    setIsRecoveryLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('email', email);
      params.append('code', recoveryCode);
      
      const response = await api.post('/login/verify-recovery-code', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      if (response.data.success) {
        toast.success('2FA removido com sucesso! Redirecionando...', {
          position: "top-right",
          autoClose: 3000
        });
        
        // Simular o login bem-sucedido
        // O backend já processou o login e retornou os dados
        window.location.reload(); // ou usar navigate conforme necessário
      } else {
        throw new Error(response.data.message || 'Código inválido');
      }
    } catch (error) {
      console.error('Erro ao verificar código de recuperação:', error);
      
      let errorMessage = 'Código de recuperação inválido ou expirado';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000
      });
    } finally {
      setIsRecoveryLoading(false);
    }
  };

  if (showRecovery) {
    return (
      <div className="twofactor-form">
        <div className="recovery-section">
          <h3>Recuperação de Acesso</h3>
          <p>Isso irá desativar o 2FA da sua conta e você poderá configurá-lo novamente depois.</p>
          
          {!recoveryCodeSent ? (
            <div className="recovery-request">
              <p>Clique no botão abaixo para receber um código de recuperação no seu email:</p>
              <p><strong>{email}</strong></p>
              
              <button
                type="button"
                onClick={handleRequestRecoveryCode}
                disabled={isRecoveryLoading}
                className="btn-recovery-request"
              >
                {isRecoveryLoading ? 'Enviando...' : 'Enviar Código por Email'}
              </button>
              
              <div className="recovery-manual">
                <p><small>Problemas de conexão?</small></p>
                <button
                  type="button"
                  onClick={() => setRecoveryCodeSent(true)}
                  className="btn-recovery-manual"
                  disabled={isRecoveryLoading}
                >
                  Já recebi o código
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRecoverySubmit} className="recovery-form">
              <p>Digite o código de 6 dígitos enviado para seu email:</p>
              
              <input
                type="text"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="recovery-code-input"
                disabled={isRecoveryLoading}
                maxLength="6"
              />
              
              <div className="recovery-actions">
                <button
                  type="submit"
                  disabled={isRecoveryLoading || recoveryCode.length !== 6}
                  className="btn-recovery-verify"
                >
                  {isRecoveryLoading ? 'Verificando...' : 'Verificar e Remover 2FA'}
                </button>
              </div>
              
              <p className="recovery-note">
                <small>⚠️ Atenção: Isso irá desativar completamente o 2FA da sua conta</small>
              </p>
            </form>
          )}
          
          <div className="recovery-back">
            <button
              type="button"
              onClick={() => setShowRecovery(false)}
              className="btn-recovery-back"
              disabled={isRecoveryLoading}
            >
              Voltar para verificação 2FA
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="twofactor-form">
      <div className="code-input-container">
        <div className="code-inputs">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="code-input"
              maxLength="1"
              disabled={isLoading}
            />
          ))}
        </div>
        
        <p className="code-hint">
          Cole o código ou digite os 6 dígitos do Google Authenticator
        </p>
      </div>

      {error && <div className="twofactor-error">{error}</div>}

      <div className="trust-device-section">
        <label className="trust-device-label">
          <input
            type="checkbox"
            checked={trustThisDevice}
            onChange={(e) => setTrustThisDevice(e.target.checked)}
            disabled={isLoading}
            className="trust-device-checkbox"
          />
          <span className="trust-device-text">
            Lembrar deste dispositivo por 10 minutos
          </span>
        </label>
        <p className="trust-device-hint">
          Não será necessário digitar o código 2FA neste dispositivo durante o período especificado
        </p>
      </div>

      <div className="twofactor-actions">
        <button
          type="button"
          onClick={onBack}
          className="btn-back"
          disabled={isLoading}
        >
          Voltar
        </button>
        
        <button
          type="submit"
          className="btn-verify"
          disabled={isLoading || code.join('').length !== 6}
        >
          {isLoading ? 'Verificando...' : 'Verificar'}
        </button>
      </div>
      
      <div className="twofactor-help">
        <p>Não consegue acessar seu dispositivo?</p>
        <button 
          type="button" 
          className="help-link" 
          disabled={isLoading}
          onClick={() => setShowRecovery(true)}
        >
          Receber código por email
        </button>
      </div>
    </form>
  );
};

export default TwoFactorForm; 