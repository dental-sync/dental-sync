import React, { useState, useEffect, useRef } from 'react';
import './DentistaPage.css';
import SearchBar from '../../components/SearchBar/SearchBar';
import ActionButton from '../../components/ActionButton/ActionButton';
import DentistaTable from '../../components/DentistaTable/DentistaTable';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import ExportDropdown from '../../components/ExportDropdown/ExportDropdown';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const DentistaPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dentistas, setDentistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    isActive: 'todos'
  });
  const [refreshData, setRefreshData] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);
  const filterRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchDentistas = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/dentistas');
        const dentistasFormatados = response.data.map(dentista => ({
          id: dentista.id,
          nome: dentista.nome,
          cro: dentista.cro,
          telefone: dentista.telefone || '-',
          email: dentista.email || '-',
          isActive: dentista.isActive ? 'ATIVO' : 'INATIVO'
        }));
        setDentistas(dentistasFormatados);
      } catch (err) {
        console.error('Erro ao buscar dentistas:', err);
        setDentistas([]);
        setError('Não foi possível carregar os dados do servidor. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchDentistas();
  }, [refreshData]);

  useEffect(() => {
    if (location.state) {
      if (location.state.success) {
        setToastMessage(location.state.success);
        setRefreshData(prev => prev + 1);
        const timer = setTimeout(() => {
          setToastMessage(null);
          window.history.replaceState({}, document.title);
        }, 3000);
        return () => clearTimeout(timer);
      } else if (location.state.refresh) {
        setRefreshData(prev => prev + 1);
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

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

  const handleDentistaDeleted = (dentistaId) => {
    setDentistas(prevDentistas => 
      prevDentistas.filter(dentista => dentista.id !== dentistaId)
    );
    setTimeout(() => {
      setRefreshData(prev => prev + 1);
    }, 1000);
  };

  const handleStatusChange = (dentistaId, newStatus) => {
    setDentistas(prevDentistas =>
      prevDentistas.map(dentista =>
        dentista.id === dentistaId
          ? { ...dentista, isActive: newStatus }
          : dentista
      )
    );
  };

  const dentistasFiltrados = dentistas
    .filter(dentista => {
      if (filtros.isActive !== 'todos' && dentista.isActive !== filtros.isActive) {
        return false;
      }
      
      if (searchQuery) {
        return (
          dentista.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dentista.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dentista.telefone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dentista.cro?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (dentista.id?.toString() || '').toLowerCase().includes(searchQuery.toLowerCase())
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
      isActive: 'todos'
    });
  };

  const handleNovo = () => {
    navigate('/dentista/cadastro');
  };

  const handleRefresh = () => {
    setRefreshData(prev => prev + 1);
  };

  const handleExportar = () => {
    // Implemente a lógica para exportar os dentistas
  };

  const toggleExport = () => {
    setIsExportOpen(!isExportOpen);
    setIsFilterOpen(false); // Fechar o outro dropdown
  };

  const handleCloseExport = () => {
    setIsExportOpen(false);
  };

  if (loading) {
    return <div className="loading">Carregando dentistas...</div>;
  }

  return (
    <div className="dentista-page">
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
        <h1 className="page-title">Dentistas</h1>
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
            data={dentistasFiltrados}
            headers={['ID', 'Nome', 'CRO', 'Email', 'Telefone', 'Status']}
            fields={['id', 'nome', 'cro', 'email', 'telefone', 'isActive']}
            filename="dentistas"
            isOpen={isExportOpen}
            toggleExport={toggleExport}
            onCloseDropdown={handleCloseExport}
          />
        </div>
      </div>
      
      <div className="search-container">
        <SearchBar
          placeholder="Buscar por ID, nome, CRO, e-mail ou telefone..."
          onSearch={handleSearch}
        />
        <ActionButton
          label="Novo"
          variant="primary"
          onClick={handleNovo}
        />
      </div>
      
      <div className="table-section">
        {searchQuery && dentistasFiltrados.length === 0 && (
          <div className="search-info">
            Nenhum dentista encontrado para a busca "{searchQuery}".
          </div>
        )}
        {!searchQuery && dentistasFiltrados.length === 0 && filtros.isActive !== 'todos' ? (
          <div className="filter-info">
            Nenhum dentista encontrado com os filtros aplicados.
          </div>
        ) : null}
        <DentistaTable 
          dentistas={dentistasFiltrados} 
          onDentistaDeleted={handleDentistaDeleted}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
};

export default DentistaPage; 