import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AutoSwapper } from '../components/Swap/AutoSwapper';
import { useProvider } from '../hooks/useProvider';

const SwapPage: React.FC = () => {
  const { account } = useAuth();
  const provider = useProvider();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Swap Tokens
      </h1>
      {provider && <AutoSwapper provider={provider} account={account} />}
    </div>
  );
};

export default SwapPage;
