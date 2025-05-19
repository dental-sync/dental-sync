import React, { useState } from 'react';
import './styles.css';

const InformacaoSection = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui seria a lógica para salvar os dados no backend
    console.log('Dados salvos:', formData);
    // Poderia adicionar um aviso de sucesso aqui
  };

  return (
    <div className="informacao-section">
      <h2>Informações do Laboratório</h2>
      <p className="section-description">Gerencie as informações básicas do seu laboratório</p>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nome">Nome do Laboratório</label>
            <input 
              type="text" 
              id="nome" 
              name="nome" 
              value={formData.nome} 
              onChange={handleChange} 
              placeholder="Dental Sync Lab"
            />
          </div>
          <div className="form-group">
            <label htmlFor="cnpj">CNPJ</label>
            <input 
              type="text" 
              id="cnpj" 
              name="cnpj" 
              value={formData.cnpj} 
              onChange={handleChange} 
              placeholder="12.345.678/0001-90"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="contato@dentalsync.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="telefone">Telefone</label>
            <input 
              type="text" 
              id="telefone" 
              name="telefone" 
              value={formData.telefone} 
              onChange={handleChange} 
              placeholder="(11) 98765-4321"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="endereco">Endereço</label>
          <input 
            type="text" 
            id="endereco" 
            name="endereco" 
            value={formData.endereco} 
            onChange={handleChange} 
            placeholder="Av. Paulista, 1000 - São Paulo, SP"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save">
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
};

export default InformacaoSection; 