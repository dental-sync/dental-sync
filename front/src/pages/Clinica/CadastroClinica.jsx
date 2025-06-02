import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CadastroClinica.css';
import api from '../../axios-config';
import { toast } from 'react-toastify';

const CadastroClinica = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'O nome é obrigatório';
    } else if (formData.nome.length > 255) {
      newErrors.nome = 'O nome não pode ultrapassar 255 caracteres';
    }
    
    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'O CNPJ é obrigatório';
    } else if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ incorreto. Digite o padrão correto: XX.XXX.XXX/XXXX-XX';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cnpj') {
      // Remove caracteres não numéricos
      const digits = value.replace(/\D/g, '');
      let formattedValue = '';
      
      if (digits.length > 0) {
        // Limita a 14 dígitos
        const limitedDigits = digits.substring(0, 14);
        
        // Formata o CNPJ: XX.XXX.XXX/XXXX-XX
        if (limitedDigits.length > 0) {
          formattedValue = limitedDigits;
          if (limitedDigits.length > 2) {
            formattedValue = `${limitedDigits.substring(0, 2)}.${limitedDigits.substring(2)}`;
          }
          if (limitedDigits.length > 5) {
            formattedValue = `${formattedValue.substring(0, 6)}.${formattedValue.substring(6)}`;
          }
          if (limitedDigits.length > 8) {
            formattedValue = `${formattedValue.substring(0, 10)}/${formattedValue.substring(10)}`;
          }
          if (limitedDigits.length > 12) {
            formattedValue = `${formattedValue.substring(0, 15)}-${formattedValue.substring(15)}`;
          }
        }
      }
      
      setFormData({
        ...formData,
        [name]: formattedValue
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const cnpjResponse = await checkUniqueCNPJ();

      if (cnpjResponse.cnpj) {
        setErrors(cnpjResponse);
        setLoading(false);
        return;
      }

      // Se chegou aqui, o CNPJ não está duplicado
      const clinicaData = {
        nome: formData.nome,
        cnpj: formData.cnpj
      };

      await api.post('/clinicas', clinicaData);
      
      // Limpa qualquer estado de navegação existente
      window.history.replaceState({}, document.title);
      
      // Navegar para a página de listagem com mensagem de sucesso e flag de refresh
      navigate('/clinica', { 
        state: { 
          success: 'Clínica cadastrada com sucesso!',
          refresh: true 
        } 
      });
    } catch (error) {
      console.error('Erro ao cadastrar clínica:', error);
      
      if (error.response) {
        const errorMessage = error.response.data;
        console.log('Mensagem de erro:', errorMessage);
        
        if (typeof errorMessage === 'string') {
          setErrors({ cnpj: errorMessage });
        } else if (errorMessage.message) {
          setErrors({ cnpj: errorMessage.message });
        } else {
          setErrors({ cnpj: 'Ocorreu um erro ao cadastrar a clínica. Tente novamente.' });
        }
      } else {
        setErrors({ cnpj: 'Erro de conexão. Verifique sua internet e tente novamente.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    navigate('/clinica');
  };

  const checkUniqueCNPJ = async () => {
    try {
      const cnpjResponse = await api.get(`/clinicas/cnpj/${formData.cnpj}`).catch(() => ({ data: null }));
      
      if (cnpjResponse.data) {
        return { cnpj: 'CNPJ já cadastrado' };
      }
      
      return {};
    } catch (error) {
      console.error('Erro ao verificar CNPJ:', error);
      return {};
    }
  };

  return (
    <div className="clinica-page">
      <div className="cadastro-clinica-page">
        <div className="back-navigation">
          <button onClick={handleVoltar} className="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="page-title">Cadastro de Clínica</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="clinica-form">
          <div className="form-group">
            <label htmlFor="nome" className="required">Nome da Clínica</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={errors.nome ? 'input-error' : ''}
              placeholder="Digite o nome da clínica"
            />
            {errors.nome && <span className="error-text">{errors.nome}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="cnpj" className="required">CNPJ</label>
            <input
              type="text"
              id="cnpj"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              className={errors.cnpj ? 'input-error' : ''}
              placeholder="XX.XXX.XXX/XXXX-XX"
            />
            {errors.cnpj && <span className="error-text">{errors.cnpj}</span>}
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancelar"
              onClick={handleVoltar}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-salvar"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroClinica; 