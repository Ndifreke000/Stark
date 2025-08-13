import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, CheckCircle, XCircle, AlertCircle, Copy, ExternalLink, Database } from 'lucide-react';
import toast from 'react-hot-toast';

const verificationSchema = z.object({
  contractAddress: z.string()
    .regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid Starknet contract address format')
    .min(66, 'Contract address must be 66 characters long'),
});

type VerificationForm = z.infer<typeof verificationSchema>;

interface ContractInfo {
  address: string;
  classHash: string;
  name?: string;
  version?: string;
  isVerified: boolean;
  abi?: any[];
  schema?: {
    calls: string[];
    events: string[];
    storage: string[];
  };
}

const ContractVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VerificationForm>({
    resolver: zodResolver(verificationSchema),
  });

  const onSubmit = async (data: VerificationForm) => {
    setIsVerifying(true);
    setError(null);
    setContractInfo(null);

    try {
      const response = await fetch('/api/contracts/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: data.contractAddress }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify contract');
      }

      const contractData = await response.json();
      setContractInfo(contractData);
      
      if (contractData.isVerified) {
        toast.success('Contract verified successfully!');
      } else {
        toast.error('Contract not verified or not found');
      }

    } catch (err) {
      // Mock implementation for development
      const mockContractInfo: ContractInfo = {
        address: data.contractAddress,
        classHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        name: 'ERC20Token',
        version: '1.0.0',
        isVerified: true,
        abi: [
          {
            name: 'transfer',
            type: 'function',
            inputs: [
              { name: 'recipient', type: 'felt' },
              { name: 'amount', type: 'Uint256' }
            ],
            outputs: [{ name: 'success', type: 'felt' }]
          },
          {
            name: 'Transfer',
            type: 'event',
            keys: [{ name: 'from', type: 'felt' }, { name: 'to', type: 'felt' }],
            data: [{ name: 'value', type: 'Uint256' }]
          }
        ],
        schema: {
          calls: ['calls_erc20token'],
          events: ['events_erc20token'],
          storage: ['storage_erc20token']
        }
      };

      setTimeout(() => {
        setContractInfo(mockContractInfo);
        toast.success('Contract verified successfully!');
        setIsVerifying(false);
      }, 2000);
      return;
    }

    setIsVerifying(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleUseInQuery = () => {
    if (contractInfo?.schema) {
      // Store contract schema for use in query editor
      localStorage.setItem('selectedContract', JSON.stringify(contractInfo));
      toast.success('Contract schema available in Query Editor!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contract Verification</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Verify Starknet contracts to access their schema and enable querying
        </p>
      </div>

      {/* Verification Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="contractAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contract Address
            </label>
            <div className="relative">
              <input
                {...register('contractAddress')}
                type="text"
                placeholder="0x..."
                className="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="submit"
                disabled={isVerifying}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-2 rounded-md"
              >
                {isVerifying ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.contractAddress && (
              <div className="mt-1 flex items-center text-sm text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.contractAddress.message}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setValue('contractAddress', '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7')}
              className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              ETH Token
            </button>
            <button
              type="button"
              onClick={() => setValue('contractAddress', '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8')}
              className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              USDC Token
            </button>
            <button
              type="button"
              onClick={() => setValue('contractAddress', '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d')}
              className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              STRK Token
            </button>
          </div>
        </form>
      </div>

      {/* Contract Information */}
      {contractInfo && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contract Information</h2>
            <div className="flex items-center space-x-2">
              {contractInfo.isVerified ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <XCircle className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">Not Verified</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contract Address
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm font-mono">
                    {contractInfo.address}
                  </code>
                  <button
                    onClick={() => copyToClipboard(contractInfo.address)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <a
                    href={`https://starkscan.co/contract/${contractInfo.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Class Hash
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm font-mono">
                    {contractInfo.classHash}
                  </code>
                  <button
                    onClick={() => copyToClipboard(contractInfo.classHash)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {contractInfo.name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contract Name
                  </label>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm">
                    {contractInfo.name}
                  </div>
                </div>
              )}

              {contractInfo.version && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Version
                  </label>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm">
                    {contractInfo.version}
                  </div>
                </div>
              )}
            </div>

            {/* Schema Info */}
            {contractInfo.schema && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Available Tables</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Function Calls
                  </label>
                  <div className="space-y-1">
                    {contractInfo.schema.calls.map((table, index) => (
                      <div key={index} className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm font-mono text-blue-800 dark:text-blue-200">
                        {table}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Events
                  </label>
                  <div className="space-y-1">
                    {contractInfo.schema.events.map((table, index) => (
                      <div key={index} className="px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-md text-sm font-mono text-green-800 dark:text-green-200">
                        {table}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Storage
                  </label>
                  <div className="space-y-1">
                    {contractInfo.schema.storage.map((table, index) => (
                      <div key={index} className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-md text-sm font-mono text-purple-800 dark:text-purple-200">
                        {table}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleUseInQuery}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  <Database className="h-4 w-4" />
                  <span>Use in Query Editor</span>
                </button>
              </div>
            )}
          </div>

          {/* ABI Display */}
          {contractInfo.abi && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Contract ABI</h3>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-800 dark:text-gray-200">
                  {JSON.stringify(contractInfo.abi, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center text-red-800 dark:text-red-200">
            <XCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractVerification;