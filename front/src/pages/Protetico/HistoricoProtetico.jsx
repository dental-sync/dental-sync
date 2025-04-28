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
        // Buscar dados do protético
        const proteticoResponse = await axios.get(`http://localhost:8080/proteticos/${id}`);
        
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
        
        // Comentado temporariamente a busca do histórico
        // const historicoResponse = await axios.get(`http://localhost:8080/proteticos/${id}/historico`);
        // setHistorico(historicoResponse.data);
        
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
                <div className="historico-cell" data-label="Data">
                  {new Date(item.data).toLocaleDateString('pt-BR')}
                </div>
                <div className="historico-cell" data-label="Descrição">
                  {item.descricao}
                </div>
                <div className="historico-cell" data-label="Usuário">
                  {item.usuario}
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