import React, { useState, useEffect } from 'react';
import './ModalCadastroClinica.css';

const ModalCadastroClinica = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Limpa os campos quando o modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nome: '',
        cnpj: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateCNPJ = (cnpj) => {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/\D/g, '');
    
    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) {
      return false;
    }
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpj)) {
      return false;
    }
    
    // Peso para o primeiro dígito verificador
    const peso1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    // Peso para o segundo dígito verificador
    const peso2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    // Calcula o primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 12; i++) {
      soma += parseInt(cnpj.charAt(i)) * peso1[i];
    }
    let digito1 = 11 - (soma % 11);
    if (digito1 > 9) {
      digito1 = 0;
    }
    
    // Verifica o primeiro dígito
    if (digito1 !== parseInt(cnpj.charAt(12))) {
      return false;
    }
    
    // Calcula o segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 13; i++) {
      soma += parseInt(cnpj.charAt(i)) * peso2[i];
    }
    let digito2 = 11 - (soma % 11);
    if (digito2 > 9) {
      digito2 = 0;
    }
    
    // Verifica o segundo dígito
    return digito2 === parseInt(cnpj.charAt(13));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cnpj') {
      const formattedValue = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 18);
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome da clínica é obrigatório';
    }
    
    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(formData.cnpj)) {
      newErrors.cnpj = 'Formato de CNPJ inválido. Use o formato: XX.XXX.XXX/YYYY-ZZ';
    } else if (!validateCNPJ(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/clinicas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar clínica');
      }

      const clinicaData = await response.json();
      onSuccess(clinicaData);
      onClose();
    } catch (error) {
      if (error.message === 'CNPJ já cadastrado') {
        setErrors({ cnpj: 'CNPJ já cadastrado' });
      } else {
        setErrors({ submit: 'Erro ao salvar clínica. Tente novamente.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Cadastrar Nova Clínica</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        {errors.submit && (
          <div className="error-message">
            {errors.submit}
          </div>
        )}
        
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="required">Nome da Clínica</label>
            {errors.cnpj && (
              <div className="error-message">
                {errors.cnpj}
              </div>
            )}
            {errors.nome && !errors.cnpj && (
              <div className="error-message">
                {errors.nome}
              </div>
            )}
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={errors.nome ? 'input-error' : ''}
              placeholder="Digite o nome da clínica"
            />
          </div>
          
          <div className="form-group">
            <label className="required">CNPJ</label>
            <input
              type="text"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              placeholder="XX.XXX.XXX/YYYY-ZZ"
              className={errors.cnpj ? 'input-error' : ''}
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-cancelar" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-salvar" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCadastroClinica; 