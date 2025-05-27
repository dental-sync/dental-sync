import React, { useState, useEffect, useRef } from 'react';
import './ClinicaPage.css';
import SearchBar from '../../components/SearchBar/SearchBar';
import ActionButton from '../../components/ActionButton/ActionButton';
import ClinicaTable from '../../components/ClinicaTable/ClinicaTable';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import ExportDropdown from '../../components/ExportDropdown/ExportDropdown';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../axios-config';
import { toast } from 'react-toastify';

const ClinicaPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [clinicas, setClinicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [refreshData, setRefreshData] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  const filterRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Criando um ref para armazenar mensagens recentes e evitar duplicação de toasts
  const recentMessages = useRef(new Set());

  useEffect(() => {
    const fetchClinicas = async () => {
      try {
        setLoading(true);
        const response = await api.get('/clinicas');
        const clinicasFormatadas = response.data.map(clinica => ({
          id: clinica.id,
          nome: clinica.nome,
          cnpj: clinica.cnpj
        }));
        setClinicas(clinicasFormatadas);
      } catch (err) {
        console.error('Erro ao buscar clínicas:', err);
        setClinicas([]);
        setError('Não foi possível carregar os dados do servidor. Tente novamente mais tarde.');
        toast.error('Não foi possível carregar os dados do servidor. Tente novamente mais tarde.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClinicas();
  }, [refreshData]);

  useEffect(() => {
    if (location.state && location.state.success) {
      const successMessage = location.state.success;
      const shouldRefresh = location.state.refresh;
      
      // Limpa o state imediatamente
      window.history.replaceState({}, document.title);
      
      // Cria uma chave única para esta mensagem
      const messageKey = `${successMessage}-${Date.now()}`;
      
      // Verifica se esta mensagem já foi exibida recentemente (nos últimos 3 segundos)
      if (!recentMessages.current.has(messageKey)) {
        // Adiciona a mensagem ao cache
        recentMessages.current.add(messageKey);
        
        // Exibe o toast
        toast.success(successMessage, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          // ID fixo para a mesma mensagem
          toastId: successMessage
        });
        
        // Remove a mensagem do cache após 3 segundos
        setTimeout(() => {
          recentMessages.current.delete(messageKey);
        }, 3000);
        
        // Se é necessário atualizar os dados
        if (shouldRefresh) {
          setRefreshData(prev => prev + 1);
        }
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

  const handleClinicaDeleted = (clinicaId) => {
    // Primeiro, remover a clínica do estado local para atualização imediata da UI
    setClinicas(prevClinicas => 
      prevClinicas.filter(clinica => clinica.id !== clinicaId)
    );
    
    // Forçar um refresh dos dados para sincronizar com o banco
    setRefreshData(prev => prev + 1);
    
    // Limpa qualquer estado de navegação existente
    window.history.replaceState({}, document.title);
    
    // Adicionamos uma mensagem de sucesso usando o padrão de state
    navigate('', { 
      state: { 
        success: "Clínica excluída com sucesso!",
        refresh: false // Não precisamos de refresh pois já fizemos acima
      },
      replace: true // Importante usar replace para não adicionar nova entrada no histórico
    });
  };

  // Função utilitária para formatar o ID
  const formatClinicaId = (id) => `C${String(id).padStart(4, '0')}`;

  const clinicasFiltradas = clinicas
    .filter(clinica => {
      if (searchQuery) {
        return (
          clinica.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          clinica.cnpj?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (clinica.id?.toString() || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          formatClinicaId(clinica.id).toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      return true;
    });

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleNovo = () => {
    navigate('/clinica/cadastro');
  };

  const handleRefresh = () => {
    setRefreshData(prev => prev + 1);
  };

  const handleExportar = () => {
    // Implemente a lógica para exportar as clínicas
  };

  const toggleExport = () => {
    setIsExportOpen(!isExportOpen);
    setIsFilterOpen(false); // Fechar o outro dropdown
  };

  const handleCloseExport = () => {
    setIsExportOpen(false);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedClinicas = React.useMemo(() => {
    let sortableClinicas = [...clinicasFiltradas];
    if (sortConfig.key) {
      sortableClinicas.sort((a, b) => {
        // Para ordenação de IDs (números)
        if (sortConfig.key === 'id') {
          return sortConfig.direction === 'ascending'
            ? a.id - b.id
            : b.id - a.id;
        }
        
        // Para ordenação de strings (apenas nome)
        if (sortConfig.key === 'nome') {
          const aValue = String(a[sortConfig.key]).toLowerCase();
          const bValue = String(b[sortConfig.key]).toLowerCase();
          
          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        }
        return 0;
      });
    }
    return sortableClinicas;
  }, [clinicasFiltradas, sortConfig]);

  if (loading) {
    return <div className="clinica-loading">Carregando clínicas...</div>;
  }

  return (
    <div className="clinica-page">
      <div className="page-top">
        <div className="notification-container">
          <NotificationBell count={2} />
        </div>
      </div>
      
      {toastMessage && (
        <div className="toast-message">
          {toastMessage}
        </div>
      )}
      
      <div className="page-header">
        <h1 className="page-title">Clínicas</h1>
        <div className="header-actions">
          <ExportDropdown 
            data={sortedClinicas}
            headers={['ID', 'Nome', 'CNPJ']}
            fields={['id', 'nome', 'cnpj']}
            filename="clinicas"
            isOpen={isExportOpen}
            toggleExport={toggleExport}
            onCloseDropdown={handleCloseExport}
            title="Lista de Clínicas"
            formatIdFn={formatClinicaId}
          />
        </div>
      </div>
      
      <div className="search-container">
        <SearchBar
          placeholder="Buscar por ID, nome ou CNPJ..."
          onSearch={handleSearch}
        />
        <ActionButton
          label="Novo"
          variant="primary"
          onClick={handleNovo}
        />
      </div>
      
      <div className="table-section">
        {searchQuery && clinicasFiltradas.length === 0 && (
          <div className="search-info">
            Nenhuma clínica encontrada para a busca "{searchQuery}".
          </div>
        )}
        <ClinicaTable 
          clinicas={sortedClinicas} 
          onClinicaDeleted={handleClinicaDeleted}
          sortConfig={sortConfig}
          onSort={handleSort}
          isEmpty={!searchQuery && clinicasFiltradas.length === 0}
        />
      </div>
    </div>
  );
};

export default ClinicaPage; 