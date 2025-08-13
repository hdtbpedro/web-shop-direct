import React, { createContext, useContext, useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/utils/format";

export type AuthContextType = {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  setCredentials: (username: string, password: string) => void;
  hasCredentials: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "admin123";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);

  useEffect(() => {
    // Verificar se há credenciais salvas
    const savedCredentials = localStorage.getItem(STORAGE_KEYS.adminCredentials);
    if (savedCredentials) {
      setHasCredentials(true);
    } else {
      // Definir credenciais padrão se não existirem
      const defaultCreds = { username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD };
      localStorage.setItem(STORAGE_KEYS.adminCredentials, JSON.stringify(defaultCreds));
      setHasCredentials(true);
    }

    // Verificar se há sessão ativa
    const session = localStorage.getItem(STORAGE_KEYS.adminSession);
    if (session) {
      const sessionData = JSON.parse(session);
      const now = Date.now();
      // Sessão válida por 24 horas
      if (sessionData.expires > now) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem(STORAGE_KEYS.adminSession);
      }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const savedCredentials = localStorage.getItem(STORAGE_KEYS.adminCredentials);
    if (!savedCredentials) return false;

    const { username: savedUsername, password: savedPassword } = JSON.parse(savedCredentials);
    
    if (username === savedUsername && password === savedPassword) {
      setIsAuthenticated(true);
      // Criar sessão válida por 24 horas
      const sessionData = {
        expires: Date.now() + (24 * 60 * 60 * 1000)
      };
      localStorage.setItem(STORAGE_KEYS.adminSession, JSON.stringify(sessionData));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEYS.adminSession);
  };

  const setCredentials = (username: string, password: string) => {
    const credentials = { username, password };
    localStorage.setItem(STORAGE_KEYS.adminCredentials, JSON.stringify(credentials));
    setHasCredentials(true);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      setCredentials,
      hasCredentials
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};