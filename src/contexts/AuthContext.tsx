import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  address: string;
  email?: string;
  name?: string;
  avatar?: string;
  isPremium: boolean;
  queriesUsed: number;
  queryLimit: number;
}

interface AuthContextType {
  user: User | null;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  connectGoogle: () => Promise<void>;
  disconnect: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      // Mock wallet connection
      setTimeout(() => {
        setUser({
          id: '1',
          address: '0x1234...5678',
          isPremium: false,
          queriesUsed: 45,
          queryLimit: 100,
        });
        setIsConnecting(false);
      }, 1000);
    } catch (err) {
      setError('Failed to connect wallet');
      setIsConnecting(false);
    }
  };

  const connectGoogle = async () => {
    if (!user) return;
    // Mock Google connection
    setUser({
      ...user,
      email: 'user@example.com',
      name: 'John Doe',
    });
  };

  const disconnect = () => {
    setUser(null);
    setError(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isConnecting,
      error,
      connectWallet,
      connectGoogle,
      disconnect,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
