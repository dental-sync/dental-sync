import { useNotificationContext } from '../contexts/NotificationContext';

const useNotificationRefresh = () => {
  const { refreshNotifications } = useNotificationContext();

  const refreshAfterStockChange = () => {
    // Pequeno delay para garantir que o backend atualizou o status
    setTimeout(() => {
      refreshNotifications();
    }, 500);
  };

  return {
    refreshAfterStockChange
  };
};

export default useNotificationRefresh; 