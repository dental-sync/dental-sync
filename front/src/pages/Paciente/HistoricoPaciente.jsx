import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './HistoricoPaciente.css';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import api from '../../axios-config';

const HistoricoPaciente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar dados do paciente
        const pacienteResponse = await api.get(`/paciente/${id}`);
        setPaciente({
          id: pacienteResponse.data.id,
          nome: pacienteResponse.data.nome,
          email: pacienteResponse.data.email,
          telefone: pacienteResponse.data.telefone || '-',
          dataNascimento: pacienteResponse.data.dataNascimento
        });
        // Buscar histórico de trabalhos
        const historicoResponse = await api.get(`/paciente/${id}/historico`);
        setHistorico(historicoResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Ocorreu um erro ao buscar os dados. Tente novamente mais tarde.');
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleVoltar = () => {
    navigate('/paciente');
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="historico-protetico-page">
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
        <h1 className="page-title">Histórico do Paciente</h1>
      </div>
      {error && <div className="error-message">{error}</div>}
      {paciente && (
        <div className="protetico-info">
          <h2 className="protetico-info-title">Informações do Paciente</h2>
          <div className="protetico-details protetico-details-grid">
            <span className="detail-label">Nome:</span>
            <span className="detail-value">{paciente.nome}</span>
            <span className="detail-label">Email:</span>
            <span className="detail-value">{paciente.email}</span>
            <span className="detail-label">Telefone:</span>
            <span className="detail-value">{paciente.telefone}</span>
            <span className="detail-label">Data de Nascimento:</span>
            <span className="detail-value">{paciente.dataNascimento ? new Date(paciente.dataNascimento).toLocaleDateString('pt-BR') : '-'}</span>
          </div>
        </div>
      )}
      <div className="historico-container">
        <h3>Histórico de Trabalhos</h3>
        {historico.length === 0 ? (
          <p className="no-history">Nenhum trabalho encontrado para este paciente.</p>
        ) : (
          <div className="trabalhos-lista">
            {historico
              .slice()
              .sort((a, b) => new Date(b.dataEntrega) - new Date(a.dataEntrega))
              .map((item, idx) => (
                <div className="trabalho-card" key={idx}>
                  <div className="trabalho-info">
                    <div className="trabalho-servico">{item.nomeServico}</div>
                    <div className="trabalho-detalhes">
                      <span className="trabalho-dentista">Dentista: {item.nomeDentista}</span>
                      <span className="trabalho-data">Data: {new Date(item.dataEntrega).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="trabalho-valor">
                    {item.valorTotal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricoPaciente;
