import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import Logo from './Logo';
import NavItem from './NavItem';
import UserSection from './UserSection';
import {
  KanbanIcon,
  PedidosIcon,
  PacientesIcon,
  ProteticoIcon,
  DentistaIcon,
  ServicosIcon,
  MaterialIcon,
  RelatoriosIcon,
  ConfiguracaoIcon,
  ClinicaIcon
} from './icons';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeItem, setActiveItem] = useState(() => {
    const path = location.pathname;
    if (path.includes('kanban')) return 'kanban';
    if (path.includes('pedidos')) return 'pedidos';
    if (path.includes('paciente')) return 'pacientes';
    if (path.includes('protetico')) return 'proteticos';
    if (path.includes('dentista')) return 'dentistas';
    if (path.includes('servico')) return 'servicos';
    if (path.includes('material')) return 'materiais';
    if (path.includes('relatorios')) return 'relatorios';
    if (path.includes('configuracao')) return 'configuracoes';
    if (path.includes('clinica')) return 'clinicas';
    return 'kanban'; // Item padrão caso nenhuma rota seja encontrada
  });

  const menuItems = [
    { id: 'kanban', text: 'Kanban', icon: <KanbanIcon />, to: '/kanban' },
    { id: 'pedidos', text: 'Pedidos', icon: <PedidosIcon />, to: '/pedidos' },
    { id: 'pacientes', text: 'Pacientes', icon: <PacientesIcon />, to: '/paciente' },
    { id: 'proteticos', text: 'Protéticos', icon: <ProteticoIcon />, to: '/protetico' },
    { id: 'dentistas', text: 'Dentistas', icon: <DentistaIcon />, to: '/dentista' },
    { id: 'clinicas', text: 'Clínicas', icon: <ClinicaIcon />, to: '/clinica' },
    { id: 'servicos', text: 'Serviços', icon: <ServicosIcon />, to: '/servico' },
    { id: 'materiais', text: 'Materiais', icon: <MaterialIcon />, to: '/material' },
    { id: 'relatorios', text: 'Relatórios', icon: <RelatoriosIcon />, to: '/relatorios' },
    { id: 'configuracoes', text: 'Configurações', icon: <ConfiguracaoIcon />, to: '/configuracao' },
  ];

  const handleItemClick = (id) => {
    setActiveItem(id);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Logo />
      </div>
      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            text={item.text}
            isActive={activeItem === item.id}
            onClick={() => handleItemClick(item.id)}
            to={item.to}
          />
        ))}
      </div>
      <UserSection
        userName={user?.email || "Usuário"}
        userEmail={user?.email || "usuario@dental.com"}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default Sidebar; 