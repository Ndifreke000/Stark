import React, { useState } from 'react';
import { Wallet, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ConnectWallet = () => {
  const { connectWallet, connectGoogle, isConnecting, user, error } = useAuth();
  const [showGoogleOption, setShowGoogleOption] = useState(false);

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
      setShowGoogleOption(true);
    } catch (err) {
      // Error is handled by AuthContext
    }
  };

  const handleGoogleConnect = async () => {
    try {
      await connectGoogle();
      setShowGoogleOption(false);
    } catch (err) {
      // Error is handled by AuthContext
    }
  };

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm">{error}</span>
        {error.includes('MetaMask') && (
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Install MetaMask
          </a>
        )}
      </div>
    );
  }

  if (showGoogleOption && user && !user.email) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Wallet connected!</span>
        <button
          onClick={handleGoogleConnect}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Mail className="h-4 w-4" />
          <span>Add Google (Optional)</span>
        </button>
        <button
          onClick={() => setShowGoogleOption(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Skip
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleWalletConnect}
      disabled={isConnecting}
      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
    >
      <Wallet className="h-4 w-4" />
      <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
    </button>
  );
};

export default ConnectWallet;