import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { AuthState, User, Role, Permission, LoginRequest, LoginResponse } from '@/types';
import { api } from '@/services/api';

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: LoginResponse }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_AUTH'; payload: AuthState };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return state;
    case 'LOGIN_SUCCESS':
      return {
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGIN_FAILURE':
      return initialState;
    case 'LOGOUT':
      return initialState;
    case 'RESTORE_AUTH':
      return action.payload;
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  hasPermission: (code: string) => boolean;
  hasAnyPermission: (codes: string[]) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedAuth = sessionStorage.getItem('auth');
    if (storedAuth) {
      try {
        const authData: AuthState = JSON.parse(storedAuth);
        if (authData.token && authData.user) {
          dispatch({ type: 'RESTORE_AUTH', payload: authData });
        }
      } catch {
        sessionStorage.removeItem('auth');
      }
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await api.login(credentials);
      
      const authState: AuthState = {
        isAuthenticated: true,
        user: response.user,
        token: response.token,
      };

      sessionStorage.setItem('auth', JSON.stringify(authState));
      sessionStorage.setItem('token', response.token);
      
      if (credentials.remember) {
        localStorage.setItem('auth_remember', JSON.stringify(authState));
      }

      dispatch({ type: 'LOGIN_SUCCESS', payload: response });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登录失败';
      setError(errorMessage);
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      sessionStorage.removeItem('auth');
      sessionStorage.removeItem('token');
      localStorage.removeItem('auth_remember');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const hasPermission = (code: string): boolean => {
    if (!state.user?.permissions) return false;
    return state.user.permissions.some((p) => p.code === code);
  };

  const hasAnyPermission = (codes: string[]): boolean => {
    return codes.some((code) => hasPermission(code));
  };

  const isAdmin = (): boolean => {
    return state.user?.role?.code === 'admin';
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { useState } from 'react';
