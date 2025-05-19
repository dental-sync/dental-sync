import React, { useState } from 'react';
import './styles.css';
import PasswordInput from '../PasswordInput';

const SegurancaSection = () => {
  const [formData, setFormData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar mensagem de erro quando o usuário começa a digitar novamente
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação simples
    if (!formData.senhaAtual || !formData.novaSenha || !formData.confirmarSenha) {
      setError('Todos os campos são obrigatórios');
      return;
    }
    
    if (formData.novaSenha !== formData.confirmarSenha) {
      setError('A nova senha e a confirmação não coincidem');
      return;
    }
    
    if (formData.novaSenha.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }
    
    // Aqui seria a lógica para salvar a nova senha no backend
    console.log('Senha alterada com sucesso!', formData);
    
    // Limpar o formulário após envio bem-sucedido
    setFormData({
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: ''
    });
  };

  return (
    <div className="seguranca-section">
      <h2>Segurança</h2>
      <p className="section-description">Configure as opções de segurança do sistema</p>
      
      <h3 className="subsection-title">Alterar Senha</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="senhaAtual">Senha Atual</label>
          <PasswordInput
            id="senhaAtual"
            name="senhaAtual"
            value={formData.senhaAtual}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="novaSenha">Nova Senha</label>
            <PasswordInput
              id="novaSenha"
              name="novaSenha"
              value={formData.novaSenha}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar Nova Senha</label>
            <PasswordInput
              id="confirmarSenha"
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <p className="password-hint">
          A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.
        </p>
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Alterar Senha
          </button>
        </div>
      </form>
    </div>
  );
};

export default SegurancaSection; 