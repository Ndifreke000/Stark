import React, { useEffect, useMemo, useState } from 'react';
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
  ChevronRight,
  Plus,
  Settings,
} from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import {
  getDashboards,
  createDashboard,
  addWidget,
  Dashboard as StoreDashboard,
  DashboardWidget,
} from '../../services/dashboardStore';
import { Spellbook } from '../../spellbook/engine';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler);

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
  executionTime: number;
  rowCount: number;
}

type VizType = 'table' | 'bar' | 'line' | 'area' | 'scatter' | 'pie' | 'counter' | 'pivot';

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
  const [activeTab, setActiveTab] = useState<'editor' | 'results' | 'visualization' | 'schema'>('editor');
  const [showSchemaPanel, setShowSchemaPanel] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Execution/results state
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [results, setResults] = useState<QueryResult | null>(null);

  // Visualization state
  const [chartType, setChartType] = useState<VizType>('table');
  const [chartConfig, setChartConfig] = useState<{ xAxis: string; yAxis: string; groupBy: string; aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' }>(
    { xAxis: '', yAxis: '', groupBy: '', aggregation: 'sum' }
  );

  // Add to dashboard modal state
  const [addToDashOpen, setAddToDashOpen] = useState(false);
  const [dashboards, setDashboards] = useState<StoreDashboard[]>([]);
  const [selectedDashId, setSelectedDashId] = useState<string>('');
  const [newDashName, setNewDashName] = useState<string>('');
  const [adding, setAdding] = useState(false);

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

  // Load dashboards for the modal
  useEffect(() => {
    if (!addToDashOpen) return;
    setDashboards(getDashboards());
  }, [addToDashOpen]);

  const runQuery = async () => {
    setIsExecuting(true);
    const start = performance.now();
    try {
      onExecute?.(query);

      // Execute via Spellbook (dbt-style metrics engine)
      const res = Spellbook.executeQuery(query);
      const end = performance.now();
      setResults({
        columns: res.columns,
        rows: res.rows,
        executionTime: Math.round(end - start),
        rowCount: res.rows.length,
      });
      setActiveTab('visualization');
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

  return (
    <div className="w-full h-full flex flex-col text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-blue-600" />
          <input
            className="bg-transparent border-none outline-none text-xl font-semibold text-gray-900 dark:text-white"
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
            placeholder="Query name..."
          />
          {lastSaved && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Settings Dropdown */}
          <div className="relative group">
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors">
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
              <div className="p-3 space-y-3">
                <button
                  onClick={() => setDarkMode((d) => !d)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {darkMode ? 'Light mode' : 'Dark mode'}
                </button>
                <button
                  onClick={() => setShowLineNumbers((v) => !v)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  {showLineNumbers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showLineNumbers ? 'Hide line numbers' : 'Show line numbers'}
                </button>
                <button
                  onClick={() => setWordWrap((v) => !v)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <WrapText className="w-4 h-4" />
                  {wordWrap ? 'Disable wrap' : 'Enable wrap'}
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <label className="block text-xs font-medium text-gray-500 mb-2">Font Size</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  >
                    {[12, 14, 16, 18].map((s) => (
                      <option key={s} value={s}>{s}px</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={saveQuery}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          
          <button
            disabled={isExecuting}
            onClick={runQuery}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm font-medium shadow-sm transition-colors"
          >
            <Play className="w-4 h-4" />
            {isExecuting ? 'Running...' : 'Run Query'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-1">
          {(['editor', 'results', 'visualization', 'schema'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t 
                  ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm border border-gray-200 dark:border-gray-700' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-900/50'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setShowSchemaPanel((s) => !s)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${showSchemaPanel ? 'rotate-180' : ''}`} />
          {showSchemaPanel ? 'Hide Schema' : 'Show Schema'}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Schema Panel */}
        <AnimatePresence initial={false}>
          {showSchemaPanel && (
            <motion.aside
              key="schema-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden"
            >
              <div className="p-4 h-full overflow-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search tables or columns..."
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="space-y-3">
                  {filteredSchema.map((table) => (
                    <details key={table.name} className="group" open>
                      <summary className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <span className="font-medium text-sm">{table.name}</span>
                        <span className="text-xs text-gray-500">
                          {table.rowCount?.toLocaleString()} rows
                        </span>
                      </summary>
                      <div className="mt-2 space-y-2">
                        {table.columns.map((col) => (
                          <div key={col.name} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md group/col">
                            <div className="flex-1 min-w-0">
                              <div className="font-mono text-xs text-gray-900 dark:text-white">
                                {col.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {col.type}{col.nullable ? ', nullable' : ''}
                              </div>
                              {col.description && (
                                <div className="text-xs text-gray-400 mt-1">
                                  {col.description}
                                </div>
                              )}
                            </div>
                            <button
                              className="opacity-0 group-hover/col:opacity-100 px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
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
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 min-w-0 overflow-auto bg-white dark:bg-gray-900">
          {activeTab === 'editor' && (
            <div className="h-full flex flex-col">
              <div className="flex-1 p-4">
                <CodeMirror
                  value={query}
                  height="100%"
                  theme={darkMode ? oneDark : undefined}
                  extensions={cmExtensions}
                  basicSetup={cmBasicSetup}
                  onChange={(val) => setQuery(val)}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                />
              </div>
              <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <button
                    disabled={isExecuting}
                    onClick={runQuery}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    {isExecuting ? 'Running...' : 'Run Query'}
                  </button>
                  <button
                    onClick={saveQuery}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <input 
                    type="checkbox" 
                    checked={autoSave} 
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Auto-save
                </label>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="p-4">
              {!results ? (
                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Run a query to see results</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {results.rowCount} rows • {results.executionTime} ms
                    </div>
                  </div>
                  <div className="overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          {results.columns.map((c) => (
                            <th key={c} className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.rows.map((r, i) => (
                          <tr key={i} className={i % 2 ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}>
                            {r.map((cell, j) => (
                              <td key={j} className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
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
          )}

          {activeTab === 'visualization' && (
            <div className="p-4">
              {!results || results.rows.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Run a query to create visualizations</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Visualization Controls */}
                  <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Type:</label>
                      <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value as VizType)}
                        className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                      >
                        <option value="table">Table</option>
                        <option value="bar">Bar Chart</option>
                        <option value="area">Area Chart</option>
                        <option value="scatter">Scatter Chart</option>
                        <option value="line">Line Chart</option>
                        <option value="pie">Pie Chart</option>
                        <option value="counter">Counter</option>
                        <option value="pivot">Pivot Table</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">X-Axis:</label>
                      <select
                        value={chartConfig.xAxis}
                        onChange={(e) => setChartConfig({ ...chartConfig, xAxis: e.target.value })}
                        className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                      >
                        <option value="">Select column</option>
                        {results.columns.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Y-Axis:</label>
                      <select
                        value={chartConfig.yAxis}
                        onChange={(e) => setChartConfig({ ...chartConfig, yAxis: e.target.value })}
                        className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                      >
                        <option value="">Select column</option>
                        {results.columns.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="ml-auto">
                      <button
                        onClick={() => setAddToDashOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Dashboard
                      </button>
                    </div>
                  </div>

                  {/* Visualization Display */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    {chartType === 'table' && (
                      <div className="overflow-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              {results.columns.map((c) => (
                                <th key={c} className="px-4 py-3 text-left font-semibold">
                                  {c}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {results.rows.map((r, i) => (
                              <tr key={i} className={i % 2 ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}>
                                {r.map((cell, j) => (
                                  <td key={j} className="px-4 py-3">
                                    {String(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {chartType === 'counter' && (
                      <div className="text-center py-12">
                        <div className="text-6xl font-bold text-blue-600 mb-4">
                          {results.rowCount.toLocaleString()}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          Total Records
                        </div>
                      </div>
                    )}

                    {(chartType === 'bar' || chartType === 'line' || chartType === 'area' || chartType === 'scatter' || chartType === 'pie') && (
                      <div className="flex items-center justify-center h-64 text-gray-500">
                        <p>Chart visualization will be implemented here</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Database Schema
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Explore available tables and columns in the Starknet dataset
                  </p>
                </div>

                <div className="space-y-4">
                  {schema.map((table) => (
                    <div key={table.name} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {table.name}
                          </h4>
                          <div className="text-sm text-gray-500">
                            {table.rowCount?.toLocaleString()} rows ��� Updated {table.lastUpdated}
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="overflow-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="text-gray-500 border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-2 font-medium">Column</th>
                                <th className="text-left py-2 font-medium">Type</th>
                                <th className="text-left py-2 font-medium">Nullable</th>
                                <th className="text-left py-2 font-medium">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {table.columns.map((c) => (
                                <tr key={c.name} className="border-b border-gray-100 dark:border-gray-800">
                                  <td className="py-2 font-mono text-gray-900 dark:text-white">
                                    {c.name}
                                  </td>
                                  <td className="py-2 text-gray-600 dark:text-gray-400">
                                    {c.type}
                                  </td>
                                  <td className="py-2 text-gray-600 dark:text-gray-400">
                                    {c.nullable ? 'YES' : 'NO'}
                                  </td>
                                  <td className="py-2 text-gray-600 dark:text-gray-400">
                                    {c.description || '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add to Dashboard Modal */}
      {addToDashOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAddToDashOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add to Dashboard</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select existing dashboard</label>
                <select
                  value={selectedDashId}
                  onChange={(e) => setSelectedDashId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <option value="">-- Select Dashboard --</option>
                  {dashboards.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="text-center text-sm text-gray-500">or</div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Create new dashboard</label>
                <input
                  value={newDashName}
                  onChange={(e) => setNewDashName(e.target.value)}
                  placeholder="Dashboard name"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  onClick={() => setAddToDashOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Add logic here
                    setAddToDashOpen(false);
                  }}
                  disabled={adding || (!selectedDashId && !newDashName.trim())}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {adding ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedQueryEditor;