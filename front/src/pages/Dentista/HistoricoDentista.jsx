import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './HistoricoDentista.css';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import useNotifications from '../../hooks/useNotifications';
import api from '../../axios-config';

const HistoricoDentista = () => {
  const { notifications } = useNotifications();
  const { id } = useParams();
  const navigate = useNavigate();
  const [dentista, setDentista] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar dados do dentista
        const dentistaResponse = await api.get(`/dentistas/${id}`);
        setDentista({
          id: dentistaResponse.data.id,
          nome: dentistaResponse.data.nome,
          email: dentistaResponse.data.email,
          telefone: dentistaResponse.data.telefone || '-',
          cro: dentistaResponse.data.cro
        });
        // Buscar histórico de trabalhos
        const historicoResponse = await api.get(`/dentistas/${id}/historico`);
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
    navigate('/dentista');
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="historico-protetico-page">
              <div className="page-top">
          <div className="notification-container">
            <NotificationBell 
            count={notifications.total}
            baixoEstoque={notifications.baixoEstoque}
            semEstoque={notifications.semEstoque}
            materiaisBaixoEstoque={notifications.materiaisBaixoEstoque}
            materiaisSemEstoque={notifications.materiaisSemEstoque}
          />
          </div>
        </div>
      <div className="back-navigation">
        <button onClick={handleVoltar} className="back-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="page-title">Histórico do Dentista</h1>
      </div>
      {error && <div className="error-message">{error}</div>}
      {dentista && (
        <div className="protetico-info">
          <h2 className="protetico-info-title">Informações do Dentista</h2>
          <div className="protetico-details protetico-details-grid">
            <span className="detail-label">Nome:</span>
            <span className="detail-value">{dentista.nome}</span>
            <span className="detail-label">Email:</span>
            <span className="detail-value">{dentista.email}</span>
            <span className="detail-label">Telefone:</span>
            <span className="detail-value">{dentista.telefone}</span>
            <span className="detail-label">CRO:</span>
            <span className="detail-value">{dentista.cro}</span>
          </div>
        </div>
      )}
      <div className="historico-container">
        <h3>Histórico de Trabalhos</h3>
        {historico.length === 0 ? (
          <p className="no-history">Nenhum trabalho encontrado para este dentista.</p>
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
                      <span className="trabalho-paciente">Paciente: {item.nomePaciente}</span>
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

export default HistoricoDentista; 