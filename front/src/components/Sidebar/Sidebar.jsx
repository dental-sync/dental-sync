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
  ConfiguracaoIcon
} from './icons';

const Sidebar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(
    location.pathname.includes('proteticos') ? 'proteticos' : 
    location.pathname.includes('kanban') ? 'kanban' :
    location.pathname.includes('pedidos') ? 'pedidos' :
    location.pathname.includes('pacientes') ? 'pacientes' :
    location.pathname.includes('dentistas') ? 'dentistas' :
    location.pathname.includes('servicos') ? 'servicos' :
    location.pathname.includes('materiais') ? 'materiais' :
    location.pathname.includes('relatorios') ? 'relatorios' :
    location.pathname.includes('configuracoes') ? 'configuracoes' :
    'proteticos'
  );

  const menuItems = [
    { id: 'kanban', text: 'Kanban', icon: <KanbanIcon />, to: '/kanban' },
    { id: 'pedidos', text: 'Pedidos', icon: <PedidosIcon />, to: '/pedidos' },
    { id: 'pacientes', text: 'Pacientes', icon: <PacientesIcon />, to: '/paciente' },
    { id: 'proteticos', text: 'Protéticos', icon: <ProteticoIcon />, to: '/protetico' },
    { id: 'dentistas', text: 'Dentistas', icon: <DentistaIcon />, to: '/dentista' },
    { id: 'servicos', text: 'Serviços', icon: <ServicosIcon />, to: '/servicos' },
    { id: 'materiais', text: 'Materiais', icon: <MaterialIcon />, to: '/material' },
    { id: 'relatorios', text: 'Relatórios', icon: <RelatoriosIcon />, to: '/relatorios' },
    { id: 'configuracoes', text: 'Configurações', icon: <ConfiguracaoIcon />, to: '/configuracao' },
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