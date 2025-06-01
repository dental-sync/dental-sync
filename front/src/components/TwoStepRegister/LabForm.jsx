import React, { useState, useEffect } from 'react';
import './TwoStepRegister.css';
import axios from 'axios';

const LabForm = ({ initialData, onSubmit, onBack, loading, onChange }) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Chama onChange sempre que formData mudar (mas não no render inicial)
  useEffect(() => {
    if (onChange) onChange(formData);
  }, [formData, onChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpa o erro do campo que está sendo editado
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Se for o campo CEP e ficou válido, dispara a busca
    if (name === 'cep') {
      const cepNumeros = value.replace(/\D/g, '');
      if (cepNumeros.length === 8) {
        handleCepBusca(cepNumeros);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar nome do laboratório
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do laboratório é obrigatório';
    }
    
    // Validar CNPJ
    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(formData.cnpj) && !/^\d{14}$/.test(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ inválido';
    }
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Validar telefone
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }
    
    // Validar endereço
    if (!formData.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório';
    }
    
    // Validar cidade
    if (!formData.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }
    
    // Validar estado
    if (!formData.estado.trim()) {
      newErrors.estado = 'Estado é obrigatório';
    }
    
    // Validar CEP
    if (!formData.cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (!/^\d{5}-\d{3}$/.test(formData.cep) && !/^\d{8}$/.test(formData.cep)) {
      newErrors.cep = 'CEP inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (response.data.erro) return;
      setFormData(prev => ({
        ...prev,
        endereco: response.data.logradouro || '',
        bairro: response.data.bairro || '',
        cidade: response.data.localidade || '',
        estado: response.data.uf || '',
      }));
    } catch (e) {
      // erro silencioso
    } finally {
      setCepLoading(false);
    }
  };

  // O onBlur do CEP agora só serve para garantir busca caso o usuário cole o CEP e saia do campo
  const handleCepBlur = () => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      handleCepBusca(cep);
    }
  };

  return (
    <form className="lab-form" onSubmit={handleSubmit}>
      <h2>Dados do Laboratório</h2>
      <p className="form-subtitle">Informe os dados do seu laboratório</p>

      {/* Campos principais do laboratório */}
      <div className="form-group">
        <label htmlFor="nome">Nome do Laboratório</label>
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
            className={errors.nome ? 'error' : ''}
          />
        </div>
        {errors.nome && <span className="error-message">{errors.nome}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="cnpj">CNPJ</label>
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
            className={errors.cnpj ? 'error' : ''}
          />
        </div>
        {errors.cnpj && <span className="error-message">{errors.cnpj}</span>}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="laboratorio@exemplo.com"
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="telefone">Telefone</label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={formData.telefone || ''}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            className={errors.telefone ? 'error' : ''}
          />
          {errors.telefone && <span className="error-message">{errors.telefone}</span>}
        </div>
      </div>

      {/* Bloco de endereço abaixo dos outros campos */}
      {/* Campo de CEP primeiro */}
      <div className="form-group">
        <label htmlFor="cep">CEP</label>
        <div className="input-container">
          <span className="input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </span>
          <input
            type="text"
            id="cep"
            name="cep"
            value={formData.cep || ''}
            onChange={handleChange}
            onBlur={handleCepBlur}
            placeholder="00000-000"
            className={errors.cep ? 'error' : ''}
            maxLength={9}
            autoComplete="postal-code"
            disabled={cepLoading}
          />
        </div>
        {errors.cep && <span className="error-message">{errors.cep}</span>}
      </div>

      {/* Só mostra os campos de endereço após buscar o CEP */}
      {(formData.endereco || formData.cidade || formData.estado) && (
        <>
          <div className="form-group">
            <label htmlFor="endereco">Logradouro</label>
            <div className="input-container">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </span>
              <input
                type="text"
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                placeholder="Logradouro"
                className={errors.endereco ? 'error' : ''}
              />
            </div>
            {errors.endereco && <span className="error-message">{errors.endereco}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="numero">Número</label>
              <div className="input-container">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>
                </span>
                <input
                  type="text"
                  id="numero"
                  name="numero"
                  value={formData.numero || ''}
                  onChange={handleChange}
                  placeholder="Número"
                  className={errors.numero ? 'error' : ''}
                />
              </div>
              {errors.numero && <span className="error-message">{errors.numero}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bairro">Bairro</label>
              <div className="input-container">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>
                </span>
                <input
                  type="text"
                  id="bairro"
                  name="bairro"
                  value={formData.bairro || ''}
                  onChange={handleChange}
                  placeholder="Bairro"
                  className={errors.bairro ? 'error' : ''}
                  readOnly
                />
              </div>
              {errors.bairro && <span className="error-message">{errors.bairro}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="cidade">Cidade</label>
              <div className="input-container">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>
                </span>
                <input
                  type="text"
                  id="cidade"
                  name="cidade"
                  value={formData.cidade || ''}
                  onChange={handleChange}
                  placeholder="Cidade"
                  className={errors.cidade ? 'error' : ''}
                  readOnly
                />
              </div>
              {errors.cidade && <span className="error-message">{errors.cidade}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="estado">Estado</label>
              <div className="input-container">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>
                </span>
                <input
                  type="text"
                  id="estado"
                  name="estado"
                  value={formData.estado || ''}
                  onChange={handleChange}
                  placeholder="Estado"
                  className={errors.estado ? 'error' : ''}
                  readOnly
                />
              </div>
              {errors.estado && <span className="error-message">{errors.estado}</span>}
            </div>
          </div>
        </>
      )}

      <div className="form-actions">
        <button 
          type="button" 
          className="btn-secondary" 
          onClick={() => onBack(formData)}
          disabled={loading}
        >
          Voltar
        </button>
        <button 
          type="submit" 
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Finalizar Registro'}
        </button>
      </div>
    </form>
  );
};

export default LabForm; 