import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from sessionStorage on app start
    try {
      const savedUser = sessionStorage.getItem('user');
      const savedToken = sessionStorage.getItem('token');
      
      console.log('AuthProvider loading - savedUser:', savedUser);
      console.log('AuthProvider loading - savedToken:', savedToken);
      
      if (savedUser && savedToken) {
        const parsedUser = JSON.parse(savedUser);
        console.log('AuthProvider loading - parsedUser:', parsedUser);
        setUser(parsedUser);
      } else {
        console.log('AuthProvider loading - No saved user or token found');
      }
    } catch (error) {
      console.error('Error loading user from sessionStorage:', error);
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('AuthProvider login - credentials:', credentials);
      const response = await authService.login(credentials);
      console.log('AuthProvider login - response:', response);
      
      setUser(response.user);
      
      // Only store basic, non-sensitive user info
      const userBasicInfo = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name
      };
      
      sessionStorage.setItem('user', JSON.stringify(userBasicInfo));
      // Store token separately - consider moving to httpOnly cookie in production
      sessionStorage.setItem('token', response.token);
      
      console.log('AuthProvider login - user set:', response.user);
      console.log('AuthProvider login - token set:', response.token);
    } catch (error) {
      console.error('AuthProvider login - error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('AuthProvider logout - error:', error);
      // Still clear user state even if API call fails
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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