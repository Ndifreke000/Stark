import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Save,
  Database,
  Search,
  Eye,
  EyeOff,
  WrapText,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

interface AdvancedQueryEditorProps {
  initialQuery?: string;
  onExecute?: (query: string) => void;
  onSave?: (query: string, name: string) => void;
}

interface SchemaTable {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    description?: string;
  }>;
  rowCount?: number;
  lastUpdated?: string;
}

interface QueryResult {
  columns: string[];
  rows: any[][];
  executionTime: number; // ms
  rowCount: number;
}

const AdvancedQueryEditor: React.FC<AdvancedQueryEditorProps> = ({
  initialQuery = '-- Write your SQL here\nSELECT * FROM starknet_transactions\nLIMIT 10;',
  onExecute,
  onSave,
}) => {
  // Editor/UX state
  const [query, setQuery] = useState<string>(initialQuery);
  const [queryName, setQueryName] = useState<string>('Untitled Query');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(14);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [wordWrap, setWordWrap] = useState<boolean>(true);
  const [autoSave, setAutoSave] = useState<boolean>(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'results' | 'visualization' | 'schema'>('editor');
  const [showSchemaPanel, setShowSchemaPanel] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Execution/results state
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [results, setResults] = useState<QueryResult | null>(null);

  // Visualization state
  const [chartType, setChartType] = useState<'table' | 'bar' | 'line' | 'pie'>('table');
  const [chartConfig, setChartConfig] = useState<{ xAxis: string; yAxis: string; groupBy: string; aggregation: 'sum' | 'avg' | 'count' }>(
    { xAxis: '', yAxis: '', groupBy: '', aggregation: 'sum' }
  );

  // Schema (mock)
  const schema: SchemaTable[] = [
    {
      name: 'starknet_transactions',
      columns: [
        { name: 'hash', type: 'text', nullable: false, description: 'Transaction hash' },
        { name: 'block_number', type: 'integer', nullable: false, description: 'Block number' },
        { name: 'from_address', type: 'text', nullable: false, description: 'Sender address' },
        { name: 'to_address', type: 'text', nullable: true, description: 'Recipient address' },
        { name: 'value', type: 'numeric', nullable: false, description: 'Transaction value in ETH' },
        { name: 'gas_used', type: 'numeric', nullable: false, description: 'Gas used' },
        { name: 'timestamp', type: 'timestamp', nullable: false, description: 'Transaction timestamp' },
      ],
      rowCount: 1250000,
      lastUpdated: '2 minutes ago',
    },
    {
      name: 'starknet_blocks',
      columns: [
        { name: 'number', type: 'integer', nullable: false, description: 'Block number' },
        { name: 'hash', type: 'text', nullable: false, description: 'Block hash' },
        { name: 'parent_hash', type: 'text', nullable: false, description: 'Parent block hash' },
        { name: 'timestamp', type: 'timestamp', nullable: false, description: 'Block timestamp' },
        { name: 'gas_limit', type: 'numeric', nullable: false, description: 'Gas limit' },
        { name: 'gas_used', type: 'numeric', nullable: false, description: 'Gas used' },
        { name: 'transaction_count', type: 'integer', nullable: false, description: 'Number of transactions' },
      ],
      rowCount: 850000,
      lastUpdated: '1 minute ago',
    },
    {
      name: 'starknet_events',
      columns: [
        { name: 'transaction_hash', type: 'text', nullable: false, description: 'Transaction hash' },
        { name: 'event_index', type: 'integer', nullable: false, description: 'Event index in transaction' },
        { name: 'from_address', type: 'text', nullable: false, description: 'Contract address' },
        { name: 'keys', type: 'text[]', nullable: false, description: 'Event keys' },
        { name: 'data', type: 'text[]', nullable: false, description: 'Event data' },
      ],
      rowCount: 2420000,
      lastUpdated: 'just now',
    },
  ];

  // Derived schema filtered by search
  const filteredSchema = useMemo(() => {
    if (!searchTerm.trim()) return schema;
    const q = searchTerm.toLowerCase();
    return schema
      .map((t) => ({
        ...t,
        columns: t.columns.filter((c) =>
          c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)
        ),
      }))
      .filter((t) => t.name.toLowerCase().includes(q) || t.columns.length > 0);
  }, [searchTerm, schema]);

  // Debounced autosave
  useEffect(() => {
    if (!autoSave) return;
    const handle = setTimeout(() => setLastSaved(new Date()), 1200);
    return () => clearTimeout(handle);
  }, [query, autoSave]);

  // Copy feedback reset
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const runQuery = async () => {
    setIsExecuting(true);
    const start = performance.now();
    try {
      // Call external handler if provided
      onExecute?.(query);

      // Simulate execution and mock results
      await new Promise((r) => setTimeout(r, 700));
      const rows = [
        [100001, '0xabc...', '2024-01-21 10:00:00', 1.23],
        [100002, '0xdef...', '2024-01-21 10:01:00', 0.75],
        [100003, '0x123...', '2024-01-21 10:02:00', 3.45],
        [100004, '0x456...', '2024-01-21 10:03:00', 0.15],
      ];
      const end = performance.now();
      const res: QueryResult = {
        columns: ['block_number', 'hash', 'timestamp', 'value'],
        rows,
        executionTime: Math.round(end - start),
        rowCount: rows.length,
      };
      setResults(res);
      setActiveTab('results');
    } finally {
      setIsExecuting(false);
    }
  };

  const saveQuery = () => {
    onSave?.(query, queryName);
    setLastSaved(new Date());
  };

  const insertIntoQuery = (text: string) => {
    setQuery((prev) => (prev.endsWith(' ') ? prev + text : prev + ' ' + text));
    setActiveTab('editor');
  };

  // CodeMirror configuration
  const cmExtensions = useMemo(() => {
    const exts = [sql()];
    if (wordWrap) exts.push(EditorView.lineWrapping);
    exts.push(
      EditorView.theme({
        '.cm-content': { fontSize: `${fontSize}px` },
        '.cm-gutters': { fontSize: `${fontSize - 1}px` },
      })
    );
    return exts;
  }, [wordWrap, fontSize]);

  const cmBasicSetup = useMemo(
    () => ({
      lineNumbers: showLineNumbers,
      highlightActiveLine: true,
      highlightActiveLineGutter: true,
      foldGutter: true,
      bracketMatching: true,
      closeBrackets: true,
      autocompletion: true,
    }),
    [showLineNumbers]
  );

  // Simple visualization (bar chart)
  const Visualization = () => {
    if (!results || results.rows.length === 0) return (
      <div className="text-sm text-gray-500 dark:text-gray-400">No results to visualize.</div>
    );

    const [x, y] = [chartConfig.xAxis, chartConfig.yAxis];
    const xIdx = results.columns.indexOf(x);
    const yIdx = results.columns.indexOf(y);

    if (chartType === 'table' || xIdx === -1 || yIdx === -1) {
      return (
        <div className="overflow-auto border border-gray-200 dark:border-gray-700 rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
              <tr>
                {results.columns.map((c) => (
                  <th key={c} className="px-3 py-2 text-left font-semibold border-b border-gray-200 dark:border-gray-700">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.rows.map((r, i) => (
                <tr key={i} className={i % 2 ? 'bg-white/5' : ''}>
                  {r.map((cell, j) => (
                    <td key={j} className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">{String(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Build simple bar series
    const data = results.rows.map((r) => ({ x: String(r[xIdx]), y: Number(r[yIdx]) || 0 }));
    const maxY = Math.max(...data.map((d) => d.y), 1);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span>Chart:</span>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as any)}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <option value="table">Table</option>
            <option value="bar">Bar</option>
          </select>
          <span className="ml-4">X:</span>
          <select
            value={chartConfig.xAxis}
            onChange={(e) => setChartConfig({ ...chartConfig, xAxis: e.target.value })}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <option value="">Select column</option>
            {results.columns.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <span className="ml-2">Y:</span>
          <select
            value={chartConfig.yAxis}
            onChange={(e) => setChartConfig({ ...chartConfig, yAxis: e.target.value })}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <option value="">Select column</option>
            {results.columns.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="w-full h-64 border border-gray-200 dark:border-gray-700 rounded-md p-3 overflow-auto bg-white/50 dark:bg-gray-900/50">
          <div className="flex items-end gap-2 h-full">
            {data.map((d, i) => (
              <div key={i} className="flex flex-col items-center" style={{ width: `${Math.max(20, 100 / data.length)}%` }}>
                <div
                  className="w-full bg-blue-500/80 dark:bg-blue-500 rounded-t"
                  style={{ height: `${(d.y / maxY) * 100}%` }}
                  title={`${d.x}: ${d.y}`}
                />
                <div className="text-xs mt-1 truncate max-w-full" title={d.x}>{d.x}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between py-3 px-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          <input
            className="bg-transparent border-none outline-none text-lg font-semibold"
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
          />
          {lastSaved && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Saved {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode((d) => !d)}
            className="px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            title={darkMode ? 'Switch to light' : 'Switch to dark'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowLineNumbers((v) => !v)}
            className="px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            title={showLineNumbers ? 'Hide line numbers' : 'Show line numbers'}
          >
            {showLineNumbers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setWordWrap((v) => !v)}
            className="px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            title={wordWrap ? 'Disable word wrap' : 'Enable word wrap'}
          >
            <WrapText className="w-4 h-4" />
          </button>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="ml-2 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            title="Font size"
          >
            {[12, 14, 16, 18].map((s) => (
              <option key={s} value={s}>{s}px</option>
            ))}
          </select>
          <button
            onClick={saveQuery}
            className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Save className="w-4 h-4" /> Save
          </button>
          <button
            disabled={isExecuting}
            onClick={runQuery}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Play className="w-4 h-4" /> {isExecuting ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
        {(['editor', 'results', 'visualization', 'schema'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-2 py-1 rounded-md text-sm ${activeTab === t ? 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700' : 'hover:bg-white/60 dark:hover:bg-gray-900/60'}`}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowSchemaPanel((s) => !s)}
            className="px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            {showSchemaPanel ? (
              <span className="inline-flex items-center gap-1"><ChevronRight className="w-4 h-4" /> Hide schema</span>
            ) : (
              <span className="inline-flex items-center gap-1"><ChevronRight className="w-4 h-4 rotate-180" /> Show schema</span>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Schema panel */}
        <AnimatePresence initial={false}>
          {showSchemaPanel && (
            <motion.aside
              key="schema-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 overflow-auto"
            >
              <div className="flex items-center gap-2 mb-2 text-sm">
                <Search className="w-4 h-4" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tables or columns"
                  className="w-full px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950"
                />
              </div>
              <div className="space-y-2">
                {filteredSchema.map((table) => (
                  <details key={table.name} className="rounded-md border border-gray-200 dark:border-gray-800 group" open>
                    <summary className="flex items-center justify-between px-2 py-1 cursor-pointer bg-gray-50 dark:bg-gray-950">
                      <span className="font-medium text-sm">{table.name}</span>
                      <span className="text-xs text-gray-500">{table.rowCount?.toLocaleString()} rows</span>
                    </summary>
                    <div className="p-2 text-sm">
                      {table.columns.map((col) => (
                        <div key={col.name} className="flex items-center justify-between py-1">
                          <div>
                            <div className="font-mono text-xs">{col.name} <span className="text-gray-500">({col.type}{col.nullable ? ', null' : ''})</span></div>
                            {col.description && <div className="text-xs text-gray-500">{col.description}</div>}
                          </div>
                          <button
                            className="px-2 py-0.5 text-xs rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => insertIntoQuery(`${table.name}.${col.name}`)}
                          >
                            Insert
                          </button>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 min-w-0 overflow-auto">
          {activeTab === 'editor' && (
            <div className="p-3 space-y-3">
              <CodeMirror
                value={query}
                height="380px"
                theme={darkMode ? oneDark : undefined}
                extensions={cmExtensions}
                basicSetup={cmBasicSetup}
                onChange={(val) => setQuery(val)}
              />
              <div className="flex items-center gap-2">
                <button
                  disabled={isExecuting}
                  onClick={runQuery}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" /> {isExecuting ? 'Running...' : 'Run Query'}
                </button>
                <button
                  onClick={saveQuery}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Save className="w-4 h-4" /> Save
                </button>
                <label className="ml-2 text-sm inline-flex items-center gap-2">
                  <input type="checkbox" checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} /> Auto-save
                </label>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="p-3 space-y-3">
              {!results ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">Run a query to see results.</div>
              ) : (
                <>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {results.rowCount} rows • {results.executionTime} ms
                  </div>
                  <div className="overflow-auto border border-gray-200 dark:border-gray-700 rounded-md">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                        <tr>
                          {results.columns.map((c) => (
                            <th key={c} className="px-3 py-2 text-left font-semibold border-b border-gray-200 dark:border-gray-700">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.rows.map((r, i) => (
                          <tr key={i} className={i % 2 ? 'bg-white/5' : ''}>
                            {r.map((cell, j) => (
                              <td key={j} className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">{String(cell)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'visualization' && (
            <div className="p-3 space-y-3">
              <Visualization />
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Database schema overview</div>
              <div className="space-y-2">
                {schema.map((table) => (
                  <div key={table.name} className="border border-gray-200 dark:border-gray-800 rounded-md">
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-950 flex items-center justify-between">
                      <div className="font-semibold">{table.name}</div>
                      <div className="text-xs text-gray-500">{table.rowCount?.toLocaleString()} rows • Updated {table.lastUpdated}</div>
                    </div>
                    <div className="p-3 text-sm">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-xs text-gray-500">
                            <th className="py-1">Column</th>
                            <th className="py-1">Type</th>
                            <th className="py-1">Nullable</th>
                            <th className="py-1">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.columns.map((c) => (
                            <tr key={c.name} className="border-t border-gray-100 dark:border-gray-800">
                              <td className="py-1 font-mono">{c.name}</td>
                              <td className="py-1">{c.type}</td>
                              <td className="py-1">{c.nullable ? 'YES' : 'NO'}</td>
                              <td className="py-1 text-gray-600 dark:text-gray-400">{c.description || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedQueryEditor;
