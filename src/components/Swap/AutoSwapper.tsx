import React, { useState } from 'react';
import { Contract, Provider, AccountInterface } from 'starknet';
import AnimatedInput from '../ui/AnimatedInput';
import AnimatedButton from '../ui/AnimatedButton';

const AUTO_SWAPPER_ADDRESS = '0x5b08cbdaa6a2338e69fad7c62ce20204f1666fece27288837163c19320b9496';

const TOKEN_ADDRESSES = {
  STRK: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  USDC: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8'
};

interface SwapProps {
  provider: Provider;
  account: AccountInterface | null;
}

export const AutoSwapper: React.FC<SwapProps> = ({ provider, account }) => {
  const [amount, setAmount] = useState<string>('');
  const [fromToken, setFromToken] = useState(TOKEN_ADDRESSES.STRK);
  const [toToken, setToToken] = useState(TOKEN_ADDRESSES.USDC);
  const [loading, setLoading] = useState(false);

  const executeSwap = async () => {
    if (!amount || !account) return;

    setLoading(true);
    try {
      const contract = new Contract([], AUTO_SWAPPER_ADDRESS, provider);
      
      const tx = await contract.execute_swap(
        fromToken,
        toToken,
        amount,
        {
          account
        }
      );

      console.log('Swap transaction:', tx);
      // Add your transaction success handling here
      
    } catch (error) {
      console.error('Swap failed:', error);
      // Add your error handling here
    }
    setLoading(false);
  };

  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">AutoSwapper</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            From
          </label>
          <select
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
          >
            <option value={TOKEN_ADDRESSES.STRK}>STRK</option>
            <option value={TOKEN_ADDRESSES.USDC}>USDC</option>
          </select>
        </div>

        <button
          onClick={switchTokens}
          className="mx-auto block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          ↕️
        </button>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            To
          </label>
          <select
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
          >
            <option value={TOKEN_ADDRESSES.STRK}>STRK</option>
            <option value={TOKEN_ADDRESSES.USDC}>USDC</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount
          </label>
          <AnimatedInput
            type="number"
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full"
          />
        </div>

        <AnimatedButton
          onClick={executeSwap}
          disabled={loading || !amount || !account}
          className="w-full"
        >
          {loading ? 'Swapping...' : 'Swap'}
        </AnimatedButton>
      </div>
    </div>
  );
};
