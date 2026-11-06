import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types';
import { authService } from '../api/authService';
import { tokenStorage } from '../utils/tokenStorage';

interface AuthContextType {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const stored = tokenStorage.getSession();
    if (stored) {
      setUser(stored);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const data = await authService.login(credentials);
    tokenStorage.setSession(data);
    setUser(data);
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const data = await authService.register(payload);
    tokenStorage.setSession(data);
    setUser(data);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clearSession();
    setUser(null);
  }, []);

  const isAdmin = useMemo(() => {
    return Boolean(user?.roles?.includes('ROLE_ADMIN'));
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.token),
      isAdmin,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isAdmin, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};