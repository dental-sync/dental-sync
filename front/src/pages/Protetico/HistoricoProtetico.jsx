import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './HistoricoProtetico.css';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import useNotifications from '../../hooks/useNotifications';
import api from '../../axios-config';

const HistoricoProtetico = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const [protetico, setProtetico] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar dados do protético
        const proteticoResponse = await api.get(`/proteticos/${id}`);
        
        // Verificar o status baseado no isActive
        let statusText = "INATIVO";
        if (proteticoResponse.data.isActive === true) {
          statusText = "ATIVO";
        }
        
        setProtetico({
          id: proteticoResponse.data.id,
          nome: proteticoResponse.data.nome,
          email: proteticoResponse.data.email,
          telefone: proteticoResponse.data.telefone || '-',
          cargo: proteticoResponse.data.isAdmin ? 'Admin' : 'Protetico',
          cro: proteticoResponse.data.cro,
          status: statusText
        });
        
        // Buscar histórico de trabalhos
        const historicoResponse = await api.get(`/proteticos/${id}/historico`);
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
    navigate('/protetico');
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
        <h1 className="page-title">Histórico do Protético</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {protetico && (
        <div className="protetico-info">
          <h2 className="protetico-info-title">Informações do Protético</h2>
          <div className="protetico-details protetico-details-grid">
            <span className="detail-label">Nome:</span>
            <span className="detail-value">{protetico.nome}</span>
            <span className="detail-label">Email:</span>
            <span className="detail-value">{protetico.email}</span>
            <span className="detail-label">Telefone:</span>
            <span className="detail-value">{protetico.telefone}</span>
            <span className="detail-label">CRO:</span>
            <span className="detail-value">{protetico.cro}</span>
            <span className="detail-label">Cargo:</span>
            <span className="detail-value">{protetico.cargo}</span>
          </div>
        </div>
      )}
      
      <div className="historico-container">
        <h3>Histórico de Trabalhos</h3>
        {historico.length === 0 ? (
          <p className="no-history">Nenhum trabalho encontrado para este protético.</p>
        ) : (
          <div className="trabalhos-lista">
            {historico
              .slice() // para não mutar o estado
              .sort((a, b) => new Date(b.dataEntrega) - new Date(a.dataEntrega))
              .map((item, idx) => (
                <div className="trabalho-card" key={idx}>
                  <div className="trabalho-info">
                    <div className="trabalho-servico">{item.nomeServico}</div>
                    <div className="trabalho-detalhes">
                      <span className="trabalho-paciente">Paciente: {item.nomePaciente}</span>
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

export default HistoricoProtetico; 