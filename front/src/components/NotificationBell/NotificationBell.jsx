import React from 'react';
import './NotificationBell.css';

const NotificationBell = ({ count = 0 }) => {
  return (
    <div className="notification-bell">
      <button className="bell-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {count > 0 && <span className="notification-count">{count}</span>}
      </button>
    </div>
  );
};

export default NotificationBell; 