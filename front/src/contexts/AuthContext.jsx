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

  // Verificar se há dados de autenticação salvos ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          const userDataParsed = JSON.parse(userData);
          
          // Buscar dados atualizados do usuário logado
          const response = await api.get('/proteticos/me');
          const userInfo = {
            ...userDataParsed,
            ...response.data,
            isAdmin: response.data.isAdmin || false
          };
          
          setIsAuthenticated(true);
          setUser(userInfo);
          localStorage.setItem('userData', JSON.stringify(userInfo));
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (userData) => {
    try {
      // Buscar dados completos do usuário após login
      const response = await api.get('/proteticos/me');
      const userInfo = {
        ...userData,
        ...response.data,
        isAdmin: response.data.isAdmin || false
      };
      
      setIsAuthenticated(true);
      setUser(userInfo);
      // Salvar no localStorage para persistir entre sessões
      localStorage.setItem('authToken', 'authenticated');
      localStorage.setItem('userData', JSON.stringify(userInfo));
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      // Fallback para login básico se não conseguir buscar dados
      setIsAuthenticated(true);
      setUser({ ...userData, isAdmin: false });
      localStorage.setItem('authToken', 'authenticated');
      localStorage.setItem('userData', JSON.stringify({ ...userData, isAdmin: false }));
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
    isAdmin: user?.isAdmin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 