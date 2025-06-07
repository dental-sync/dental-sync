import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import Logo from './Logo';
import NavItem from './NavItem';
import UserSection from './UserSection';
import { useSidebar } from '../../contexts/SidebarContext';
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
  const { user, logout, isAdmin } = useAuth();
  const { activeItem, setActiveItem } = useSidebar();

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('kanban')) setActiveItem('kanban');
    else if (path.includes('pedidos')) setActiveItem('pedidos');
    else if (path.includes('paciente')) setActiveItem('pacientes');
    else if (path.includes('protetico')) setActiveItem('proteticos');
    else if (path.includes('dentista')) setActiveItem('dentistas');
    else if (path.includes('servico')) setActiveItem('servicos');
    else if (path.includes('material')) setActiveItem('materiais');
    else if (path.includes('relatorios')) setActiveItem('relatorios');
    else if (path.includes('configuracao')) setActiveItem('configuracoes');
    else if (path.includes('clinica')) setActiveItem('clinicas');
  }, [location.pathname, setActiveItem]);

  // Menu items base
  const baseMenuItems = [
    { id: 'kanban', text: 'Kanban', icon: <KanbanIcon />, to: '/kanban' },
    { id: 'pedidos', text: 'Pedidos', icon: <PedidosIcon />, to: '/pedidos' },
    { id: 'pacientes', text: 'Pacientes', icon: <PacientesIcon />, to: '/paciente' },
    { id: 'dentistas', text: 'Dentistas', icon: <DentistaIcon />, to: '/dentista' },
    { id: 'clinicas', text: 'Clínicas', icon: <ClinicaIcon />, to: '/clinica' },
    { id: 'servicos', text: 'Serviços', icon: <ServicosIcon />, to: '/servico' },
    { id: 'materiais', text: 'Materiais', icon: <MaterialIcon />, to: '/material' },
    { id: 'relatorios', text: 'Relatórios', icon: <RelatoriosIcon />, to: '/relatorios' },
    { id: 'configuracoes', text: 'Configurações', icon: <ConfiguracaoIcon />, to: '/configuracao' },
  ];

  // Adicionar menu de protéticos apenas para admins
  const menuItems = isAdmin ? [
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
  ] : baseMenuItems;

  const handleItemClick = (id) => {
    setActiveItem(id);
  };

  const handleLogout = () => {
    logout();
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
        userName={user?.name || user?.nome || user?.email?.split('@')[0] || "Usuário"}
        userEmail={user?.email || "usuario@dental.com"}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default Sidebar; 