import { toast } from 'react-toastify';

// Cache para evitar duplicação de toasts
const toastCache = new Map();

// Função para gerar chave única do toast
const generateToastKey = (message, type) => {
  return `${type}-${message}`;
};

// Função para limpar cache após expiração
const clearFromCache = (key, delay = 4000) => {
  setTimeout(() => {
    toastCache.delete(key);
  }, delay);
};

// Configuração padrão dos toasts
const defaultOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  closeButton: true
};

const useToast = () => {
  const showToast = (message, type = 'info', options = {}) => {
    const key = generateToastKey(message, type);
    
    // Verifica se já existe um toast igual recentemente
    if (toastCache.has(key)) {
      return;
    }
    
    // Adiciona no cache
    toastCache.set(key, true);
    
    // Configurações finais
    const finalOptions = {
      ...defaultOptions,
      ...options,
      toastId: key // Usa a chave como ID único
    };
    
    // Exibe o toast
    let toastResult;
    switch (type) {
      case 'success':
        toastResult = toast.success(message, finalOptions);
        break;
      case 'error':
        toastResult = toast.error(message, finalOptions);
        break;
      case 'warning':
        toastResult = toast.warning(message, finalOptions);
        break;
      case 'info':
        toastResult = toast.info(message, finalOptions);
        break;
      default:
        toastResult = toast(message, finalOptions);
    }
    
    // Limpa do cache após expiração
    clearFromCache(key, finalOptions.autoClose + 1000);
    
    return toastResult;
  };

  const success = (message, options = {}) => showToast(message, 'success', options);
  const error = (message, options = {}) => showToast(message, 'error', options);
  const warning = (message, options = {}) => showToast(message, 'warning', options);
  const info = (message, options = {}) => showToast(message, 'info', options);

  // Função para limpar todos os toasts
  const dismiss = (toastId) => {
    toast.dismiss(toastId);
  };

  const dismissAll = () => {
    toast.dismiss();
  };

  return {
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
    showToast
  };
};

export default useToast; 