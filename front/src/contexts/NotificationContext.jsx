import React, { createContext, useContext, useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

const NotificationContext = createContext();

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext deve ser usado dentro de NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({
    total: 0,
    baixoEstoque: 0,
    semEstoque: 0,
    materiaisBaixoEstoque: [],
    materiaisSemEstoque: []
  });
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotificacaoEstoque();
      setNotifications({
        total: data.total || 0,
        baixoEstoque: data.baixoEstoque || 0,
        semEstoque: data.semEstoque || 0,
        materiaisBaixoEstoque: data.materiaisBaixoEstoque || [],
        materiaisSemEstoque: data.materiaisSemEstoque || []
      });
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setNotifications({
        total: 0,
        baixoEstoque: 0,
        semEstoque: 0,
        materiaisBaixoEstoque: [],
        materiaisSemEstoque: []
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshNotifications = () => {
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const value = {
    notifications,
    loading,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 