import React, { createContext, useContext, useState, useEffect } from 'react';
import { connect, disconnect as starknetDisconnect } from 'get-starknet';
import { AccountInterface } from 'starknet';

interface User {
  id: string;
  address?: string;
  email?: string;
  name?: string;
  avatar?: string;
  isPremium: boolean;
  queriesUsed: number;
  queryLimit: number;
  authMethod: 'wallet' | 'email';
  walletType?: 'argentX' | 'braavos';
}

interface AuthContextType {
  user: User | null;
  isConnecting: boolean;
  error: string | null;
  account: AccountInterface | null;
  connectWallet: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
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
  const [account, setAccount] = useState<AccountInterface | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('stark_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('stark_user');
      }
    }
  }, []);

  // Save user to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('stark_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('stark_user');
    }
  }, [user]);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const starknet = await connect({
        modalMode: 'canAsk',
        modalTheme: 'light',
      });

      if (!starknet) {
        throw new Error('No wallet found. Please install ArgentX or Braavos wallet.');
      }

      await starknet.enable();
      
      if (!starknet.account) {
        throw new Error('Failed to connect to wallet account');
      }

      // Get wallet type
      const walletType = starknet.id === 'argentX' ? 'argentX' : 'braavos';
      
      // Create nonce for signing
      const nonce = Date.now().toString();
      const message = `Sign this message to authenticate with StarkAnalytics. Nonce: ${nonce}`;
      
      // Sign the message for authentication
      try {
        const signature = await starknet.account.signMessage({
          domain: {
            name: 'StarkAnalytics',
            version: '1',
          },
          message: {
            content: message,
          },
        });

        // Create user session
        const newUser: User = {
          id: starknet.account.address,
          address: starknet.account.address,
          isPremium: false,
          queriesUsed: 0,
          queryLimit: 100,
          authMethod: 'wallet',
          walletType,
        };

        setUser(newUser);
        setAccount(starknet.account);
        
        // Store session info
        localStorage.setItem('stark_session', JSON.stringify({
          address: starknet.account.address,
          signature,
          nonce,
          timestamp: Date.now(),
        }));

      } catch (signError) {
        throw new Error('Failed to sign authentication message');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sign in');
      }

      const userData = await response.json();
      
      const newUser: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
        isPremium: userData.isPremium || false,
        queriesUsed: userData.queriesUsed || 0,
        queryLimit: userData.queryLimit || 100,
        authMethod: 'email',
      };

      setUser(newUser);

    } catch (err) {
      // Mock implementation for development
      if (email === 'demo@starkanalytics.com' && password === 'password123') {
        const mockUser: User = {
          id: 'demo-user',
          email: 'demo@starkanalytics.com',
          name: 'Demo User',
          isPremium: false,
          queriesUsed: 25,
          queryLimit: 100,
          authMethod: 'email',
        };
        setUser(mockUser);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Invalid email or password';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create account');
      }

      // For now, just simulate successful signup
      // In real implementation, user would need to verify email first

    } catch (err) {
      // Mock implementation for development
      console.log('Mock signup for:', { name, email });
      // Just simulate success - in real app, would send verification email
    } finally {
      setIsConnecting(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setAccount(null);
    setError(null);
    localStorage.removeItem('stark_session');
  };

  const disconnect = async () => {
    try {
      if (account) {
        await starknetDisconnect();
      }
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    } finally {
      signOut();
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      account,
      isConnecting,
      error,
      connectWallet,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      disconnect,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
