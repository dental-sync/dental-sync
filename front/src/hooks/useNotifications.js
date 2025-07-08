import { useNotificationContext } from '../contexts/NotificationContext';

const useNotifications = () => {
  return useNotificationContext();
};
 
export default useNotifications; 