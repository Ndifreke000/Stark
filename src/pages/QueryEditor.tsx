import React, { useState } from 'react';
import { Play, Save, Download, Crown, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const QueryEditor = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('-- Write your SQL query here\nSELECT * FROM starknet_transactions\nWHERE block_number > 100000\nLIMIT 100;');
  const [selectedDataset, setSelectedDataset] = useState('core');
  const [results, setResults] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Please connect your wallet to access the query editor</h1>
        </div>
      </div>
    );
  }

  const datasets = [
    { id: 'core', name: 'Starknet Core', description: 'Blocks, transactions, events' },
    { id: 'defi', name: 'DeFi Protocols', description: 'DEX, lending, liquidity' },
    { id: 'nft', name: 'NFT Data', description: 'Collections, trades, metadata' },
    { id: 'bridge', name: 'Bridge Activity', description: 'L1-L2 transfers, deposits' }
  ];

  const executeQuery = () => {
    if (user.queriesUsed >= user.queryLimit && !user.isPremium) {
      return;
    }
    
    setIsExecuting(true);
    // Mock query execution
    setTimeout(() => {
      setResults([
        { block_number: 100001, hash: '0x1234...', timestamp: '2024-01-21 10:00:00' },
        { block_number: 100002, hash: '0x5678...', timestamp: '2024-01-21 10:01:00' },
        { block_number: 100003, hash: '0x9abc...', timestamp: '2024-01-21 10:02:00' }
      ]);
      setIsExecuting(false);
      // Update query count
      user.queriesUsed += 1;
    }, 1500);
  };

  const canExecuteQuery = user.isPremium || user.queriesUsed < user.queryLimit;
  const canSaveQuery = user.isPremium;
  const canExportResults = user.isPremium;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SQL Query Editor</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Query Starknet data with SQL - {user.queriesUsed}/{user.queryLimit} queries used this month
          </p>
        </div>
        
        {!user.isPremium && (
          <Link
            to="/premium"
            className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:from-yellow-500 hover:to-yellow-700"
          >
            <Crown className="h-4 w-4" />
            <span>Upgrade to Premium</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Dataset Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Select Dataset</h3>
          <div className="space-y-2">
            {datasets.map((dataset) => (
              <button
                key={dataset.id}
                onClick={() => setSelectedDataset(dataset.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedDataset === dataset.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="font-medium text-sm">{dataset.name}</div>
                <div className="text-xs text-gray-500 mt-1">{dataset.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Query Editor and Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Query Editor */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Query Editor</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => canSaveQuery ? null : null}
                  disabled={!canSaveQuery}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    canSaveQuery
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {!canSaveQuery && <Lock className="h-4 w-4" />}
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={executeQuery}
                  disabled={!canExecuteQuery || isExecuting}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                    canExecuteQuery
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Play className="h-4 w-4" />
                  <span>{isExecuting ? 'Running...' : 'Run Query'}</span>
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-64 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your SQL query here..."
              />
            </div>
            
            {!canExecuteQuery && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                  <Crown className="h-4 w-4" />
                  <span className="text-sm">
                    Query limit reached. <Link to="/premium" className="underline">Upgrade to Premium</Link> for unlimited queries.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Query Results */}
          {results.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Results ({results.length} rows)
                </h3>
                <button
                  onClick={() => canExportResults ? null : null}
                  disabled={!canExportResults}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    canExportResults
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {!canExportResults && <Lock className="h-4 w-4" />}
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>
              
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      {Object.keys(results[0] || {}).map((key) => (
                        <th key={key} className="text-left py-2 px-3 font-medium text-gray-900 dark:text-white">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="py-2 px-3 text-gray-700 dark:text-gray-300">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueryEditor;