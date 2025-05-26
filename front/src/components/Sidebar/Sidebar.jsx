import { useState } from 'react';
import { useLocation } from 'react-router-dom';
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

const Sidebar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(() => {
    const path = location.pathname;
    if (path.includes('kanban')) return 'kanban';
    if (path.includes('pedidos')) return 'pedidos';
    if (path.includes('paciente')) return 'pacientes';
    if (path.includes('protetico')) return 'proteticos';
    if (path.includes('dentista')) return 'dentistas';
    if (path.includes('servicos')) return 'servicos';
    if (path.includes('material')) return 'materiais';
    if (path.includes('relatorios')) return 'relatorios';
    if (path.includes('configuracao')) return 'configuracoes';
    if (path.includes('clinica')) return 'clinicas';
    return 'kanban'; // Item padrão caso nenhuma rota seja encontrada
  });

  const menuItems = [
    { id: 'kanban', text: 'Kanban', icon: <KanbanIcon />, to: '/dashboard/kanban' },
    { id: 'pedidos', text: 'Pedidos', icon: <PedidosIcon />, to: '/dashboard/pedidos' },
    { id: 'pacientes', text: 'Pacientes', icon: <PacientesIcon />, to: '/dashboard/paciente' },
    { id: 'proteticos', text: 'Protéticos', icon: <ProteticoIcon />, to: '/dashboard/protetico' },
    { id: 'dentistas', text: 'Dentistas', icon: <DentistaIcon />, to: '/dashboard/dentista' },
    { id: 'clinicas', text: 'Clínicas', icon: <ClinicaIcon />, to: '/dashboard/clinica' },
    { id: 'servicos', text: 'Serviços', icon: <ServicosIcon />, to: '/dashboard/servicos' },
    { id: 'materiais', text: 'Materiais', icon: <MaterialIcon />, to: '/dashboard/material' },
    { id: 'relatorios', text: 'Relatórios', icon: <RelatoriosIcon />, to: '/dashboard/relatorios' },
    { id: 'configuracoes', text: 'Configurações', icon: <ConfiguracaoIcon />, to: '/dashboard/configuracao' },
  ];

  const handleItemClick = (id) => {
    setActiveItem(id);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
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
        userName="Usuário demo"
        userEmail="usuario@dental.com"
        onLogout={handleLogout}
      />
    </div>
  );
};

export default Sidebar; 