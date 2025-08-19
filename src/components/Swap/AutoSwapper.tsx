import React, { useState, useEffect } from 'react';
import { Contract, Provider, AccountInterface, uint256 } from 'starknet';
import { toast } from 'react-hot-toast';
import AnimatedInput from '../ui/AnimatedInput';
import AnimatedButton from '../ui/AnimatedButton';
import { Loader2 } from 'lucide-react';
import { TokenContract } from '../../services/TokenContract';

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
  const [fromBalance, setFromBalance] = useState<string>('0');
  const [toBalance, setToBalance] = useState<string>('0');
  const [fromSymbol, setFromSymbol] = useState<string>('');
  const [toSymbol, setToSymbol] = useState<string>('');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [loadingBalances, setLoadingBalances] = useState(false);

  const loadBalances = async () => {
    if (!account) return;
    
    setLoadingBalances(true);
    try {
      const fromContract = new TokenContract(fromToken, provider);
      const toContract = new TokenContract(toToken, provider);

      const [fromBal, toBal, fromSym, toSym] = await Promise.all([
        fromContract.getBalance(account.address),
        toContract.getBalance(account.address),
        fromContract.getSymbol(),
        toContract.getSymbol()
      ]);

      setFromBalance(fromBal);
      setToBalance(toBal);
      setFromSymbol(fromSym);
      setToSymbol(toSym);
    } catch (error) {
      console.error('Error loading balances:', error);
      toast.error('Failed to load balances');
    } finally {
      setLoadingBalances(false);
    }
  };

  useEffect(() => {
    if (account) {
      loadBalances();
    }
  }, [account, fromToken, toToken]);

  const executeSwap = async () => {
    if (!amount || !account) return;

    const toastId = toast.loading('Preparing swap...');
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

      setTransactionHash(tx.transaction_hash);
      toast.success('Swap initiated!', { id: toastId });
      
      // Wait for transaction confirmation
      await provider.waitForTransaction(tx.transaction_hash);
      toast.success('Swap completed successfully!');
      
      // Reload balances
      await loadBalances();
      
    } catch (error: any) {
      console.error('Swap failed:', error);
      toast.error(
        error.message || 'Swap failed. Please try again.',
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
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
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              From
            </label>
            {loadingBalances ? (
              <span className="text-sm text-gray-500 flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </span>
            ) : (
              <span className="text-sm text-gray-500">
                Balance: {fromBalance} {fromSymbol}
              </span>
            )}
          </div>
          <select
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
            disabled={loading || loadingBalances}
          >
            <option value={TOKEN_ADDRESSES.STRK}>STRK</option>
            <option value={TOKEN_ADDRESSES.USDC}>USDC</option>
          </select>
        </div>

        <button
          onClick={switchTokens}
          className="mx-auto block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-50"
          disabled={loading || loadingBalances}
        >
          ↕️
        </button>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              To
            </label>
            {loadingBalances ? (
              <span className="text-sm text-gray-500 flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </span>
            ) : (
              <span className="text-sm text-gray-500">
                Balance: {toBalance} {toSymbol}
              </span>
            )}
          </div>
          <select
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
            disabled={loading || loadingBalances}
          >
            <option value={TOKEN_ADDRESSES.STRK}>STRK</option>
            <option value={TOKEN_ADDRESSES.USDC}>USDC</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount
            </label>
            <button
              onClick={() => setAmount(fromBalance)}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
              disabled={loading || loadingBalances || !fromBalance}
            >
              Max
            </button>
          </div>
          <AnimatedInput
            type="number"
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full"
            disabled={loading || loadingBalances}
          />
        </div>

        {transactionHash && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Transaction Hash:
              <a
                href={`https://starkscan.co/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-blue-600 hover:text-blue-700"
              >
                {transactionHash.slice(0, 8)}...{transactionHash.slice(-6)}
              </a>
            </p>
          </div>
        )}

        <AnimatedButton
          onClick={executeSwap}
          disabled={loading || loadingBalances || !amount || !account}
          className="w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Swapping...
            </span>
          ) : (
            'Swap'
          )}
        </AnimatedButton>
      </div>
    </div>
  );
};
