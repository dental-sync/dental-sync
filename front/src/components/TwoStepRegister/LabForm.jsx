import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import './TwoStepRegister.css';
import api from '../../axios-config';
import axios from 'axios'; // Mantido apenas para busca de CEP externa

const LabForm = ({ initialData, onSubmit, onBack, loading, onChange }) => {
  const [formData, setFormData] = useState(initialData);
  const [cepLoading, setCepLoading] = useState(false);
  const [enderecoBloqueado, setEnderecoBloqueado] = useState(false);
  const [cepSearchTimeout, setCepSearchTimeout] = useState(null);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Chama onChange com debounce para evitar loops
  const debouncedOnChange = useCallback(
    (data) => {
      const timeoutId = setTimeout(() => {
        if (onChange) onChange(data);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    },
    [onChange]
  );

  useEffect(() => {
    const cleanup = debouncedOnChange(formData);
    return cleanup;
  }, [formData, debouncedOnChange]);

  // Cleanup timeout quando componente desmontar
  useEffect(() => {
    return () => {
      if (cepSearchTimeout) {
        clearTimeout(cepSearchTimeout);
      }
    };
  }, [cepSearchTimeout]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'nome') {
      // Remove números do nome do laboratório
      const nomeSemNumeros = value.replace(/[0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: nomeSemNumeros
      }));
      return;
    }
    
    if (name === 'cnpj') {
      // Remove tudo que não for número
      const apenasNumeros = value.replace(/\D/g, '');
      
      // Limita a 14 dígitos
      const limitado = apenasNumeros.substring(0, 14);
      
      // Aplica a máscara do CNPJ
      let formattedValue = limitado;
      if (limitado.length > 2) {
        formattedValue = limitado.substring(0, 2) + '.' + limitado.substring(2);
      }
      if (limitado.length > 5) {
        formattedValue = formattedValue.substring(0, 6) + '.' + formattedValue.substring(6);
      }
      if (limitado.length > 8) {
        formattedValue = formattedValue.substring(0, 10) + '/' + formattedValue.substring(10);
      }
      if (limitado.length > 12) {
        formattedValue = formattedValue.substring(0, 15) + '-' + formattedValue.substring(15);
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }
    
    if (name === 'telefone') {
      const digits = value.replace(/\D/g, '');
      let formattedValue = '';
      
      if (digits.length > 0) {
        // Limita a 11 dígitos (2 do DDD + 9 do número)
        const limitedDigits = digits.substring(0, 11);
        
        // Adiciona o DDD
        formattedValue = `(${limitedDigits.substring(0, 2)}`;
        
        if (limitedDigits.length > 2) {
          // Adiciona o espaço após o DDD
          formattedValue += ') ';
          
          // Adiciona os números após o DDD
          const remainingDigits = limitedDigits.substring(2);
          formattedValue += remainingDigits;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }
    
    if (name === 'cep') {
      // Remove tudo que não for número
      const apenasNumeros = value.replace(/\D/g, '');
      
      // Limita a 8 dígitos
      const limitado = apenasNumeros.substring(0, 8);
      
      // Aplica a máscara do CEP
      let formattedValue = limitado;
      if (limitado.length > 5) {
        formattedValue = limitado.substring(0, 5) + '-' + limitado.substring(5);
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      
      // Se o CEP estiver incompleto ou vazio, desbloqueia os campos
      if (limitado.length < 8) {
        setEnderecoBloqueado(false);
      }
      
      // Se for o campo CEP e ficou válido, dispara a busca com debounce
      if (limitado.length === 8) {
        // Limpa timeout anterior se existir
        if (cepSearchTimeout) {
          clearTimeout(cepSearchTimeout);
        }
        
        // Cria novo timeout para busca
        const timeoutId = setTimeout(() => {
        handleCepBusca(limitado);
        }, 500);
        
        setCepSearchTimeout(timeoutId);
      }
      return;
    }
    
    // Se o usuário tentar editar campos de endereço bloqueados, desbloqueia automaticamente
    if (enderecoBloqueado && (name === 'endereco' || name === 'bairro' || name === 'cidade' || name === 'estado')) {
      setEnderecoBloqueado(false);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telefone') {
      const digits = value.replace(/\D/g, '');
      let formattedValue = '';
      
      if (digits.length > 0) {
        // Adiciona o DDD
        formattedValue = `(${digits.substring(0, 2)}`;
        
        if (digits.length > 2) {
          // Adiciona o espaço após o DDD
          formattedValue += ') ';
          
          // Adiciona os números após o DDD
          const remainingDigits = digits.substring(2);
          
          if (remainingDigits.length >= 8) {
            // Identifica se é fixo (8 dígitos) ou celular (9 dígitos)
            const isCelular = remainingDigits.length >= 9;
            const splitPoint = isCelular ? 5 : 4;
            formattedValue += `${remainingDigits.substring(0, splitPoint)}-${remainingDigits.substring(splitPoint, splitPoint + 4)}`;
          } else {
            formattedValue += remainingDigits;
          }
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    }
    
    if (name === 'cep') {
      const cep = value.replace(/\D/g, '');
      if (cep.length === 8) {
        handleCepBusca(cep);
      }
    }
  };

  const validateForm = () => {
    // Validar nome do laboratório
    if (!formData.nome.trim()) {
      toast.error('O nome do laboratório é obrigatório');
      return false;
    } else if (formData.nome.length > 255) {
      toast.error('O nome do laboratório não pode ultrapassar 255 caracteres');
      return false;
    } else if (/\d/.test(formData.nome)) {
      toast.error('O nome do laboratório não pode conter números');
      return false;
    }
    
    // Validar CNPJ
    if (!formData.cnpj.trim()) {
      toast.error('O CNPJ é obrigatório');
      return false;
    } else if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(formData.cnpj)) {
      toast.error('CNPJ inválido. Use o formato: 00.000.000/0000-00');
      return false;
    }
    
    // Validar email
    if (!formData.email.trim()) {
      toast.error('O email é obrigatório');
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.com$/.test(formData.email)) {
      toast.error('Formato de email inválido. O email deve terminar com .com');
      return false;
    } else if (formData.email.length > 255) {
      toast.error('O email não pode ultrapassar 255 caracteres');
      return false;
    }
    
    // Validar telefone
    if (!formData.telefone.trim()) {
      toast.error('O telefone é obrigatório');
      return false;
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.telefone)) {
      toast.error('Formato de telefone inválido. Use o formato: (99) 99999-9999 para celular ou (99) 9999-9999 para fixo');
      return false;
    }
    
    // Validar CEP
    if (!formData.cep.trim()) {
      toast.error('O CEP é obrigatório');
      return false;
    } else if (!/^\d{5}-\d{3}$/.test(formData.cep)) {
      toast.error('CEP inválido. Use o formato: 00000-000');
      return false;
    }
    
    // Validar endereço
    if (!formData.endereco.trim()) {
      toast.error('O endereço é obrigatório');
      return false;
    } else if (formData.endereco.length > 255) {
      toast.error('O endereço não pode ultrapassar 255 caracteres');
      return false;
    }
    
    // Validar número
    if (!formData.numero.trim()) {
      toast.error('O número é obrigatório');
      return false;
    }
    
    // Validar bairro
    if (!formData.bairro.trim()) {
      toast.error('O bairro é obrigatório');
      return false;
    } else if (formData.bairro.length > 100) {
      toast.error('O bairro não pode ultrapassar 100 caracteres');
      return false;
    }
    
    // Validar cidade
    if (!formData.cidade.trim()) {
      toast.error('A cidade é obrigatória');
      return false;
    } else if (formData.cidade.length > 100) {
      toast.error('A cidade não pode ultrapassar 100 caracteres');
      return false;
    }
    
    // Validar estado
    if (!formData.estado.trim()) {
      toast.error('O estado é obrigatório');
      return false;
    } else if (formData.estado.length !== 2) {
      toast.error('O estado deve ter 2 caracteres (UF)');
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Enviar os campos separadamente, sem montar string única
      onSubmit(formData);
    }
  };

  // Função separada para buscar o CEP
  const handleCepBusca = async (cep) => {
    setCepLoading(true);
    
    try {
      // Usar axios nativo (sem withCredentials) para APIs externas como ViaCEP
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      
      if (response.data.erro) {
        setEnderecoBloqueado(false);
        return;
      }
      
      // Só bloqueia se encontrou dados válidos
      const hasData = response.data.logradouro || response.data.bairro || response.data.localidade || response.data.uf;
      
      if (hasData) {
        // Atualiza os dados de uma só vez para evitar re-renders múltiplos
      setFormData(prev => ({
        ...prev,
          endereco: response.data.logradouro || prev.endereco || '',
          bairro: response.data.bairro || prev.bairro || '',
          cidade: response.data.localidade || prev.cidade || '',
          estado: response.data.uf || prev.estado || '',
      }));
        
        // Só bloqueia após a atualização dos dados
        setTimeout(() => {
          setEnderecoBloqueado(true);
        }, 100);
      } else {
        setEnderecoBloqueado(false);
      }
    } catch (e) {
      // erro silencioso
      setEnderecoBloqueado(false);
    } finally {
      setCepLoading(false);
    }
  };

  return (
    <form className="lab-form" onSubmit={handleSubmit}>
      <h2>Dados do Laboratório</h2>
      <p className="form-subtitle">Informe os dados do seu laboratório</p>

      {/* Campos principais do laboratório */}
      <div className="form-group">
        <label htmlFor="nome" className="required">Nome do Laboratório</label>
        <div className="input-container">
          <span className="input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </span>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome || ''}
            onChange={handleChange}
            placeholder="Nome do laboratório"
            required
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="cnpj" className="required">CNPJ</label>
        <div className="input-container">
          <span className="input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </span>
          <input
            type="text"
            id="cnpj"
            name="cnpj"
            value={formData.cnpj || ''}
            onChange={handleChange}
            placeholder="00.000.000/0000-00"
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email" className="required">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="laboratorio@exemplo.com"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="telefone" className="required">Telefone</label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={formData.telefone || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="(00) 00000-0000"
            required
          />
        </div>
      </div>

      {/* Seção de endereço */}
      <div className="form-section">
        <h3>Endereço</h3>
        
        <div className="form-group">
          <label htmlFor="cep" className="required">
            CEP
            {cepLoading && <span className="loading-text"> (Buscando...)</span>}
          </label>
          <input
            type="text"
            id="cep"
            name="cep"
            value={formData.cep || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="00000-000"
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group form-group-wide">
            <label htmlFor="endereco" className="required">Endereço</label>
            <input
              type="text"
              id="endereco"
              name="endereco"
              value={formData.endereco || ''}
              onChange={handleChange}
              placeholder="Rua, Avenida, etc."
              required
              disabled={enderecoBloqueado}
            />
          </div>
          <div className="form-group form-group-narrow">
            <label htmlFor="numero" className="required">Número</label>
            <input
              type="text"
              id="numero"
              name="numero"
              value={formData.numero || ''}
              onChange={handleChange}
              placeholder="123"
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="bairro" className="required">Bairro</label>
            <input
              type="text"
              id="bairro"
              name="bairro"
              value={formData.bairro || ''}
              onChange={handleChange}
              placeholder="Nome do bairro"
              required
              disabled={enderecoBloqueado}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cidade" className="required">Cidade</label>
            <input
              type="text"
              id="cidade"
              name="cidade"
              value={formData.cidade || ''}
              onChange={handleChange}
              placeholder="Nome da cidade"
              required
              disabled={enderecoBloqueado}
            />
          </div>
          <div className="form-group form-group-narrow">
            <label htmlFor="estado" className="required">Estado</label>
            <input
              type="text"
              id="estado"
              name="estado"
              value={formData.estado || ''}
              onChange={handleChange}
              placeholder="UF"
              maxLength="2"
              required
              disabled={enderecoBloqueado}
            />
          </div>
        </div>
      </div>
      
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          Voltar
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Criando Conta...' : 'Criar Conta'}
        </button>
      </div>
    </form>
  );
};

export default LabForm; 