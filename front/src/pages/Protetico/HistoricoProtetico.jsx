import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './HistoricoProtetico.css';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import axios from 'axios';

const HistoricoProtetico = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [protetico, setProtetico] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Tenta buscar os dados do protético da API
        const proteticoResp = await axios.get(`/api/proteticos/${id}`);
        setProtetico(proteticoResp.data);
        
        // Tenta buscar o histórico do protético da API
        const historicoResp = await axios.get(`/api/proteticos/${id}/historico`);
        setHistorico(historicoResp.data);
      } catch (err) {
        console.error('Erro ao buscar dados da API:', err);
        
        // Se a API falhar, inicializa com dados vazios
        setProtetico({
          id: id,
          nome: "Protético não encontrado",
          email: "-",
          telefone: "-",
          cargo: "-",
          cro: "-",
          status: "INATIVO"
        });
        
        setHistorico([]);
        setError('Não foi possível carregar os dados. Tente novamente mais tarde.');
      } finally {
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
          <NotificationBell count={2} />
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
          <h2>{protetico.nome}</h2>
          <div className="protetico-details">
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{protetico.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Telefone:</span>
              <span className="detail-value">{protetico.telefone}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">CRO:</span>
              <span className="detail-value">{protetico.cro}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Cargo:</span>
              <span className="detail-value">{protetico.cargo}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className={`detail-value status-${protetico.status?.toLowerCase()}`}>
                {protetico.status}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="historico-container">
        <h3>Histórico de Alterações</h3>
        
        {historico.length === 0 ? (
          <p className="no-history">Nenhum registro de alteração encontrado.</p>
        ) : (
          <div className="historico-table">
            <div className="historico-header">
              <div className="historico-cell">Data</div>
              <div className="historico-cell">Descrição</div>
              <div className="historico-cell">Usuário</div>
            </div>
            
            {historico.map((item) => (
              <div key={item.id} className="historico-row">
                <div className="historico-cell">{new Date(item.data).toLocaleDateString('pt-BR')}</div>
                <div className="historico-cell">{item.descricao}</div>
                <div className="historico-cell">{item.usuario}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricoProtetico; 