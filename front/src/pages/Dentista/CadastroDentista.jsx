import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CadastroDentista.css';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import axios from 'axios';

const CadastroDentista = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cro: '',
    telefone: '',
    email: '',
    clinicas: []
  });
  
  const [clinicas, setClinicas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClinicas = async () => {
      try {
        const response = await axios.get('http://localhost:8080/clinicas');
        setClinicas(response.data);
      } catch (err) {
        console.error('Erro ao buscar clínicas:', err);
        setErrors({ general: 'Erro ao carregar lista de clínicas' });
      }
    };

    fetchClinicas();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'O nome é obrigatório';
    }
    
    if (!formData.cro.trim()) {
      newErrors.cro = 'O CRO é obrigatório';
    } else if (!/^(CRO-[A-Z]{2}\s?\d{1,6})|(\d{1,6}\s?CRO-[A-Z]{2})$/.test(formData.cro)) {
      newErrors.cro = 'Formato de CRO inválido. Use o formato: CRO-XX NNNNNN ou NNNNNN CRO-XX';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'O email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'O telefone é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
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

  const handleClinicaChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({
      ...formData,
      clinicas: selectedOptions
    });
  };

  const handleNovaClinica = () => {
    navigate('/clinica/cadastro');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const dentistaData = {
        ...formData,
        status: true
      };
      
      await axios.post('http://localhost:8080/dentistas', dentistaData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/dentista', { state: { refresh: true } });
      }, 2000);
    } catch (error) {
      console.error('Erro ao cadastrar dentista:', error);
      
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          const apiErrors = {};
          error.response.data.errors.forEach(err => {
            apiErrors[err.field] = err.message;
          });
          setErrors(apiErrors);
        } else if (error.response.data.message) {
          setErrors({ general: error.response.data.message });
        } else {
          setErrors({ general: 'Ocorreu um erro ao cadastrar o dentista. Tente novamente.' });
        }
      } else {
        setErrors({ general: 'Erro de conexão. Verifique sua internet e tente novamente.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    navigate('/dentista');
  };

  return (
    <div className="cadastro-dentista-page">
      <div className="page-top">
        <div className="notification-container">
          <NotificationBell count={2} />
        </div>
      </div>
      
      <div className="back-navigation">
        <button onClick={handleVoltar} className="back-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="page-title">Cadastro de Dentista</h1>
      </div>
      
      {success && (
        <div className="success-message">
          Dentista cadastrado com sucesso!
        </div>
      )}
      
      {errors.general && (
        <div className="error-message">
          {errors.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="dentista-form">
        <div className="form-group">
          <label htmlFor="nome">Nome Completo</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className={errors.nome ? 'input-error' : ''}
            required
          />
          {errors.nome && <span className="error-text">{errors.nome}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="cro">CRO</label>
          <input
            type="text"
            id="cro"
            name="cro"
            value={formData.cro}
            onChange={handleChange}
            className={errors.cro ? 'input-error' : ''}
            required
          />
          {errors.cro && <span className="error-text">{errors.cro}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'input-error' : ''}
            required
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="telefone">Telefone</label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            className={errors.telefone ? 'input-error' : ''}
            required
          />
          {errors.telefone && <span className="error-text">{errors.telefone}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="clinicas">Clínicas</label>
          <div className="clinicas-container">
            <select
              id="clinicas"
              name="clinicas"
              multiple
              value={formData.clinicas}
              onChange={handleClinicaChange}
              className="clinicas-select"
            >
              {clinicas.map(clinica => (
                <option key={clinica.id} value={clinica.id}>
                  {clinica.nome}
                </option>
              ))}
            </select>
            <button 
              type="button"
              className="nova-clinica-button"
              onClick={handleNovaClinica}
              title="Cadastrar nova clínica"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
          <small className="select-hint">Mantenha Ctrl pressionado para selecionar múltiplas clínicas</small>
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
  );
};

export default CadastroDentista; 