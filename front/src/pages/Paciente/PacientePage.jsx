//importa funções do React e bibliotecas externas
import React, { useState, useEffect, useRef } from 'react';
import './PacientePage.css'; //estilo(style [css]) específico da página
import SearchBar from '../../components/SearchBar/SearchBar'; //barra de busca personalizada (SearchBar [componente])
import ActionButton from '../../components/ActionButton/ActionButton'; //botões com ícones (ActionButton [componente])
import PacienteTable from '../../components/PacienteTable/PacienteTable'; //tabela de pacientes (PacienteTable [componente])
import NotificationBell from '../../components/NotificationBell/NotificationBell'; //sininho de notificações (NotificationBell [componente])
import ExportDropdown from '../../components/ExportDropdown/ExportDropdown'; //componente de exportação de dados
import { useNavigate, useLocation } from 'react-router-dom'; //navegação e controle de rota (useNavigate [hook], useLocation [hook])
import axios from 'axios'; //para fazer requisições HTTP (axios [biblioteca]) 
import { toast } from 'react-toastify';

const PacientePage = () => {
  
  const [searchQuery, setSearchQuery] = useState('');

  
  const [pacientes, setPacientes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  
  const [filtros, setFiltros] = useState({
    isActive: 'todos'
  });

  const [refreshData, setRefreshData] = useState(0);
  
  const filterRef = useRef(null);

  const navigate = useNavigate();

  
  const location = useLocation();
  
 
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        setLoading(true);
        
        try {
          console.log('Buscando dados de pacientes da API...');
          const response = await axios.get('http://localhost:8080/paciente');
          
          
          const pacientesFormatados = response.data.map(paciente => {
            // Para garantir que não haja problemas com fuso horário, vamos processar manualmente a data
            let dataFormatada = '-';
            if (paciente.dataNascimento) {
              // A data vem no formato ISO do backend (YYYY-MM-DD)
              const [ano, mes, dia] = paciente.dataNascimento.split('-');
              dataFormatada = `${dia}/${mes}/${ano}`;
            }
            
            let ultimoServicoFormatado = '-';
            if (paciente.ultimoPedido) {
              const [ano, mes, dia] = paciente.ultimoPedido.split('-');
              ultimoServicoFormatado = `${dia}/${mes}/${ano}`;
            }
            
            return {
              id: paciente.id,
              nome: paciente.nome,
              telefone: paciente.telefone || '-',
              email: paciente.email || '-',
              dataNascimento: dataFormatada,
              ultimoServico: ultimoServicoFormatado,
              isActive: paciente.isActive ? 'ATIVO' : 'INATIVO',
              status: paciente.isActive ? 'ATIVO' : 'INATIVO'
            };
          });
          
          setPacientes(pacientesFormatados);
          console.log('Dados de pacientes recebidos:', pacientesFormatados);
        } catch (apiErr) {
          console.error('Não foi possível acessar a API:', apiErr);
         
          setPacientes([]);
          setError('Não foi possível carregar os dados do servidor. Tente novamente mais tarde.');
          
          toast.error('Não foi possível carregar os dados do servidor. Tente novamente mais tarde.', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar pacientes:', err);
        setPacientes([]);
        setLoading(false);
        setError('Ocorreu um erro inesperado. Tente novamente mais tarde.');
        
        toast.error('Ocorreu um erro inesperado. Tente novamente mais tarde.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false
        });
      }
    };
    
    fetchPacientes();
  }, [refreshData]);
  
 
  useEffect(() => {
    if (location.state && location.state.success) {
      // Limpa o estado imediatamente para evitar que o toast apareça novamente
      const successMessage = location.state.success;
      const shouldRefresh = location.state.refresh;
      
      // Limpa o estado ANTES de mostrar o toast
      window.history.replaceState({}, document.title);
      
      // Usa um ID único para o toast para evitar duplicação
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        toastId: `success-${Date.now()}`
      });
      
      // Se é necessário atualizar os dados, fazemos após limpar o estado
      if (shouldRefresh) {
        setRefreshData(prev => prev + 1);
      }
    }
  }, [location]);
  
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

  const handlePacienteDeleted = (pacienteId) => {
    // Primeiro, remover o paciente do estado local para atualização imediata da UI
    setPacientes(prevPacientes => 
      prevPacientes.filter(paciente => paciente.id !== pacienteId)
    );
    
    // Forçar um refresh dos dados para sincronizar com o banco
    setRefreshData(prev => prev + 1);
  };

 
  const handleStatusChange = (pacienteId, newStatus) => {
    // Atualizar o status do paciente na lista
    if (newStatus !== null) {
      setPacientes(prevPacientes =>
        prevPacientes.map(paciente =>
          paciente.id === pacienteId
            ? { ...paciente, isActive: newStatus, status: newStatus }
            : paciente
        )
      );
    }
  };
 
  const pacientesFiltrados = pacientes
    .filter(paciente => {
      
      if (filtros.isActive !== 'todos' && paciente.isActive !== filtros.isActive) {
        return false;
      }
      
      
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
    setIsExportOpen(false); //Fechar o outro dropdown
  };

  const toggleExport = () => {
    setIsExportOpen(!isExportOpen);
    setIsFilterOpen(false); //Fechar o outro dropdown
  };

  const handleCloseExport = () => {
    setIsExportOpen(false);
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
      isActive: 'todos'
    });
  };

  const handleNovo = () => {
    navigate('/paciente/cadastro');
  };
  
  const handleRefresh = () => {
    setRefreshData(prev => prev + 1);
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
              active={isFilterOpen || filtros.isActive !== 'todos'}
            />
            
            {isFilterOpen && (
              <div className="filter-dropdown">
                <h3>Filtros</h3>
                <div className="filter-group">
                  <label htmlFor="isActive">Status</label>
                  <select
                    id="isActive"
                    name="isActive"
                    value={filtros.isActive}
                    onChange={handleFiltroChange}
                    className="filter-select"
                  >
                    <option value="todos">Todos</option>
                    <option value="ATIVO">Ativo</option>
                    <option value="INATIVO">Inativo</option>
                  </select>
                </div>
                <div className="filter-actions">
                  <button
                    type="button"
                    className="clear-filter-button"
                    onClick={handleLimparFiltros}
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <ExportDropdown 
            data={pacientesFiltrados}
            headers={['ID', 'Nome', 'Email', 'Telefone', 'Data de Nascimento', 'Último Serviço', 'Status']}
            fields={['id', 'nome', 'email', 'telefone', 'dataNascimento', 'ultimoServico', 'isActive']}
            filename="pacientes"
            isOpen={isExportOpen}
            toggleExport={toggleExport}
            onCloseDropdown={handleCloseExport}
          />
        </div>
      </div>
      
      <div className="search-container">
        <SearchBar 
          placeholder="Buscar por nome, email, telefone..."
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
        {!searchQuery && pacientesFiltrados.length === 0 && filtros.isActive !== 'todos' ? (
          <div className="filter-info">
            Nenhum paciente encontrado com os filtros aplicados.
          </div>
        ) : null}
        <PacienteTable 
          pacientes={pacientesFiltrados} 
          onPacienteDeleted={handlePacienteDeleted}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
};

export default PacientePage;
