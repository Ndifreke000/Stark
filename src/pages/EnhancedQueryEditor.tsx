import React, { useState, useEffect, useRef } from 'react';
import { Crown, Play, Save, Lock, Download, Database, BookOpen, Sparkles, History, BarChart3, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
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
  const { user, updateProfile } = useAuth();
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
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'schema' | 'history' | 'saved'>('schema');
  const [sidebarSection, setSidebarSection] = useState<'profile' | 'library' | 'account' | 'usage' | 'create' | 'docs' | 'pricing' | 'more'>('profile');
  const location = useLocation();
  const [profileDraft, setProfileDraft] = useState({
    avatar: user?.avatar || '',
    name: user?.name || '',
    email: user?.email || '',
    linkedin: user?.linkedin || '',
    twitter: user?.twitter || '',
    phone: user?.phone || '',
    country: user?.country || '',
    portfolioUrl: user?.portfolioUrl || '',
    articleUrl: user?.articleUrl || '',
  });
  const [contractSchemas, setContractSchemas] = useState<ContractSchema[]>([]);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

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
          <div className="w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <nav className="flex flex-col gap-1">
                <Link
                  to="/profile"
                  className={`w-full inline-flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium transition border ${
                    location.pathname === '/profile'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                >
                  <span>Profile</span>
                  <span className="opacity-60">→</span>
                </Link>
                <Link
                  to="/portfolio"
                  className={`w-full inline-flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium transition border ${
                    location.pathname === '/portfolio'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                >
                  <span>Library</span>
                  <span className="opacity-60">→</span>
                </Link>

                <div className="relative" onMouseEnter={() => setShowCreateMenu(true)} onMouseLeave={() => setShowCreateMenu(false)}>
                  <button
                    onClick={() => setShowCreateMenu(!showCreateMenu)}
                    className={`w-full inline-flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium transition border ${
                      showCreateMenu
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>Create</span>
                    <span className="opacity-60">▾</span>
                  </button>
                  {showCreateMenu && (
                    <div className="absolute left-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                      <Link to="/query" className="block px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700">New Query</Link>
                      <Link to="/dashboard" className="block px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700">New Dashboard</Link>
                    </div>
                  )}
                </div>

                <a
                  href="https://docs.starknet.io"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium transition border bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700"
                >
                  <span>Docs</span>
                  <span className="opacity-60">↗</span>
                </a>

                <Link
                  to="/premium"
                  className={`w-full inline-flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium transition border ${
                    location.pathname === '/premium'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                >
                  <span>Usage & Pricing</span>
                  <span className="opacity-60">→</span>
                </Link>

                <button
                  onClick={toggleTheme}
                  className="w-full inline-flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium transition border bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700"
                >
                  <span>Light mode</span>
                  <span className="opacity-60">⤿</span>
                </button>

                <Link
                  to="/"
                  className={`w-full inline-flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium transition border ${
                    location.pathname === '/'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                >
                  <span>More</span>
                  <span className="opacity-60">→</span>
                </Link>
              </nav>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {sidebarSection === 'profile' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {profileDraft.avatar ? (
                        <img src={profileDraft.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
                      )}
                      <label className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              setProfileDraft({ ...profileDraft, avatar: url });
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Name" value={profileDraft.name} onChange={(e) => setProfileDraft({ ...profileDraft, name: e.target.value })} />
                    <input className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Email" value={profileDraft.email} onChange={(e) => setProfileDraft({ ...profileDraft, email: e.target.value })} />
                    <input className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="LinkedIn URL" value={profileDraft.linkedin} onChange={(e) => setProfileDraft({ ...profileDraft, linkedin: e.target.value })} />
                    <input className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Twitter/X URL" value={profileDraft.twitter} onChange={(e) => setProfileDraft({ ...profileDraft, twitter: e.target.value })} />
                    <input className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Phone" value={profileDraft.phone} onChange={(e) => setProfileDraft({ ...profileDraft, phone: e.target.value })} />
                    <input className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Country" value={profileDraft.country} onChange={(e) => setProfileDraft({ ...profileDraft, country: e.target.value })} />
                    <input className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white col-span-2" placeholder="Portfolio URL" value={profileDraft.portfolioUrl} onChange={(e) => setProfileDraft({ ...profileDraft, portfolioUrl: e.target.value })} />
                    <input className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white col-span-2" placeholder="Article Site URL" value={profileDraft.articleUrl} onChange={(e) => setProfileDraft({ ...profileDraft, articleUrl: e.target.value })} />
                  </div>

                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (!user) return;
                        updateProfile({ ...profileDraft });
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              )}

              {sidebarSection === 'library' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Library</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Your saved artifacts in Starklytics.</div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Dashboards</h4>
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">DEX Overview</div>
                      <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">NFT Market Insights</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Queries</h4>
                    <div className="space-y-2">
                      {savedQueries.length === 0 ? (
                        <div className="text-xs text-gray-500">No saved queries yet. Save one from the editor toolbar.</div>
                      ) : (
                        savedQueries.map((q) => (
                          <div key={q.id} onClick={() => setQuery(q.query)} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                            {q.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {sidebarSection === 'account' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Account</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Manage your Starklytics account.</div>
                  <div className="space-y-2 text-sm">
                    <div>Wallet Address</div>
                    <div className="font-mono break-all p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">{user?.address || '—'}</div>
                    <div>Email</div>
                    <div className="p-2 rounded bg-gray-100 dark:bg-gray-700">{user?.email || '—'}</div>
                    <div>Auth Method</div>
                    <div className="p-2 rounded bg-gray-100 dark:bg-gray-700">{user?.authMethod || '—'}</div>
                  </div>
                </div>
              )}

              {sidebarSection === 'usage' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Usage</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Free: 150 queries/month.</div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{user?.queriesUsed || 0} used</span>
                      <span>{user?.queryLimit || 150} total</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${Math.min(100, ((user?.queriesUsed || 0) / (user?.queryLimit || 150)) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {sidebarSection === 'create' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Create</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setActiveTab('schema')} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">New Query</button>
                    <button onClick={() => window.location.href = '/dashboard'} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">New Dashboard</button>
                    <button onClick={() => window.location.href = '/create-bounty'} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">New Bounty</button>
                    <button onClick={loadSavedQueries} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">Import Query</button>
                  </div>
                </div>
              )}

              {sidebarSection === 'docs' && (
                <div className="space-y-3 text-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Docs</h3>
                  <p className="text-gray-600 dark:text-gray-300">Explore Starklytics documentation for datasets, functions, and best practices.</p>
                  <a href="https://docs.starknet.io" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Starknet Docs</a>
                  <a href="/" className="text-blue-600 hover:underline">Starklytics Guides (placeholder)</a>
                </div>
              )}

              {sidebarSection === 'pricing' && (
                <div className="space-y-4 text-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Pricing</h3>
                  <p className="text-gray-600 dark:text-gray-300">Boost your team's Starklytics experience with faster executions, API export, programmatic queries.</p>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="font-semibold">Free</div>
                      <div className="text-xs text-gray-500">$0 — Free Forever</div>
                      <ul className="mt-2 list-disc list-inside space-y-1">
                        <li><strong>2,500</strong> Credits</li>
                        <li><strong>100 MB</strong> Storage</li>
                        <li><strong>1,000</strong> datapoints per Credit</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="font-semibold">Analyst — $45/mo billed annually</div>
                      <ul className="mt-2 list-disc list-inside space-y-1">
                        <li><strong>4,000</strong> Credits</li>
                        <li><strong>1 GB</strong> Storage</li>
                        <li><strong>1,000</strong> datapoints per Credit</li>
                        <li>Query Management Endpoints</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="font-semibold">Plus — $349/mo billed annually</div>
                      <ul className="mt-2 list-disc list-inside space-y-1">
                        <li><strong>25,000</strong> Credits</li>
                        <li><strong>15 GB</strong> Storage</li>
                        <li><strong>5,000</strong> datapoints per Credit</li>
                        <li>Query Management Endpoints</li>
                        <li>Large Query Engine</li>
                        <li>CSV exports</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="font-semibold">Premium — $849/mo billed annually</div>
                      <ul className="mt-2 list-disc list-inside space-y-1">
                        <li><strong>100,000</strong> Credits</li>
                        <li><strong>150 GB</strong> Storage</li>
                        <li><strong>25,000</strong> datapoints per Credit</li>
                        <li>Query Management Endpoints</li>
                        <li>Large Query Engine</li>
                        <li>CSV exports</li>
                        <li>Private query views</li>
                        <li>Private materialized views</li>
                        <li>Private data uploads</li>
                      </ul>
                    </div>
                    <div className="text-xs text-gray-500">Every Starklytics plan comes with unlimited free teammates, unlimited free executions, and SQL API access. Students get 50% off (placeholder).</div>
                    <div className="space-y-2">
                      <div className="font-medium">Credits are how Starklytics usage is measured</div>
                      <div className="text-gray-600 dark:text-gray-300">Choose between execution performance, programmatic queries, and API export volumes.</div>
                      <div>
                        <div className="font-medium">Query engine size</div>
                        <ul className="list-disc list-inside">
                          <li>0 credits — Free (times out at 120 seconds)</li>
                          <li>10 credits — Medium</li>
                          <li>20 credits — Large</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sidebarSection === 'more' && (
                <div className="space-y-3 text-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white">More</h3>
                  <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>Theme: <span className="font-medium">{theme === 'dark' ? 'Dark' : 'Light'}</span></div>
                    <button onClick={toggleTheme} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">
                      {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['Docs', 'Pricing', 'Homepage', 'Blog', 'Status', 'Guides', 'Discord', 'Careers', 'Give feedback', 'Terms & conditions'].map((item) => (
                      <a key={item} href="#" className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-center">{item}</a>
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Placeholder content for Starklytics pages. These entries can link to full pages when implemented.</p>
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
                <div className="flex items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span>Dataset:</span>
                    <select
                      value={selectedDataset}
                      onChange={(e) => setSelectedDataset(e.target.value)}
                      className="p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                    >
                      {datasets.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
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