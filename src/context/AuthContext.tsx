import React, { createContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getSession, saveSession, clearSession } from '../utils/storage';
import { subscribeToSessionExpired } from '../utils/authEvents';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token:string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const session = await getSession();
      if (session) {
        setUser(session.user);
        setToken(session.token);
      }
      setIsLoading(false);
    };

    loadSession();

    const unsubscribe = subscribeToSessionExpired(() => {
      logout();
    });

    return unsubscribe;
  }, []);

  const login = async (user: User, token: string) => {
    setUser(user);
    setToken(token);
    await saveSession(token, user);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
