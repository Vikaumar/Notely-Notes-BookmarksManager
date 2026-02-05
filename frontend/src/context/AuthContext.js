'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');

        if (storedToken) {
          setAccessToken(storedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Verify token by getting user
          const response = await api.get('/auth/me');
          setUser(response.data.data);
        }
      } catch (error) {
        // Token expired, try refresh
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (storedRefreshToken) {
          try {
            await refreshToken(storedRefreshToken);
          } catch (refreshError) {
            logout();
          }
        } else {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Refresh token
  const refreshToken = async (token) => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken: token });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
      
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      setAccessToken(newAccessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      
      // Get user data
      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data.data);
      
      return newAccessToken;
    } catch (error) {
      throw error;
    }
  };

  // Register
  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { user: userData, accessToken: token, refreshToken: refresh } = response.data.data;
    
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refresh);
    setAccessToken(token);
    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return userData;
  };

  // Login
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user: userData, accessToken: token, refreshToken: refresh } = response.data.data;
    
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refresh);
    setAccessToken(token);
    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return userData;
  };

  // Logout
  const logout = useCallback(async () => {
    try {
      if (accessToken) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      // Ignore errors during logout
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setAccessToken(null);
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);

  // Setup axios interceptor for token refresh
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && 
            error.response?.data?.code === 'TOKEN_EXPIRED' &&
            !originalRequest._retry) {
          originalRequest._retry = true;
          
          const storedRefreshToken = localStorage.getItem('refreshToken');
          if (storedRefreshToken) {
            try {
              const newToken = await refreshToken(storedRefreshToken);
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return api(originalRequest);
            } catch (refreshError) {
              logout();
              return Promise.reject(refreshError);
            }
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      register,
      login,
      logout,
      accessToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
