import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, setAuthToken } from '../services/api';

// Define UserResponse interface locally to avoid import issues
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  last_login: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserResponse | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize: Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);

        if (storedToken) {
          // 添加超时保护
          const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Token verification timeout')), 5000)
          );

          try {
            // Verify token is still valid (带超时)
            const isValid = await Promise.race([
              authApi.verifyToken(storedToken),
              timeout
            ]) as boolean;

            if (isValid) {
              // Get user info (带超时)
              const userData = await Promise.race([
                authApi.getCurrentUser(storedToken),
                timeout
              ]);
              setToken(storedToken);
              setUser(userData);
              setIsAuthenticated(true);
              setAuthToken(storedToken);
            } else {
              // Token expired, clear it
              localStorage.removeItem(TOKEN_KEY);
            }
          } catch (err) {
            console.error('Token verification failed:', err);
            localStorage.removeItem(TOKEN_KEY);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        // 确保无论如何都会设置 isLoading 为 false
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      // Call login API
      const response = await authApi.login({ username, password });
      const { access_token } = response;

      // Get user info
      const userData = await authApi.getCurrentUser(access_token);

      // Store token
      localStorage.setItem(TOKEN_KEY, access_token);
      setAuthToken(access_token);

      // Update state
      setToken(access_token);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear token from storage and state
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);

    // Optionally notify backend
    if (token) {
      authApi.logout(token).catch(console.error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        login,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
