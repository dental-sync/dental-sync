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

  // Verificar se há token ativo ao carregar a aplicação
  useEffect(() => {
    if (isLoggingOut) {
      return;
    }

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        console.log('🔍 Verificando autenticação... Token existe:', !!token);
        
        if (!token) {
          console.log('❌ Nenhum token encontrado');
          setIsAuthenticated(false);
          setUser(null);
          setRememberMe(false);
          setLoading(false);
          return;
        }

        console.log('🔑 Token encontrado, verificando validade...');
        // Verificar se o token ainda é válido
        const response = await api.get('/auth/check-auth');
        
        if (response.data.success && response.data.authenticated) {
          console.log('✅ Usuário autenticado:', response.data.user.email);
          setIsAuthenticated(true);
          setUser(response.data.user);
          
          // Recuperar dados do localStorage
          const userData = localStorage.getItem('userData');
          if (userData) {
            const parsedData = JSON.parse(userData);
            setRememberMe(parsedData.rememberMe || false);
          }
        } else {
          console.log('❌ Token inválido ou expirado');
          // Token inválido - limpar tudo
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
          setIsAuthenticated(false);
          setUser(null);
          setRememberMe(false);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        // Se der erro, limpar tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        setIsAuthenticated(false);
        setUser(null);
        setRememberMe(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isLoggingOut]);

  const login = (userData, accessToken, refreshToken) => {
    console.log('🔐 Fazendo login com dados:', { 
      email: userData.email, 
      rememberMe: userData.rememberMe,
      hasToken: !!accessToken 
    });
    
    // Salvar tokens no localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Salvar dados do usuário
    const userDataToStore = {
      ...userData,
      rememberMe: userData.rememberMe || false
    };
    localStorage.setItem('userData', JSON.stringify(userDataToStore));
    
    console.log('💾 Dados salvos no localStorage:', {
      hasAccessToken: !!localStorage.getItem('accessToken'),
      hasRefreshToken: !!localStorage.getItem('refreshToken'),
      userData: userDataToStore
    });
    
    // Atualizar estado
    setIsAuthenticated(true);
    setUser(userData);
    setRememberMe(userData.rememberMe || false);
    setIsLoggingOut(false);
  };

  const logout = async () => {
    setIsLoggingOut(true);
    setLoading(true);
    
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
    }
    
    // Limpar localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    
    // Limpar estado
    setIsAuthenticated(false);
    setUser(null);
    setRememberMe(false);
    setLoading(false);
    
    setTimeout(() => {
      setIsLoggingOut(false);
      window.location.href = '/login';
    }, 100);
  };

  const refreshUserData = async () => {
    if (isLoggingOut) {
      throw new Error('Sistema fazendo logout');
    }

    try {
      const response = await api.get('/auth/check-auth');
      
      if (response.data.success && response.data.authenticated) {
        const userInfo = response.data.user;
        setUser(userInfo);
        
        // Atualizar localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          const updatedData = { ...parsedData, ...userInfo };
          localStorage.setItem('userData', JSON.stringify(updatedData));
        }
        
        return userInfo;
      } else {
        throw new Error('Usuário não autenticado');
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      if (!isLoggingOut) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        setIsAuthenticated(false);
        setUser(null);
        setRememberMe(false);
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
    rememberMe
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 