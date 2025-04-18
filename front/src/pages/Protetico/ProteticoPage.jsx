import React, { useState, useEffect } from 'react';
import './ProteticoPage.css';
import SearchBar from '../../components/SearchBar/SearchBar';
import ActionButton from '../../components/ActionButton/ActionButton';
import ProteticoTable from '../../components/ProteticoTable/ProteticoTable';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProteticoPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [proteticos, setProteticos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  
  // Buscar lista de protéticos da API
  useEffect(() => {
    const fetchProteticos = async () => {
      try {
        setLoading(true);
        
        try {
          const response = await axios.get('/api/proteticos');
          
          // Se a chamada for bem-sucedida, usar os dados da API
          const proteticosFormatados = response.data.map(protetico => ({
            id: protetico.id,
            nome: protetico.nome,
            cro: protetico.cro,
            cargo: protetico.isAdmin ? 'Admin' : 'Técnico',
            telefone: protetico.telefone || '-',
            status: protetico.status || 'ATIVO'
          }));
          
          setProteticos(proteticosFormatados);
        } catch (apiErr) {
          console.error('Não foi possível acessar a API:', apiErr);
          // Inicializar com array vazio em caso de erro
          setProteticos([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar protéticos:', err);
        setProteticos([]);
        setLoading(false);
      }
    };
    
    fetchProteticos();
  }, []);

  // Filtrar protéticos conforme a busca
  const proteticosFiltrados = searchQuery
    ? proteticos.filter(protetico => 
        protetico.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        protetico.cro?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        protetico.cargo?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : proteticos;

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleExportar = () => {
    console.log('Exportando dados...');
    // Implementação futura: exportação para CSV ou PDF
  };

  const handleNovo = () => {
    navigate('/protetico/cadastro');
  };

  if (loading) {
    return <div className="loading">Carregando protéticos...</div>;
  }

  return (
    <div className="protetico-page">
      <div className="page-top">
        <div className="notification-container">
          <NotificationBell count={2} />
        </div>
      </div>
      
      <div className="page-header">
        <h1 className="page-title">Protéticos</h1>
        <div className="header-actions">
          <ActionButton 
            label="Filtrar" 
            icon="filter"
            onClick={() => console.log('Filtrar')} 
          />
          <ActionButton 
            label="Exportar" 
            icon="export"
            onClick={handleExportar} 
          />
        </div>
      </div>
      
      <div className="search-container">
        <SearchBar 
          placeholder="Buscar por nome, CRO ou cargo..." 
          onSearch={handleSearch} 
        />
        <ActionButton 
          label="Novo" 
          variant="primary"
          onClick={handleNovo}
        />
      </div>
      
      <div className="table-section">
        {searchQuery && proteticosFiltrados.length === 0 && (
          <div className="search-info">
            Nenhum protético encontrado para a busca "{searchQuery}".
          </div>
        )}
        <ProteticoTable proteticos={proteticosFiltrados} />
      </div>
    </div>
  );
};

export default ProteticoPage; 