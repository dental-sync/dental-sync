import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditarPaciente.css';
import NotificationBell from '../../../components/NotificationBell/NotificationBell';
import axios from 'axios';

const EditarPaciente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    status: true
  });
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPaciente = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/paciente/${id}`);
        const statusBoolean = typeof response.data.status === 'boolean' 
          ? response.data.status 
          : response.data.status === 'ATIVO' || response.data.status === true;
          
        let dataFormatada = '';
        if (response.data.dataNascimento) {
          const dataOriginal = response.data.dataNascimento.split('T')[0];
          dataFormatada = dataOriginal;
        }
          
        setFormData({
          nome: response.data.nome || '',
          email: response.data.email || '',
          telefone: response.data.telefone || '',
          dataNascimento: dataFormatada,
          status: statusBoolean
        });
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar dados do paciente:', err);
        setError('Não foi possível carregar os dados do paciente. Tente novamente mais tarde.');
        setLoading(false);
      }
    };

    fetchPaciente();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    
    //Mantém no formato ISO (YYYY-MM-DD) para evitar problemas com timezone
    //O backend deve interpretar a data corretamente sem conversão adicional
    return dateString;
  };

  const formatarDataBR = (dataString) => {
    if (!dataString) return '';
    
    const partes = dataString.split('-');
    if (partes.length !== 3) return dataString;
    
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  const obterDataFormatadaBR = () => {
    return formData.dataNascimento ? formatarDataBR(formData.dataNascimento) : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    
    try {
      const pacienteData = {
        ...formData,
        dataNascimento: formatDateForAPI(formData.dataNascimento)
      };
      
      await axios.put(`http://localhost:8080/paciente/${id}`, pacienteData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/paciente', { state: { refresh: true } });
      }, 2000);
    } catch (err) {
      console.error('Erro ao atualizar paciente:', err);
      setError('Ocorreu um erro ao salvar as alterações. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const handleVoltar = () => {
    navigate('/paciente');
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="editar-paciente-page">
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
        <h1 className="page-title">Editar Paciente</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Paciente atualizado com sucesso!</div>}
      
      <form onSubmit={handleSubmit} className="paciente-form">
        <div className="form-group">
          <label htmlFor="nome">Nome Completo</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="telefone">Telefone</label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="dataNascimento">Data de Nascimento</label>
          <div className="data-nascimento-container">
            <input
              type="date"
              id="dataNascimento"
              name="dataNascimento"
              value={formData.dataNascimento}
              onChange={handleChange}
            />
            {formData.dataNascimento && (
              <div className="data-formatada-br">
                Formato BR: {obterDataFormatadaBR()}
              </div>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status.toString()}
            onChange={(e) => {
              setFormData({
                ...formData,
                status: e.target.value === 'true'
              });
            }}
          >
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={handleVoltar} className="btn-cancelar">
            Cancelar
          </button>
          <button type="submit" className="btn-salvar" disabled={enviando}>
            {enviando ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarPaciente;
