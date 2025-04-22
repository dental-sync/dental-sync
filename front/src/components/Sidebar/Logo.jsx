import './Logo.css';
import logo from '../../assets/images/logo.png';

const Logo = () => {
  return (
    <div className="sidebar-logo">
      <div className="logo-icon">
        <img src={logo} alt="Dental Sync Logo" />
      </div>
      <span className="logo-text">DENTAL SYNC</span>
    </div>
  );
};

export default Logo; 