import React, { useState, useEffect, useRef } from 'react';
import { Play, Save, Download, Database, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { io, Socket } from 'socket.io-client';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedCard from '../components/ui/AnimatedCard';

const QueryEditor = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('-- Write your SQL query here\nSELECT * FROM starknet_transactions LIMIT 100;');
  const [results, setResults] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:3000');
    socketRef.current.on('query_result', (data) => {
      setResults(data.rows);
      setIsExecuting(false);
    });
    socketRef.current.on('error', (error) => {
      console.error(error);
      setIsExecuting(false);
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Please connect your wallet to access the query editor</h1>
      </div>
    );
  }

  const executeQuery = () => {
    if (user.queriesUsed >= user.queryLimit && !user.isPremium) return;
    setIsExecuting(true);
    socketRef.current?.emit('query', { query });
    // This is a mock update, in a real scenario the backend would handle this
    user.queriesUsed += 1;
  };

  const canExecuteQuery = user.isPremium || user.queriesUsed < user.queryLimit;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Query Editor</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.queriesUsed}/{user.queryLimit} queries used this month
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <AnimatedButton variant="secondary" icon={Save} disabled={!user.isPremium}>Save</AnimatedButton>
              <AnimatedButton onClick={executeQuery} disabled={!canExecuteQuery || isExecuting} loading={isExecuting} icon={Play}>
                Run Query
              </AnimatedButton>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <AnimatedCard className="p-4">
              <h3 className="font-semibold mb-3">Datasets</h3>
              {/* Simplified dataset selector */}
              <div className="relative">
                <select className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800">
                  <option>Starknet Core</option>
                  <option>DeFi Protocols</option>
                </select>
              </div>
            </AnimatedCard>
          </div>
          <div className="lg:col-span-3 space-y-8">
            <AnimatedCard className="p-0 overflow-hidden">
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="font-semibold">SQL Editor</h3>
              </div>
              <div className="h-[40vh]">
                <Editor
                  height="100%"
                  defaultLanguage="sql"
                  defaultValue={query}
                  onChange={(value) => setQuery(value || '')}
                  theme={document.documentElement.classList.contains('dark') ? 'vs-dark' : 'light'}
                  options={{ minimap: { enabled: false } }}
                />
              </div>
            </AnimatedCard>
            {results.length > 0 && (
              <AnimatedCard>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Results ({results.length} rows)</h3>
                    <AnimatedButton variant="secondary" icon={Download} size="sm" disabled={!user.isPremium}>
                      Export CSV
                    </AnimatedButton>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b dark:border-gray-700">
                          {Object.keys(results[0] || {}).map(key => <th key={key} className="text-left p-2 font-medium">{key}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((row, i) => (
                          <tr key={i} className="border-b dark:border-gray-700">
                            {Object.values(row).map((val, j) => <td key={j} className="p-2 truncate max-w-xs">{String(val)}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </AnimatedCard>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QueryEditor;
