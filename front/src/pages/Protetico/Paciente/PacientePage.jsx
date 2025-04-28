//importa funções do React e bibliotecas externas
import React, { useState, useEffect, useRef } from 'react';
import './PacientePage.css'; //estilo(style [css]) específico da página
import SearchBar from '../../../components/SearchBar/SearchBar'; //barra de busca personalizada (SearchBar [componente])
import ActionButton from '../../../components/ActionButton/ActionButton'; //botões com ícones (ActionButton [componente])
import PacienteTable from '../../../components/PacienteTable/PacienteTable'; //tabela de pacientes (PacienteTable [componente])
import NotificationBell from '../../../components/NotificationBell/NotificationBell'; //sininho de notificações (NotificationBell [componente])
import { useNavigate, useLocation } from 'react-router-dom'; //navegação e controle de rota (useNavigate [hook], useLocation [hook])
import axios from 'axios'; //para fazer requisições HTTP (axios [biblioteca]) 


const PacientePage = () => {
  //Estado para busca textual
  const [searchQuery, setSearchQuery] = useState('');

  //Lista de pacientes retornados pela API
  const [pacientes, setPacientes] = useState([]);

  //Tratamento de erro e carregamento
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //carregar os filtros
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  //Filtros aplicados na tabela
  const [filtros, setFiltros] = useState({
    status: 'todos'
  });

  //Controle de quando a lista deve ser atualizada
  const [refreshData, setRefreshData] = useState(0);

  //Ref para detectar clique fora do filtro
  const filterRef = useRef(null);

  //Hook para navegação
  const navigate = useNavigate();

  //Hook para acesso ao estado de navegação
  const location = useLocation();
  
  //Buscar lista de pacientes da API
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        setLoading(true);
        
        try {
          console.log('Buscando dados de pacientes da API...');
          const response = await axios.get('http://localhost:8080/paciente');
          
          //Se a chamada for bem-sucedida, usar os dados da API (SÓ QUANDO FOR BEM-SUCEDIDA)
          const pacientesFormatados = response.data.map(paciente => ({
            id: paciente.id,
            nome: paciente.nome,
            telefone: paciente.telefone || '-',
            email: paciente.email || '-',
            dataNascimento: paciente.dataNascimento ? new Date(paciente.dataNascimento).toLocaleDateString('pt-BR') : '-',
            ultimoServico: paciente.ultimoPedido ? new Date(paciente.ultimoPedido).toLocaleDateString('pt-BR') : '-',
            status: typeof paciente.isActive === 'boolean' ? paciente.isActive : 
                   paciente.isActive === true || paciente.isActive === 'true' || paciente.isActive === 'ATIVO'
          }));
          
          setPacientes(pacientesFormatados);
          console.log('Dados de pacientes recebidos:', pacientesFormatados);
        } catch (apiErr) {
          console.error('Não foi possível acessar a API:', apiErr);
          // Inicializar com array vazio em caso de erro
          setPacientes([]);
          setError('Não foi possível carregar os dados do servidor. Tente novamente mais tarde.');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar pacientes:', err);
        setPacientes([]);
        setLoading(false);
        setError('Ocorreu um erro inesperado. Tente novamente mais tarde.');
      }
    };
    
    fetchPacientes();
  }, [refreshData]);
  
  //Verificar se há parâmetro de atualização na URL
  useEffect(() => {
    
    if (location.state && location.state.refresh) {
      setRefreshData(prev => prev + 1);
    }
  }, [location.state]);

  //Esconder o filtro ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  //Lidar com a exclusão de um paciente
  const handlePacienteDeleted = (pacienteId) => {
   

    setPacientes(prevPacientes => 
      prevPacientes.filter(paciente => paciente.id !== pacienteId)
    );
    
    //Forçar uma nova busca de dados do servidor após um curto atraso
    //Isso garantirá que a lista esteja sincronizada com o banco de dados
    setTimeout(() => {
      setRefreshData(prev => prev + 1);
    }, 1000);
  };

 
  const pacientesFiltrados = pacientes
    .filter(paciente => {
      //Aplicar filtros de status
      if (filtros.status !== 'todos') {
        const statusValue = filtros.status === 'true';
        if (paciente.status !== statusValue) {
          return false;
        }
      }
      
      //Aplicar busca textual
      if (searchQuery) {
        return (
          paciente.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          paciente.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          paciente.telefone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (paciente.id?.toString() || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      return true;
    });

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const toggleFiltro = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value
    });
  };

  const handleLimparFiltros = () => {
    setFiltros({
      status: 'todos'
    });
  };

  const handleExportar = () => {
    console.log('Exportando dados...');
    //Implementação futura: exportação para CSV ou PDF
  };

  const handleNovo = () => {
    navigate('/paciente/cadastro');
  };
  
  const handleRefresh = () => {
    setRefreshData(prev => prev + 1);
  };

  //Filtrar pacientes de acordo com os filtros aplicados
  const filtrarPacientes = () => {
    if (!pacientes || pacientes.length === 0) return [];
    
    let resultado = [...pacientes];
    
    //Aplicar filtro de status
    if (filtros.status !== 'todos') {
      const statusValue = filtros.status === 'true';
      resultado = resultado.filter(paciente => paciente.status === statusValue);
    }
    
    //Aplicar filtro de busca textual
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      resultado = resultado.filter(paciente => 
        paciente.nome?.toLowerCase().includes(query) ||
        paciente.email?.toLowerCase().includes(query) ||
        paciente.telefone?.toLowerCase().includes(query)
      );
    }
    
    return resultado;
  };

  if (loading) {
    return <div className="loading">Carregando pacientes...</div>;
  }

  return (
    <div className="paciente-page">
      <div className="page-top">
        <div className="notification-container">
          <NotificationBell count={2} />
        </div>
      </div>
      
      <div className="page-header">
        <h1 className="page-title">Pacientes</h1>
        <div className="header-actions">
          <div className="filter-container" ref={filterRef}>
            <ActionButton 
              label="Filtrar" 
              icon="filter"
              onClick={toggleFiltro} 
              active={isFilterOpen || filtros.status !== 'todos'}
            />
            
            {isFilterOpen && (
              <div className="filter-dropdown">
                <h3>Filtros</h3>
                
                <div className="filter-group">
                  <label htmlFor="status">Status</label>
                  <select 
                    id="status" 
                    name="status" 
                    value={filtros.status} 
                    onChange={handleFiltroChange}
                    className="filter-select"
                  >
                    <option value="todos">Todos</option>
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
                
                <div className="filter-actions">
                  <button onClick={handleLimparFiltros} className="clear-filter-button">
                    Limpar filtros
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <ActionButton 
            label="Exportar" 
            icon="export"
            onClick={handleExportar} 
          />
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={handleRefresh} className="refresh-button">
            Tentar novamente
          </button>
        </div>
      )}
      
      <div className="search-container">
        <SearchBar 
          placeholder="Buscar por nome, e-mail ou telefone..." 
          onSearch={handleSearch} 
        />
        <ActionButton 
          label="Novo" 
          variant="primary"
          onClick={handleNovo}
        />
      </div>
      
      <div className="table-section">
        {searchQuery && pacientesFiltrados.length === 0 && (
          <div className="search-info">
            Nenhum paciente encontrado para a busca "{searchQuery}".
          </div>
        )}
        {!searchQuery && pacientesFiltrados.length === 0 && filtros.status !== 'todos' ? (
          <div className="filter-info">
            Nenhum paciente encontrado com os filtros aplicados.
          </div>
        ) : null}
        {pacientesFiltrados.length === 0 && !error && filtros.status === 'todos' && !searchQuery ? (
          <div className="empty-state">
            <p>Nenhum paciente cadastrado. Clique em "Novo" para adicionar um paciente.</p>
          </div>
        ) : null}
        <PacienteTable 
          pacientes={pacientesFiltrados} 
          onPacienteDeleted={handlePacienteDeleted}
        />
      </div>
    </div>
  );
};

export default PacientePage;
