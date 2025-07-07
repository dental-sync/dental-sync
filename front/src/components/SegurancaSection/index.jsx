import React, { useState, useEffect } from 'react';
import PasswordInput from '../PasswordInput';
import api from '../../axios-config';
import { toast } from 'react-toastify';
import { validatePassword } from '../../utils/passwordValidator';
import PasswordRequirements from '../PasswordRequirements/PasswordRequirements';
import PasswordStrengthIndicator from '../PasswordStrengthIndicator/PasswordStrengthIndicator';
import './styles.css';

const SegurancaSection = () => {
  const [formData, setFormData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [fieldErrors, setFieldErrors] = useState({}); // Erros específicos dos campos
  const [isLoading, setIsLoading] = useState(false);

  // Estados para 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  // Verificar status do 2FA ao carregar
  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    try {
      const response = await api.get('/security/2fa/status');
      if (response.data.success) {
        setTwoFactorEnabled(response.data.twoFactorEnabled);
      }
    } catch (error) {
      console.error('Erro ao verificar status 2FA:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro específico do campo quando usuário digitar
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.senhaAtual) {
      errors.senhaAtual = 'Senha atual é obrigatória';
    }
    
    // Validar nova senha com regras complexas
    const passwordErrors = validatePassword(formData.novaSenha);
    if (passwordErrors.length > 0) {
      errors.novaSenha = passwordErrors[0];
    }
    
    if (!formData.confirmarSenha) {
      errors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.novaSenha !== formData.confirmarSenha) {
      errors.confirmarSenha = 'As senhas não coincidem';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação local
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Mostrar toast para erro de senha se houver
      if (errors.novaSenha) {
        toast.error(errors.novaSenha);
      }
      return;
    }
    
    setIsLoading(true);
    setFieldErrors({});

    try {
      const params = new URLSearchParams();
      params.append('currentPassword', formData.senhaAtual);
      params.append('newPassword', formData.novaSenha);
      params.append('confirmPassword', formData.confirmarSenha);

      const response = await api.post('/security/change-password', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data.success) {
        // Toast de sucesso
        toast.success('Senha alterada com sucesso! Você permanece logado.', {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
    
        // Limpar formulário
    setFormData({
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: ''
    });
      } else {
        // Erro específico do backend - tratar como erro de campo se for senha incorreta
        if (response.data.message && response.data.message.includes('Senha atual incorreta')) {
          setFieldErrors({ senhaAtual: response.data.message });
        } else if (response.data.message && response.data.message.includes('não coincidem')) {
          setFieldErrors({ confirmarSenha: response.data.message });
        } else {
          // Outros erros via toast
          toast.error(response.data.message || 'Erro ao alterar senha');
        }
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        // Verificar se é erro específico de campo
        if (errorMessage.includes('Senha atual incorreta')) {
          setFieldErrors({ senhaAtual: errorMessage });
        } else if (errorMessage.includes('não coincidem')) {
          setFieldErrors({ confirmarSenha: errorMessage });
        } else {
          // Outros erros via toast
          toast.error(errorMessage);
        }
      } else {
        // Erro genérico via toast
        toast.error('Erro de conexão. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Funções 2FA
  const setupTwoFactor = async () => {
    setTwoFactorLoading(true);
    try {
      const response = await api.post('/security/2fa/setup');
      if (response.data.success) {
        setQrCodeImage(response.data.qrCodeImage);
        setSecretKey(response.data.secretKey);
        setShowQrCode(true);
      } else {
        toast.error(response.data.message || 'Erro ao configurar 2FA');
      }
    } catch (error) {
      console.error('Erro ao configurar 2FA:', error);
      toast.error('Erro ao configurar 2FA. Tente novamente.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const enableTwoFactor = async () => {
    if (!totpCode || totpCode.length !== 6) {
      toast.error('Digite um código de 6 dígitos');
      return;
    }

    setTwoFactorLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('secretKey', secretKey);
      params.append('totpCode', parseInt(totpCode));

      const response = await api.post('/security/2fa/enable', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data.success) {
        toast.success('Autenticação de dois fatores ativada com sucesso!', {
          position: "top-right",
          autoClose: 4000
        });
        setTwoFactorEnabled(true);
        setShowQrCode(false);
        setTotpCode('');
        setQrCodeImage('');
        setSecretKey('');
      } else {
        toast.error(response.data.message || 'Código inválido');
      }
    } catch (error) {
      console.error('Erro ao ativar 2FA:', error);
      toast.error('Erro ao ativar 2FA. Verifique o código e tente novamente.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    if (!totpCode || totpCode.length !== 6) {
      toast.error('Digite um código de 6 dígitos para desativar o 2FA');
      return;
    }

    setTwoFactorLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('totpCode', parseInt(totpCode));

      const response = await api.post('/security/2fa/disable', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data.success) {
        toast.success('Autenticação de dois fatores desativada com sucesso!', {
          position: "top-right",
          autoClose: 4000
        });
        setTwoFactorEnabled(false);
        setTotpCode('');
      } else {
        toast.error(response.data.message || 'Código inválido');
      }
    } catch (error) {
      console.error('Erro ao desativar 2FA:', error);
      toast.error('Erro ao desativar 2FA. Verifique o código e tente novamente.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  return (
    <div className="seguranca-section">
      <h2>Segurança</h2>
      <p className="section-description">Configure as opções de segurança do sistema</p>
      
      {/* Seção Alterar Senha */}
      <div className="security-subsection">
      <h3 className="subsection-title">Alterar Senha</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="senhaAtual">Senha Atual</label>
          <PasswordInput
            id="senhaAtual"
            name="senhaAtual"
            value={formData.senhaAtual}
            onChange={handleChange}
              disabled={isLoading}
          />
            {fieldErrors.senhaAtual && (
              <span className="field-error">{fieldErrors.senhaAtual}</span>
            )}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="novaSenha">Nova Senha</label>
            <PasswordInput
              id="novaSenha"
              name="novaSenha"
              value={formData.novaSenha}
              onChange={handleChange}
                disabled={isLoading}
            />
              {fieldErrors.novaSenha && (
                <span className="field-error">{fieldErrors.novaSenha}</span>
              )}
              <PasswordStrengthIndicator password={formData.novaSenha} />
              <PasswordRequirements password={formData.novaSenha} />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar Nova Senha</label>
            <PasswordInput
              id="confirmarSenha"
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleChange}
                disabled={isLoading}
            />
              {fieldErrors.confirmarSenha && (
                <span className="field-error">{fieldErrors.confirmarSenha}</span>
              )}
            </div>
          </div>
          

          
          <div className="security-form-actions">
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </div>
        </form>
        </div>
        
      {/* Seção 2FA */}
      <div className="security-subsection">
        <h3 className="subsection-title">Autenticação de Dois Fatores (2FA)</h3>
        <p className="section-description">
          Adicione uma camada extra de segurança à sua conta usando o Google Authenticator.
        </p>

        <div className="two-factor-status">
          <div className="status-indicator">
            <span className={`status-dot ${twoFactorEnabled ? 'enabled' : 'disabled'}`}></span>
            <span className="status-text">
              2FA está {twoFactorEnabled ? 'ATIVADO' : 'DESATIVADO'}
            </span>
          </div>

          {!twoFactorEnabled ? (
            <div className="two-factor-setup">
              {!showQrCode ? (
                <button 
                  onClick={setupTwoFactor} 
                  className="btn-primary"
                  disabled={twoFactorLoading}
                >
                  {twoFactorLoading ? 'Configurando...' : 'Ativar 2FA'}
                </button>
              ) : (
                <div className="qr-code-setup">
                  <div className="setup-steps">
                    <h4>Configure o Google Authenticator:</h4>
                    <ol>
                      <li>Baixe o app "Google Authenticator" no seu celular</li>
                      <li>Escaneie o QR Code abaixo ou digite a chave manualmente</li>
                      <li>Digite o código de 6 dígitos gerado pelo app</li>
                    </ol>
                  </div>

                  <div className="qr-code-container">
                    <img 
                      src={qrCodeImage} 
                      alt="QR Code para Google Authenticator"
                      className="qr-code-image"
                    />
                    <div className="manual-key">
                      <p><strong>Chave manual:</strong></p>
                      <code>{secretKey}</code>
                    </div>
                  </div>

                  <div className="verification-form">
                    <label htmlFor="totpCode">Código do Google Authenticator:</label>
                    <input
                      type="text"
                      id="totpCode"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength="6"
                      disabled={twoFactorLoading}
                    />
                    <div className="verification-actions">
                      <button 
                        onClick={enableTwoFactor} 
                        className="btn-primary"
                        disabled={twoFactorLoading || totpCode.length !== 6}
                      >
                        {twoFactorLoading ? 'Verificando...' : 'Ativar 2FA'}
                      </button>
                      <button 
                        onClick={() => setShowQrCode(false)} 
                        className="btn-secondary"
                        disabled={twoFactorLoading}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="two-factor-disable">
              <p className="warning-text">
                ⚠️ Desativar o 2FA reduzirá a segurança da sua conta.
              </p>
              <div className="disable-form">
                <label htmlFor="disableTotpCode">Digite o código do Google Authenticator para desativar:</label>
                <input
                  type="text"
                  id="disableTotpCode"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength="6"
                  disabled={twoFactorLoading}
                />
                <button 
                  onClick={disableTwoFactor} 
                  className="btn-danger"
                  disabled={twoFactorLoading || totpCode.length !== 6}
                >
                  {twoFactorLoading ? 'Desativando...' : 'Desativar 2FA'}
          </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SegurancaSection; 