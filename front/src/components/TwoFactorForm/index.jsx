import React, { useState, useEffect, useRef } from 'react';
import './styles.css';

const TwoFactorForm = ({ onSubmit, onBack }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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
      await onSubmit(parseInt(fullCode));
    } catch (error) {
      setError(error.message || 'Código inválido. Tente novamente.');
      // Limpar o código em caso de erro
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

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
        <button type="button" className="help-link" disabled={isLoading}>
          Entre em contato com o suporte
        </button>
      </div>
    </form>
  );
};

export default TwoFactorForm; 