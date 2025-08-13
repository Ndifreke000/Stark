import React, { useState, useEffect, useRef } from 'react';
import { Crown, Play, Save, Lock, Download, Database, BookOpen, Sparkles, History, BarChart3, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';

interface QueryResult {
  columns: string[];
  rows: any[][];
  executionTime: number;
  rowCount: number;
}

interface SavedQuery {
  id: string;
  name: string;
  query: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface SchemaTable {
  name: string;
  type: 'table' | 'view';
  columns: {
    name: string;
    type: string;
    description?: string;
  }[];
  description?: string;
}

interface ContractSchema {
  address: string;
  name: string;
  tables: SchemaTable[];
}

const EnhancedQueryEditor = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState(`-- Welcome to StarkAnalytics Query Editor
-- Query Starknet blockchain data with SQL

SELECT 
  block_number,
  transaction_hash,
  from_address,
  to_address,
  value
FROM starknet_transactions 
WHERE block_number > 100000 
  AND value > 1000000000000000000  -- 1 ETH in wei
ORDER BY block_number DESC
LIMIT 100;`);

  const [results, setResults] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [selectedDataset, setSelectedDataset] = useState('core');
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<'schema' | 'history' | 'saved'>('schema');
  const [contractSchemas, setContractSchemas] = useState<ContractSchema[]>([]);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const editorRef = useRef<any>(null);

  // Load contract schemas from localStorage
  useEffect(() => {
    const selectedContract = localStorage.getItem('selectedContract');
    if (selectedContract) {
      try {
        const contract = JSON.parse(selectedContract);
        const schema: ContractSchema = {
          address: contract.address,
          name: contract.name || 'Unknown Contract',
          tables: [
            {
              name: `calls_${contract.name?.toLowerCase() || 'contract'}`,
              type: 'table',
              columns: [
                { name: 'block_number', type: 'INTEGER', description: 'Block number' },
                { name: 'transaction_hash', type: 'TEXT', description: 'Transaction hash' },
                { name: 'contract_address', type: 'TEXT', description: 'Contract address' },
                { name: 'function_name', type: 'TEXT', description: 'Function called' },
                { name: 'calldata', type: 'TEXT', description: 'Function parameters' },
                { name: 'timestamp', type: 'TIMESTAMP', description: 'Block timestamp' }
              ],
              description: 'Function calls to this contract'
            },
            {
              name: `events_${contract.name?.toLowerCase() || 'contract'}`,
              type: 'table',
              columns: [
                { name: 'block_number', type: 'INTEGER', description: 'Block number' },
                { name: 'transaction_hash', type: 'TEXT', description: 'Transaction hash' },
                { name: 'contract_address', type: 'TEXT', description: 'Contract address' },
                { name: 'event_name', type: 'TEXT', description: 'Event name' },
                { name: 'event_data', type: 'TEXT', description: 'Event data' },
                { name: 'timestamp', type: 'TIMESTAMP', description: 'Block timestamp' }
              ],
              description: 'Events emitted by this contract'
            }
          ]
        };
        setContractSchemas([schema]);
      } catch (err) {
        console.error('Failed to parse selected contract:', err);
      }
    }
  }, []);

  const datasets = [
    { 
      id: 'core', 
      name: 'Starknet Core', 
      description: 'Blocks, transactions, events',
      tables: [
        {
          name: 'starknet_blocks',
          type: 'table' as const,
          columns: [
            { name: 'block_number', type: 'INTEGER', description: 'Sequential block number' },
            { name: 'block_hash', type: 'TEXT', description: 'Unique block hash' },
            { name: 'parent_hash', type: 'TEXT', description: 'Previous block hash' },
            { name: 'timestamp', type: 'TIMESTAMP', description: 'Block creation time' },
            { name: 'sequencer_address', type: 'TEXT', description: 'Block sequencer' },
            { name: 'transaction_count', type: 'INTEGER', description: 'Number of transactions' }
          ],
          description: 'Starknet block data'
        },
        {
          name: 'starknet_transactions',
          type: 'table' as const,
          columns: [
            { name: 'transaction_hash', type: 'TEXT', description: 'Unique transaction hash' },
            { name: 'block_number', type: 'INTEGER', description: 'Block containing transaction' },
            { name: 'from_address', type: 'TEXT', description: 'Sender address' },
            { name: 'to_address', type: 'TEXT', description: 'Recipient address' },
            { name: 'value', type: 'NUMERIC', description: 'Transaction value in wei' },
            { name: 'gas_used', type: 'INTEGER', description: 'Gas consumed' },
            { name: 'gas_price', type: 'NUMERIC', description: 'Gas price in wei' },
            { name: 'status', type: 'TEXT', description: 'Transaction status' },
            { name: 'timestamp', type: 'TIMESTAMP', description: 'Transaction time' }
          ],
          description: 'All Starknet transactions'
        }
      ]
    },
    { 
      id: 'defi', 
      name: 'DeFi Protocols', 
      description: 'DEX, lending, liquidity',
      tables: [
        {
          name: 'dex_swaps',
          type: 'table' as const,
          columns: [
            { name: 'transaction_hash', type: 'TEXT', description: 'Transaction hash' },
            { name: 'block_number', type: 'INTEGER', description: 'Block number' },
            { name: 'dex_name', type: 'TEXT', description: 'DEX protocol name' },
            { name: 'token_in', type: 'TEXT', description: 'Input token address' },
            { name: 'token_out', type: 'TEXT', description: 'Output token address' },
            { name: 'amount_in', type: 'NUMERIC', description: 'Input amount' },
            { name: 'amount_out', type: 'NUMERIC', description: 'Output amount' },
            { name: 'trader', type: 'TEXT', description: 'Trader address' },
            { name: 'timestamp', type: 'TIMESTAMP', description: 'Swap time' }
          ],
          description: 'DEX swap transactions'
        }
      ]
    }
  ];

  const executeQuery = async () => {
    if (!user || (user.queriesUsed >= user.queryLimit && !user.isPremium)) {
      toast.error('Query limit reached. Upgrade to Premium for unlimited queries.');
      return;
    }

    setIsExecuting(true);
    try {
      // Mock API call - replace with actual endpoint
      const response = await fetch('/api/query/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          query: query.trim(),
          dataset: selectedDataset
        })
      });

      if (!response.ok) {
        throw new Error('Query execution failed');
      }

      const result = await response.json();
      setResults(result);
      
      // Update query usage
      if (user) {
        user.queriesUsed += 1;
      }

      toast.success(`Query executed successfully! ${result.rowCount} rows returned.`);

    } catch (error) {
      // Mock implementation for development
      const mockResult: QueryResult = {
        columns: ['block_number', 'transaction_hash', 'from_address', 'to_address', 'value'],
        rows: [
          [100001, '0x1234...5678', '0xabc...def', '0x123...789', '1000000000000000000'],
          [100002, '0x2345...6789', '0xbcd...ef0', '0x234...890', '2000000000000000000'],
          [100003, '0x3456...789a', '0xcde...f01', '0x345...901', '500000000000000000']
        ],
        executionTime: 1.23,
        rowCount: 3
      };

      setTimeout(() => {
        setResults(mockResult);
        if (user) {
          user.queriesUsed += 1;
        }
        toast.success(`Query executed successfully! ${mockResult.rowCount} rows returned.`);
        setIsExecuting(false);
      }, 1500);
      return;
    }

    setIsExecuting(false);
  };

  const saveQuery = async () => {
    const name = prompt('Enter query name:');
    if (!name) return;

    try {
      const response = await fetch('/api/query/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          name,
          query: query.trim(),
          dataset: selectedDataset
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save query');
      }

      toast.success('Query saved successfully!');
      loadSavedQueries();

    } catch (error) {
      // Mock implementation
      const newQuery: SavedQuery = {
        id: Date.now().toString(),
        name,
        query: query.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setSavedQueries(prev => [newQuery, ...prev]);
      toast.success('Query saved successfully!');
    }
  };

  const loadSavedQueries = async () => {
    try {
      const response = await fetch('/api/query/saved', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load saved queries');
      }

      const queries = await response.json();
      setSavedQueries(queries);

    } catch (error) {
      console.error('Failed to load saved queries:', error);
    }
  };

  const getAISuggestion = async () => {
    if (!aiEnabled) return;

    setIsLoadingAI(true);
    try {
      const response = await fetch('/api/ai/suggest-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          query: query.trim(),
          dataset: selectedDataset,
          context: 'optimization'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestion');
      }

      const suggestion = await response.json();
      setAiSuggestion(suggestion.suggestion);

    } catch (error) {
      // Mock AI suggestion
      const mockSuggestions = [
        "Consider adding an index on block_number for better performance",
        "You can use EXPLAIN QUERY PLAN to analyze query performance",
        "Try using LIMIT with OFFSET for pagination",
        "Consider using aggregate functions like COUNT, SUM, AVG for analytics"
      ];
      
      setTimeout(() => {
        setAiSuggestion(mockSuggestions[Math.floor(Math.random() * mockSuggestions.length)]);
        setIsLoadingAI(false);
      }, 1000);
      return;
    }

    setIsLoadingAI(false);
  };

  const exportResults = () => {
    if (!results || !user?.isPremium) {
      toast.error('Premium feature: Export results to CSV');
      return;
    }

    const csv = [
      results.columns.join(','),
      ...results.rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentDataset = datasets.find(d => d.id === selectedDataset);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to access the query editor
          </h1>
          <Link
            to="/signin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Query Editor</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {user.queriesUsed}/{user.queryLimit} queries used this month
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAiEnabled(!aiEnabled)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                aiEnabled
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Assist</span>
            </button>
            
            {!user.isPremium && (
              <Link
                to="/premium"
                className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:from-yellow-500 hover:to-yellow-700"
              >
                <Crown className="h-4 w-4" />
                <span>Upgrade</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                {(['schema', 'saved', 'history'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab === 'schema' && <Database className="h-4 w-4 inline mr-1" />}
                    {tab === 'saved' && <Save className="h-4 w-4 inline mr-1" />}
                    {tab === 'history' && <History className="h-4 w-4 inline mr-1" />}
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'schema' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Dataset</h3>
                    <select
                      value={selectedDataset}
                      onChange={(e) => setSelectedDataset(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {datasets.map((dataset) => (
                        <option key={dataset.id} value={dataset.id}>
                          {dataset.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentDataset && (
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Tables</h3>
                      <div className="space-y-2">
                        {currentDataset.tables.map((table) => (
                          <div key={table.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm text-gray-900 dark:text-white">{table.name}</h4>
                              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                                {table.type}
                              </span>
                            </div>
                            {table.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{table.description}</p>
                            )}
                            <div className="space-y-1">
                              {table.columns.slice(0, 5).map((column) => (
                                <div key={column.name} className="flex justify-between text-xs">
                                  <span className="text-gray-700 dark:text-gray-300">{column.name}</span>
                                  <span className="text-gray-500 dark:text-gray-400">{column.type}</span>
                                </div>
                              ))}
                              {table.columns.length > 5 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  +{table.columns.length - 5} more columns
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {contractSchemas.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Contract Tables</h3>
                      <div className="space-y-2">
                        {contractSchemas.map((contract) => (
                          <div key={contract.address} className="border border-green-200 dark:border-green-700 rounded-lg p-3">
                            <h4 className="font-medium text-sm text-green-800 dark:text-green-200 mb-2">
                              {contract.name}
                            </h4>
                            {contract.tables.map((table) => (
                              <div key={table.name} className="mb-2 last:mb-0">
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{table.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{table.description}</div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'saved' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900 dark:text-white">Saved Queries</h3>
                    <button
                      onClick={loadSavedQueries}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Refresh
                    </button>
                  </div>
                  {savedQueries.map((savedQuery) => (
                    <div
                      key={savedQuery.id}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => setQuery(savedQuery.query)}
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-white">{savedQuery.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(savedQuery.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Query History</h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Query history will appear here after execution
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Query Editor */}
          <div className="flex-1 flex flex-col">
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <BookOpen className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Dataset: {currentDataset?.name}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {aiEnabled && (
                    <button
                      onClick={getAISuggestion}
                      disabled={isLoadingAI}
                      className="flex items-center space-x-1 px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>{isLoadingAI ? 'Thinking...' : 'Suggest'}</span>
                    </button>
                  )}
                  
                  <button
                    onClick={saveQuery}
                    disabled={!user?.isPremium}
                    className={`flex items-center space-x-1 px-3 py-1 text-sm rounded ${
                      user?.isPremium
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                    }`}
                  >
                    {!user?.isPremium && <Lock className="h-3 w-3" />}
                    <Save className="h-3 w-3" />
                    <span>Save</span>
                  </button>
                  
                  <button
                    onClick={executeQuery}
                    disabled={isExecuting || (!user?.isPremium && user?.queriesUsed >= user?.queryLimit)}
                    className={`flex items-center space-x-1 px-4 py-1 text-sm font-medium rounded ${
                      isExecuting || (!user?.isPremium && user?.queriesUsed >= user?.queryLimit)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Play className="h-3 w-3" />
                    <span>{isExecuting ? 'Running...' : 'Run'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* AI Suggestion */}
            {aiEnabled && aiSuggestion && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800 px-4 py-2">
                <div className="flex items-start space-x-2">
                  <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-purple-800 dark:text-purple-200">{aiSuggestion}</div>
                  </div>
                  <button
                    onClick={() => setAiSuggestion('')}
                    className="text-purple-600 hover:text-purple-700 text-xs"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="sql"
                value={query}
                onChange={(value) => setQuery(value || '')}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on'
                }}
                theme="vs-dark"
              />
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="h-80 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Results ({results.rowCount} rows)
                  </h3>
                  <span className="text-sm text-gray-500">
                    Executed in {results.executionTime}s
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {/* TODO: Create dashboard */}}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800"
                  >
                    <BarChart3 className="h-3 w-3" />
                    <span>Create Chart</span>
                  </button>
                  
                  <button
                    onClick={exportResults}
                    disabled={!user?.isPremium}
                    className={`flex items-center space-x-1 px-3 py-1 text-sm rounded ${
                      user?.isPremium
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                    }`}
                  >
                    {!user?.isPremium && <Lock className="h-3 w-3" />}
                    <Download className="h-3 w-3" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
              
              <div className="h-full overflow-auto p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      {results.columns.map((column) => (
                        <th key={column} className="text-left py-2 px-3 font-medium text-gray-900 dark:text-white">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.rows.map((row, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="py-2 px-3 text-gray-700 dark:text-gray-300">
                            {String(cell)}
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

export default EnhancedQueryEditor;