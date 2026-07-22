import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; password: string; role: string }) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSales: boolean;
  isWarehouse: boolean;
  isAccounts: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user_info');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api
        .get('/auth/me')
        .then((res) => {
          if (res.data?.success) {
            setUser(res.data.data);
            localStorage.setItem('user_info', JSON.stringify(res.data.data));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { user: userData, accessToken, refreshToken } = res.data.data;
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user_info', JSON.stringify(userData));
      setUser(userData);
    } else {
      throw new Error(res.data?.message || 'Login failed');
    }
  };

  const register = async (data: { fullName: string; email: string; password: string; role: string }) => {
    const res = await api.post('/auth/register', data);
    if (res.data?.success) {
      // Auto login after successful registration
      await login(data.email, data.password);
    } else {
      throw new Error(res.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      setUser(null);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isSales = user?.role === 'SALES' || isAdmin;
  const isWarehouse = user?.role === 'WAREHOUSE' || isAdmin;
  const isAccounts = user?.role === 'ACCOUNTS' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        isAdmin,
        isSales,
        isWarehouse,
        isAccounts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
