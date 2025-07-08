import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../axios-config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [sessionDuration, setSessionDuration] = useState('');

  // Verificar se há sessão ativa ao carregar a aplicação
  useEffect(() => {
    // Não verificar autenticação se estiver fazendo logout
    if (isLoggingOut) {
      return;
    }

    // Não verificar autenticação se estivermos em páginas públicas
    const currentPath = window.location.pathname;
    const publicPaths = ['/login', '/registre-se', '/forgot-password', '/reset-password', '/two-factor'];
    
    if (publicPaths.includes(currentPath)) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/check');
        
        if (response.data.success && response.data.authenticated) {
          setIsAuthenticated(true);
          setUser(response.data.user);
          setRememberMe(response.data.rememberMe || false);
          setSessionDuration(response.data.sessionDuration || '');
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setRememberMe(false);
          setSessionDuration('');
        }
        } catch (error) {
          // Não mostrar erro se for 401 (não autenticado é esperado)
          if (error.response?.status !== 401) {
            console.error('Erro ao verificar autenticação:', error);
          }
          setIsAuthenticated(false);
          setUser(null);
          setRememberMe(false);
          setSessionDuration('');
        } finally {
          setLoading(false);
        }
    };

    checkAuth();
  }, [isLoggingOut]);

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setRememberMe(userData.rememberMe || false);
    setSessionDuration(userData.sessionDuration || '');
    setIsLoggingOut(false);
    // Não salvamos mais no localStorage - cookies são gerenciados automaticamente
  };

  const logout = async () => {
    setIsLoggingOut(true);
    setLoading(true);
    
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
      // Mesmo com erro, continuamos o logout local
    }
    
    // Limpar estado local sempre
    setIsAuthenticated(false);
    setUser(null);
    setRememberMe(false);
    setSessionDuration('');
    setLoading(false);
    
    // Usar setTimeout para garantir que o estado foi limpo antes do redirecionamento
    setTimeout(() => {
      setIsLoggingOut(false);
      window.location.href = '/login';
    }, 100);
  };

  const refreshUserData = async () => {
    // Não atualizar dados se estiver fazendo logout
    if (isLoggingOut) {
      throw new Error('Sistema fazendo logout');
    }

    try {
      const response = await api.get('/auth/check');
      
      if (response.data.success && response.data.authenticated) {
        const userInfo = response.data.user;
        setUser(userInfo);
        setRememberMe(response.data.rememberMe || false);
        setSessionDuration(response.data.sessionDuration || '');
        return userInfo;
      } else {
        throw new Error('Usuário não autenticado');
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      if (!isLoggingOut) {
        setIsAuthenticated(false);
        setUser(null);
        setRememberMe(false);
        setSessionDuration('');
      }
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
    refreshUserData,
    isAdmin: user?.isAdmin || false,
    rememberMe,
    sessionDuration
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 