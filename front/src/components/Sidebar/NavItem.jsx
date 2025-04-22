import { Link } from 'react-router-dom';
import './NavItem.css';

const NavItem = ({ icon, text, isActive, onClick, to }) => {
  return (
    <Link to={to || "#"} className={`nav-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <div className="nav-icon">{icon}</div>
      <span className="nav-text">{text}</span>
    </Link>
  );
};

export default NavItem; 