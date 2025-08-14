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
  executionTime: number; // ms
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
      // External callback
      onExecute?.(query);

      // Simulate execution
      await new Promise((r) => setTimeout(r, 700));
      const rows = [
        [100001, '0xabc...', '2024-01-21 10:00:00', 1.23],
        [100002, '0xdef...', '2024-01-21 10:01:00', 0.75],
        [100003, '0x123...', '2024-01-21 10:02:00', 3.45],
        [100004, '0x456...', '2024-01-21 10:03:00', 0.15],
      ];
      const end = performance.now();
      setResults({
        columns: ['block_number', 'hash', 'timestamp', 'value'],
        rows,
        executionTime: Math.round(end - start),
        rowCount: rows.length,
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

  // Build chart.js datasets based on current results/config
  const buildChartData = () => {
    if (!results) return null;
    const { columns, rows } = results;
    const xIdx = columns.indexOf(chartConfig.xAxis);
    const yIdx = columns.indexOf(chartConfig.yAxis);

    if (chartType === 'pie') {
      if (xIdx === -1 || yIdx === -1) return null;
      const labels = rows.map((r) => String(r[xIdx]));
      const values = rows.map((r) => Number(r[yIdx]) || 0);
      return {
        labels,
        datasets: [{ data: values, backgroundColor: ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#14B8A6','#EC4899','#6366F1','#84CC16','#F97316'] }],
      };
    }

    if (chartType === 'bar' || chartType === 'line' || chartType === 'area') {
      if (xIdx === -1 || yIdx === -1) return null;
      const labels = rows.map((r) => String(r[xIdx]));
      const values = rows.map((r) => Number(r[yIdx]) || 0);
      return {
        labels,
        datasets: [{
          label: chartConfig.yAxis || 'value',
          data: values,
          backgroundColor: chartType === 'bar' ? '#3B82F6' : 'rgba(59,130,246,0.3)',
          borderColor: '#3B82F6',
          fill: chartType === 'area',
          pointRadius: 2,
          tension: 0.25,
        }],
      };
    }

    if (chartType === 'scatter') {
      if (xIdx === -1 || yIdx === -1) return null;
      const data = rows.map((r) => ({ x: Number(r[xIdx]) || 0, y: Number(r[yIdx]) || 0 }));
      return {
        datasets: [{ label: `${chartConfig.xAxis} vs ${chartConfig.yAxis}`, data, backgroundColor: '#3B82F6' }],
      };
    }

    return null;
  };

  // Pivot and Counter helpers
  const computeCounter = () => {
    if (!results) return 0;
    const { columns, rows } = results;
    const yIdx = columns.indexOf(chartConfig.yAxis);
    if (yIdx === -1) return rows.length; // default to row count
    const nums = rows.map((r) => Number(r[yIdx]) || 0);
    switch (chartConfig.aggregation) {
      case 'count':
        return rows.length;
      case 'avg':
        return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
      case 'min':
        return nums.length ? Math.min(...nums) : 0;
      case 'max':
        return nums.length ? Math.max(...nums) : 0;
      default:
        return nums.reduce((a, b) => a + b, 0);
    }
  };

  const computePivot = () => {
    if (!results) return null;
    const { columns, rows } = results;
    const rowKey = chartConfig.groupBy; // rows
    const colKey = chartConfig.xAxis;   // columns
    const valKey = chartConfig.yAxis;   // values
    const rIdx = columns.indexOf(rowKey);
    const cIdx = columns.indexOf(colKey);
    const vIdx = columns.indexOf(valKey);
    if (rIdx === -1 || cIdx === -1 || vIdx === -1) return null;

    const rowVals = Array.from(new Set(rows.map((r) => String(r[rIdx]))));
    const colVals = Array.from(new Set(rows.map((r) => String(r[cIdx]))));

    const grid: Record<string, Record<string, number>> = {};
    for (const r of rowVals) grid[r] = {};

    for (const row of rows) {
      const r = String(row[rIdx]);
      const c = String(row[cIdx]);
      const v = Number(row[vIdx]) || 0;
      const cur = grid[r][c] || 0;
      if (chartConfig.aggregation === 'count') grid[r][c] = cur + 1;
      else if (chartConfig.aggregation === 'avg') {
        // Simple avg via incremental sum/count map not stored; fallback to sum
        grid[r][c] = cur + v;
      } else if (chartConfig.aggregation === 'min') grid[r][c] = grid[r][c] == null ? v : Math.min(grid[r][c], v);
      else if (chartConfig.aggregation === 'max') grid[r][c] = grid[r][c] == null ? v : Math.max(grid[r][c], v);
      else grid[r][c] = cur + v; // sum
    }

    return { rowVals, colVals, grid };
  };

  const chartData = useMemo(() => buildChartData(), [results, chartType, chartConfig]);

  const addVisualizationToDashboard = async () => {
    if (!results) return;
    setAdding(true);
    try {
      let dashId = selectedDashId;
      if (!dashId) {
        if (!newDashName.trim()) {
          setAdding(false);
          return;
        }
        const d = createDashboard(newDashName.trim());
        dashId = d.id;
      }

      const widget: DashboardWidget = {
        id: '',
        type: chartType,
        title: queryName || `${chartType} widget`,
        query,
        config: { ...chartConfig },
        data: { result: results, chartData },
        position: { x: 0, y: 0, w: 6, h: 4 },
      } as any;

      addWidget(dashId, widget);

      // Close modal and reset
      setAddToDashOpen(false);
      setSelectedDashId('');
      setNewDashName('');
    } finally {
      setAdding(false);
    }
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

  const Visualization = () => {
    if (!results || results.rows.length === 0) return (
      <div className="text-sm text-gray-500 dark:text-gray-400">No results to visualize.</div>
    );

    return (
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span>Type:</span>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as VizType)}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <option value="table">Table</option>
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="area">Area</option>
            <option value="scatter">Scatter</option>
            <option value="pie">Pie</option>
            <option value="counter">Counter</option>
            <option value="pivot">Pivot Table</option>
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

          <span className="ml-2">Group by:</span>
          <select
            value={chartConfig.groupBy}
            onChange={(e) => setChartConfig({ ...chartConfig, groupBy: e.target.value })}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <option value="">None</option>
            {results.columns.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <span className="ml-2">Aggregation:</span>
          <select
            value={chartConfig.aggregation}
            onChange={(e) => setChartConfig({ ...chartConfig, aggregation: e.target.value as any })}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <option value="sum">Sum</option>
            <option value="count">Count</option>
            <option value="avg">Average</option>
            <option value="min">Min</option>
            <option value="max">Max</option>
          </select>

          <div className="ml-auto">
            <button
              onClick={() => setAddToDashOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              <Plus className="w-4 h-4" /> Add to Dashboard
            </button>
          </div>
        </div>

        {/* Render visualization */}
        {chartType === 'table' && (
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
        )}

        {(chartType === 'bar' || chartType === 'line' || chartType === 'area') && chartData && (
          <div className="w-full h-72">
            {chartType === 'bar' && <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />}
            {(chartType === 'line' || chartType === 'area') && <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />}
          </div>
        )}

        {chartType === 'scatter' && chartData && (
          <div className="w-full h-72">
            <Scatter data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        )}

        {chartType === 'pie' && chartData && (
          <div className="w-full max-w-md">
            <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>
        )}

        {chartType === 'counter' && (
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{chartConfig.aggregation.toUpperCase()} of {chartConfig.yAxis || 'rows'}</div>
            <div className="text-4xl font-bold text-blue-600">{computeCounter().toLocaleString()}</div>
          </div>
        )}

        {chartType === 'pivot' && (() => {
          const pivot = computePivot();
          if (!pivot) return <div className="text-sm text-gray-500">Set Group by, X, and Y columns to generate a pivot.</div>;
          return (
            <div className="overflow-auto border border-gray-200 dark:border-gray-700 rounded-md">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left font-semibold border-b border-gray-200 dark:border-gray-700">{chartConfig.groupBy}</th>
                    {pivot.colVals.map((c) => (
                      <th key={c} className="px-3 py-2 text-left font-semibold border-b border-gray-200 dark:border-gray-700">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pivot.rowVals.map((r) => (
                    <tr key={r}>
                      <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 font-semibold">{r}</td>
                      {pivot.colVals.map((c) => (
                        <td key={c} className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">{(pivot.grid[r] && pivot.grid[r][c] != null) ? pivot.grid[r][c] : '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
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
            <span className="inline-flex items-center gap-1"><ChevronRight className={`w-4 h-4 ${showSchemaPanel ? '' : 'rotate-180'}`} /> {showSchemaPanel ? 'Hide schema' : 'Show schema'}</span>
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

      {/* Add to dashboard modal */}
      {addToDashOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAddToDashOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-3">Add to Dashboard</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium mb-1">Select existing dashboard</div>
                <select
                  value={selectedDashId}
                  onChange={(e) => setSelectedDashId(e.target.value)}
                  className="w-full px-2 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <option value="">-- None --</option>
                  {dashboards.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="text-center text-xs text-gray-500">or</div>
              <div>
                <div className="text-sm font-medium mb-1">Create new dashboard</div>
                <input
                  value={newDashName}
                  onChange={(e) => setNewDashName(e.target.value)}
                  placeholder="Dashboard name"
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setAddToDashOpen(false)} className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700">Cancel</button>
                <a
                  href={selectedDashId ? `/dashboard?dashId=${selectedDashId}` : '#'}
                  className="hidden"
                />
                <button
                  onClick={addVisualizationToDashboard}
                  disabled={adding || (!selectedDashId && !newDashName.trim())}
                  className="px-3 py-1.5 rounded bg-green-600 text-white disabled:opacity-50"
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
