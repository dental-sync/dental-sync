import './UserSection.css';
import Avatar from '../Avatar/Avatar';

const UserSection = ({ userName, userEmail, onLogout }) => {
  return (
    <div className="user-section">
      <div className="user-info">
        <Avatar name={userName} email={userEmail} size={40} />
        <div className="user-details">
          <span className="user-name" title={userName}>{userName}</span>
          <span className="user-email" title={userEmail}>{userEmail}</span>
        </div>
      </div>
      <button className="logout-button" onClick={onLogout}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Sair
      </button>
    </div>
  );
};

export default UserSection; 