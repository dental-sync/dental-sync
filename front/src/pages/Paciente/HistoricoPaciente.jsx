import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './HistoricoPaciente.css';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import axios from 'axios';

const HistoricoPaciente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [servicos, setServicos] = useState([]);
  
  //Buscar dados do paciente
  useEffect(() => {
    const fetchPaciente = async () => {
      try {
        const response = await axios.get(`/api/paciente/${id}`);
        setPaciente(response.data);
      } catch (err) {
        console.error('Erro ao buscar dados do paciente:', err);
        setError('Não foi possível carregar os dados do paciente');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaciente();
  }, [id]);
  
  //Buscar histórico de serviços (simulado por enquanto)
  useEffect(() => {
    const fetchServicos = async () => {
      try {
        //Esta API provavelmente não existe ainda, então estamos simulando dados
        //Futuramente, substituir por uma chamada real à API
        //const response = await axios.get(`/api/paciente/${id}/servicos`);
        
        //Dados simulados de serviços para este paciente
        const servicosSimulados = [
          {
            id: 'S001',
            data: '2024-06-15',
            tipo: 'Consulta Inicial',
            descricao: 'Avaliação odontológica completa',
            dentista: 'Dr. João Silva',
            valorTotal: 150.00,
            status: 'CONCLUIDO'
          },
          {
            id: 'S002',
            data: '2024-06-22',
            tipo: 'Tratamento',
            descricao: 'Restauração em resina composta (2 dentes)',
            dentista: 'Dra. Ana Oliveira',
            valorTotal: 280.00,
            status: 'CONCLUIDO'
          },
          {
            id: 'S003',
            data: '2024-07-05',
            tipo: 'Procedimento',
            descricao: 'Limpeza e aplicação de flúor',
            dentista: 'Dr. João Silva',
            valorTotal: 120.00,
            status: 'AGENDADO'
          }
        ];
        
        setServicos(servicosSimulados);
      } catch (err) {
        console.error('Erro ao buscar histórico de serviços:', err);
      }
    };
    
    if (paciente) {
      fetchServicos();
    }
  }, [paciente, id]);
  
  const handleVoltar = () => {
    navigate('/paciente');
  };
  
  const formatarData = (dataString) => {
    if (!dataString) return '-';
    
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };
  
  const formatarValor = (valor) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };
  
  if (loading) {
    return <div className="loading">Carregando...</div>;
  }
  
  if (error) {
    return (
      <div className="paciente-page">
        <div className="historico-paciente-page">
          <div className="error-container">
            <div className="error-message">{error}</div>
            <button onClick={handleVoltar} className="btn-voltar">
              Voltar para Lista de Pacientes
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="paciente-page">
      <div className="historico-paciente-page">
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
        
        <div className="paciente-info-card">
          <div className="paciente-info-header">
            <h2>{paciente.nome}</h2>
            <span className={`status-badge ${paciente.status ? 'status-ativo' : 'status-inativo'}`}>
              {paciente.status ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          
          <div className="paciente-info-details">
            <div className="info-group">
              <span className="info-label">ID:</span>
              <span className="info-value">{paciente.id}</span>
            </div>
            
            <div className="info-group">
              <span className="info-label">Email:</span>
              <span className="info-value">{paciente.email || '-'}</span>
            </div>
            
            <div className="info-group">
              <span className="info-label">Telefone:</span>
              <span className="info-value">{paciente.telefone || '-'}</span>
            </div>
            
            <div className="info-group">
              <span className="info-label">Data de Nascimento:</span>
              <span className="info-value">{formatarData(paciente.dataNascimento)}</span>
            </div>
            
            <div className="info-group">
              <span className="info-label">Último Serviço:</span>
              <span className="info-value">{formatarData(paciente.ultimoPedido)}</span>
            </div>
          </div>
        </div>
        
        <div className="historico-section">
          <h3 className="section-title">Histórico de Serviços</h3>
          
          {servicos.length > 0 ? (
            <div className="servicos-table-container">
              <table className="servicos-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th>Dentista</th>
                    <th>Valor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {servicos.map(servico => (
                    <tr key={servico.id}>
                      <td>{servico.id}</td>
                      <td>{formatarData(servico.data)}</td>
                      <td>{servico.tipo}</td>
                      <td>{servico.descricao}</td>
                      <td>{servico.dentista}</td>
                      <td>{formatarValor(servico.valorTotal)}</td>
                      <td>
                        <span className={`status-badge status-${servico.status.toLowerCase()}`}>
                          {servico.status === 'CONCLUIDO' ? 'Concluído' : 'Agendado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-historico">
              <p>Este paciente ainda não possui serviços registrados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricoPaciente;
