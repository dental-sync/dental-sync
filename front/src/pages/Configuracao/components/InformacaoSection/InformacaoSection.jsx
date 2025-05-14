import React, { useState } from 'react';
import './InformacaoSection.css';

const InformacaoSection = () => {
  const [laboratoryData, setLaboratoryData] = useState({
    nome: 'Dental Sync Lab',
    cnpj: '12.345.678/0001-90',
    email: 'contato@dentalsync.com',
    telefone: '(11) 98765-4321',
    endereco: 'Av. Paulista, 1000 - São Paulo, SP',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLaboratoryData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implementar a lógica para salvar os dados
    console.log('Dados a serem salvos:', laboratoryData);
  };

  return (
    <div className="informacao-section">
      <div className="section-header">
        <h2>Informações do Laboratório</h2>
        <p className="section-description">Gerencie as informações básicas do seu laboratório</p>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label htmlFor="nome">Nome do Laboratório</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={laboratoryData.nome}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="cnpj">CNPJ</label>
          <input
            type="text"
            id="cnpj"
            name="cnpj"
            value={laboratoryData.cnpj}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={laboratoryData.email}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="telefone">Telefone</label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={laboratoryData.telefone}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="endereco">Endereço</label>
          <input
            type="text"
            id="endereco"
            name="endereco"
            value={laboratoryData.endereco}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button">Salvar Alterações</button>
        </div>
      </form>
    </div>
  );
};

export default InformacaoSection; 