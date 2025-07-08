import React from 'react';
import './PageHeader.css';
import NotificationBell from '../NotificationBell/NotificationBell';
import useNotifications from '../../hooks/useNotifications';

const PageHeader = ({ title, children }) => {
  const { notifications, loading, refreshNotifications } = useNotifications();

  return (
    <div className="page-header">
      <h1 className="page-title">{title}</h1>
      <div className="header-actions">
        <NotificationBell 
          count={notifications.total}
          baixoEstoque={notifications.baixoEstoque}
          semEstoque={notifications.semEstoque}
          materiaisBaixoEstoque={notifications.materiaisBaixoEstoque}
          materiaisSemEstoque={notifications.materiaisSemEstoque}
          loading={loading}
          onRefresh={refreshNotifications}
        />
        {children}
      </div>
    </div>
  );
};

export default PageHeader; 