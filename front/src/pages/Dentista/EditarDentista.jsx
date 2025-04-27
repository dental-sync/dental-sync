import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditarDentista.css';
import axios from 'axios';

const EditarDentista = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    cro: '',
    telefone: '',
    email: '',
    clinicaId: '',
    clinicasAssociadas: [],
    novaClinica: {
      nome: '',
      cnpj: ''
    },
    status: true
  });
  
  const [clinicas, setClinicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [showNovaClinica, setShowNovaClinica] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dentistaResponse, clinicasResponse] = await Promise.all([
          axios.get(`http://localhost:8080/dentistas/${id}`),
          axios.get('http://localhost:8080/clinicas')
        ]);
        
        const dentista = dentistaResponse.data;
        setFormData({
          ...formData,
          nome: dentista.nome,
          cro: dentista.cro,
          telefone: dentista.telefone,
          email: dentista.email,
          clinicasAssociadas: dentista.clinicas || [],
          status: dentista.status
        });
        
        setClinicas(clinicasResponse.data);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setErrors({ general: 'Não foi possível carregar os dados do dentista.' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'O nome é obrigatório';
    } else if (formData.nome.trim().split(' ').length < 2) {
      newErrors.nome = 'Por favor, informe o nome e sobrenome';
    }
    
    if (!formData.cro.trim()) {
      newErrors.cro = 'O CRO é obrigatório';
    } else if (!/^CRO-[A-Z]{2}-[A-Z]{2,3}-\d{4,5}$/.test(formData.cro)) {
      newErrors.cro = 'Formato de CRO inválido. Use o formato: CRO-SC-CD-12345 ou CRO-SC-TPD-1234';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'O email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.com$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido. O email deve terminar com .com';
    }
    
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'O telefone é obrigatório';
    } else if (!/^\(\d{2}\)\s\d{5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = 'Formato de telefone inválido. Use o formato: (99) 99999-9999';
    }

    if (showNovaClinica) {
      if (!formData.novaClinica.nome.trim()) {
        newErrors['novaClinica.nome'] = 'O nome da clínica é obrigatório';
      }
      
      if (!formData.novaClinica.cnpj.trim()) {
        newErrors['novaClinica.cnpj'] = 'O CNPJ é obrigatório';
      } else if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(formData.novaClinica.cnpj)) {
        newErrors['novaClinica.cnpj'] = 'Formato de CNPJ inválido. Use o formato: 99.999.999/9999-99';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('novaClinica.')) {
      const field = name.split('.')[1];
      
      if (field === 'cnpj') {
        const formattedValue = value
          .replace(/\D/g, '')
          .replace(/^(\d{2})(\d)/, '$1.$2')
          .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
          .replace(/\.(\d{3})(\d)/, '.$1/$2')
          .replace(/(\d{4})(\d)/, '$1-$2')
          .substring(0, 18);
        
        setFormData({
          ...formData,
          novaClinica: {
            ...formData.novaClinica,
            cnpj: formattedValue
          }
        });
        return;
      }
      
      setFormData({
        ...formData,
        novaClinica: {
          ...formData.novaClinica,
          [field]: value
        }
      });
      return;
    }
    
    if (name === 'cro') {
      const formattedValue = value
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, '')
        .replace(/^CRO-?([A-Z]{2})?-?([A-Z]{2,3})?-?(\d+)?$/, (match, estado, categoria, numero) => {
          let result = 'CRO';
          if (estado) result += `-${estado}`;
          if (categoria) result += `-${categoria}`;
          if (numero) result += `-${numero.substring(0, 5)}`;
          return result;
        })
        .substring(0, 15);
      setFormData({
        ...formData,
        [name]: formattedValue
      });
      return;
    }
    
    if (name === 'telefone') {
      const formattedValue = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15);
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
    
    setSaving(true);
    
    try {
      let clinicasDosDentista = [...formData.clinicasAssociadas];
      
      if (showNovaClinica) {
        const clinicaResponse = await axios.post('http://localhost:8080/clinicas', formData.novaClinica);
        clinicasDosDentista.push(clinicaResponse.data);
      }
      
      const dentistaData = {
        nome: formData.nome,
        cro: formData.cro,
        telefone: formData.telefone,
        email: formData.email,
        clinicas: clinicasDosDentista,
        status: formData.status
      };
      
      await axios.put(`http://localhost:8080/dentistas/${id}`, dentistaData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/dentista', { state: { refresh: true } });
      }, 2000);
    } catch (error) {
      console.error('Erro ao atualizar dentista:', error);
      
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
          setErrors({ general: 'Ocorreu um erro ao atualizar o dentista. Tente novamente.' });
        }
      } else {
        setErrors({ general: 'Erro de conexão. Verifique sua internet e tente novamente.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleVoltar = () => {
    navigate('/dentista');
  };

  if (loading) {
    return <div className="loading">Carregando dados do dentista...</div>;
  }

  return (
    <div className="dentista-page">
      <div className="editar-dentista-page">
        <div className="back-navigation">
          <button onClick={handleVoltar} className="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="page-title">Editar Dentista</h1>
        </div>
        
        {success && (
          <div className="success-message">
            Dentista atualizado com sucesso!
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
              type="text"
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
            <label htmlFor="clinicaId">Clínicas</label>
            <div className="clinicas-container">
              <div className="clinicas-tags">
                {formData.clinicasAssociadas.map(clinica => (
                  <div key={clinica.id} className="clinica-tag">
                    <span>{clinica.nome}</span>
                    <button
                      type="button"
                      className="remove-clinica"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          clinicasAssociadas: formData.clinicasAssociadas.filter(c => c.id !== clinica.id)
                        });
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="clinica-options">
                <select
                  id="clinicaId"
                  name="clinicaId"
                  value={formData.clinicaId}
                  onChange={(e) => {
                    const clinicaId = e.target.value;
                    if (clinicaId && !formData.clinicasAssociadas.some(c => c.id.toString() === clinicaId)) {
                      const clinicaSelecionada = clinicas.find(c => c.id.toString() === clinicaId);
                      if (clinicaSelecionada) {
                        setFormData({
                          ...formData,
                          clinicasAssociadas: [...formData.clinicasAssociadas, clinicaSelecionada],
                          clinicaId: ''
                        });
                      }
                    }
                  }}
                  className={errors.clinicaId ? 'input-error' : ''}
                  disabled={showNovaClinica}
                >
                  <option value="">Selecione uma clínica</option>
                  {clinicas
                    .filter(clinica => !formData.clinicasAssociadas.some(c => c.id === clinica.id))
                    .map(clinica => (
                      <option key={clinica.id} value={clinica.id}>
                        {clinica.nome}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  className="toggle-nova-clinica"
                  onClick={() => setShowNovaClinica(!showNovaClinica)}
                >
                  {showNovaClinica ? '←' : '+'}
                </button>
              </div>
            </div>
            {errors.clinicaId && <span className="error-text">{errors.clinicaId}</span>}
          </div>
          
          {showNovaClinica && (
            <div className="nova-clinica-form">
              <div className="form-group">
                <label htmlFor="novaClinica.nome">Nome da Clínica</label>
                <input
                  type="text"
                  id="novaClinica.nome"
                  name="novaClinica.nome"
                  value={formData.novaClinica.nome}
                  onChange={handleChange}
                  className={errors['novaClinica.nome'] ? 'input-error' : ''}
                  required
                />
                {errors['novaClinica.nome'] && <span className="error-text">{errors['novaClinica.nome']}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="novaClinica.cnpj">CNPJ</label>
                <input
                  type="text"
                  id="novaClinica.cnpj"
                  name="novaClinica.cnpj"
                  value={formData.novaClinica.cnpj}
                  onChange={handleChange}
                  className={errors['novaClinica.cnpj'] ? 'input-error' : ''}
                  required
                />
                {errors['novaClinica.cnpj'] && <span className="error-text">{errors['novaClinica.cnpj']}</span>}
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value={true}>Ativo</option>
              <option value={false}>Inativo</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={handleVoltar} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" className="save-button" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarDentista; 