import React from 'react';
import './PageHeader.css';
import NotificationBell from '../NotificationBell/NotificationBell';

const PageHeader = ({ title, children }) => {
  return (
    <div className="page-header">
      <h1 className="page-title">{title}</h1>
      <div className="header-actions">
        <NotificationBell count={2} />
        {children}
      </div>
    </div>
  );
};

export default PageHeader; 