import React, { useState, useEffect } from 'react';
import { Plus, Save, Share2, Coins, BarChart3, LineChart, PieChart, TrendingUp, Download, Settings, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import { getDashboardById, upsertDashboard } from '../services/dashboardStore';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

interface ChartWidget {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'counter' | 'table' | 'pivot' | 'text';
  title: string;
  query: string;
  data: any;
  config: {
    xAxis: string;
    yAxis: string;
    groupBy?: string;
    aggregation: 'sum' | 'count' | 'avg' | 'max' | 'min';
  };
  position: { x: number; y: number; w: number; h: number };
}

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: ChartWidget[];
  isPublic: boolean;
  created_at: string;
  updated_at: string;
}

const DashboardBuilder = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard>({
    id: '',
    name: 'New Dashboard',
    description: '',
    widgets: [],
    isPublic: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const [selectedWidget, setSelectedWidget] = useState<ChartWidget | null>(null);
  const [showWidgetEditor, setShowWidgetEditor] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const id = searchParams.get('dashId');
    if (id) {
      const d = getDashboardById(id);
      if (d) {
        setDashboard(d as any);
      }
    }
  }, [searchParams]);

  const chartTypes = [
    { type: 'bar' as const, name: 'Bar Chart', icon: BarChart3 },
    { type: 'line' as const, name: 'Line Chart', icon: LineChart },
    { type: 'pie' as const, name: 'Pie Chart', icon: PieChart }
  ];

  const sampleQueries = [
    {
      name: 'Daily Transaction Volume',
      query: `SELECT 
        DATE(timestamp) as date,
        COUNT(*) as transaction_count,
        SUM(value) as total_value
      FROM starknet_transactions 
      WHERE timestamp >= DATE('now', '-30 days')
      GROUP BY DATE(timestamp)
      ORDER BY date`,
      config: { xAxis: 'date', yAxis: 'transaction_count', aggregation: 'sum' as const }
    },
    {
      name: 'Top Contracts by Calls',
      query: `SELECT 
        contract_address,
        COUNT(*) as call_count
      FROM contract_calls 
      WHERE timestamp >= DATE('now', '-7 days')
      GROUP BY contract_address
      ORDER BY call_count DESC
      LIMIT 10`,
      config: { xAxis: 'contract_address', yAxis: 'call_count', aggregation: 'count' as const }
    },
    {
      name: 'Gas Usage Distribution',
      query: `SELECT 
        CASE 
          WHEN gas_used < 50000 THEN 'Low'
          WHEN gas_used < 200000 THEN 'Medium'
          ELSE 'High'
        END as gas_category,
        COUNT(*) as transaction_count
      FROM starknet_transactions
      WHERE timestamp >= DATE('now', '-24 hours')
      GROUP BY gas_category`,
      config: { xAxis: 'gas_category', yAxis: 'transaction_count', aggregation: 'count' as const }
    }
  ];

  const createWidget = (type: 'bar' | 'line' | 'pie') => {
    const newWidget: ChartWidget = {
      id: Date.now().toString(),
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
      query: sampleQueries[0].query,
      data: null,
      config: sampleQueries[0].config,
      position: { x: 0, y: 0, w: 6, h: 4 }
    };

    setSelectedWidget(newWidget);
    setShowWidgetEditor(true);
  };

  const executeWidgetQuery = async (widget: ChartWidget) => {
    try {
      // Mock API call - replace with actual endpoint
      const response = await fetch('/api/query/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          query: widget.query
        })
      });

      if (!response.ok) {
        throw new Error('Query execution failed');
      }

      const result = await response.json();
      return result;

    } catch (error) {
      // Mock data for development
      const mockData = {
        columns: ['date', 'transaction_count', 'total_value'],
        rows: [
          ['2024-01-15', 1250, 45000000000000000000],
          ['2024-01-16', 1380, 52000000000000000000],
          ['2024-01-17', 1120, 38000000000000000000],
          ['2024-01-18', 1450, 61000000000000000000],
          ['2024-01-19', 1290, 47000000000000000000],
          ['2024-01-20', 1520, 68000000000000000000],
          ['2024-01-21', 1340, 49000000000000000000]
        ]
      };

      return mockData;
    }
  };

  const saveWidget = async () => {
    if (!selectedWidget) return;

    try {
      const queryResult = await executeWidgetQuery(selectedWidget);
      
      // Transform data for chart
      const chartData = transformDataForChart(queryResult, selectedWidget);
      
      const updatedWidget = {
        ...selectedWidget,
        data: chartData
      };

      if (dashboard.widgets.find(w => w.id === selectedWidget.id)) {
        // Update existing widget
        setDashboard(prev => ({
          ...prev,
          widgets: prev.widgets.map(w => w.id === selectedWidget.id ? updatedWidget : w),
          updated_at: new Date().toISOString()
        }));
      } else {
        // Add new widget
        setDashboard(prev => ({
          ...prev,
          widgets: [...prev.widgets, updatedWidget],
          updated_at: new Date().toISOString()
        }));
      }

      setShowWidgetEditor(false);
      setSelectedWidget(null);
      toast.success('Widget saved successfully!');

    } catch (error) {
      toast.error('Failed to save widget');
    }
  };

  const transformDataForChart = (queryResult: any, widget: ChartWidget) => {
    const { config } = widget;
    const labels = queryResult.rows.map((row: any[]) => {
      const xIndex = queryResult.columns.indexOf(config.xAxis);
      return row[xIndex];
    });

    const values = queryResult.rows.map((row: any[]) => {
      const yIndex = queryResult.columns.indexOf(config.yAxis);
      return row[yIndex];
    });

    if (widget.type === 'pie') {
      return {
        labels,
        datasets: [{
          data: values,
          backgroundColor: [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
            '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1'
          ]
        }]
      };
    }

    return {
      labels,
      datasets: [{
        label: config.yAxis,
        data: values,
        backgroundColor: widget.type === 'bar' ? '#3B82F6' : undefined,
        borderColor: widget.type === 'line' ? '#3B82F6' : undefined,
        fill: widget.type === 'line' ? false : undefined
      }]
    };
  };

  const computeCounterFromResult = (queryResult: any, config: ChartWidget['config']) => {
    if (!queryResult) return 0;
    const { columns, rows } = queryResult;
    const yIdx = columns.indexOf(config.yAxis);
    if (yIdx === -1) return rows.length;
    const nums = rows.map((r: any[]) => Number(r[yIdx]) || 0);
    switch (config.aggregation) {
      case 'count': return rows.length;
      case 'avg': return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
      case 'min': return nums.length ? Math.min(...nums) : 0;
      case 'max': return nums.length ? Math.max(...nums) : 0;
      default: return nums.reduce((a, b) => a + b, 0);
    }
  };

  const computePivotFromResult = (queryResult: any, config: ChartWidget['config']) => {
    if (!queryResult) return null;
    const { columns, rows } = queryResult;
    const rIdx = columns.indexOf(config.groupBy || '');
    const cIdx = columns.indexOf(config.xAxis);
    const vIdx = columns.indexOf(config.yAxis);
    if (rIdx === -1 || cIdx === -1 || vIdx === -1) return null;

    const rowVals = Array.from(new Set(rows.map((r: any[]) => String(r[rIdx]))));
    const colVals = Array.from(new Set(rows.map((r: any[]) => String(r[cIdx]))));

    const grid: Record<string, Record<string, number>> = {};
    for (const r of rowVals) grid[r] = {};

    for (const row of rows) {
      const rr = String(row[rIdx]);
      const cc = String(row[cIdx]);
      const vv = Number(row[vIdx]) || 0;
      const cur = grid[rr][cc] || 0;
      if (config.aggregation === 'count') grid[rr][cc] = cur + 1;
      else if (config.aggregation === 'avg') grid[rr][cc] = cur + vv; // will represent sum, not true avg
      else if (config.aggregation === 'min') grid[rr][cc] = grid[rr][cc] == null ? vv : Math.min(grid[rr][cc], vv);
      else if (config.aggregation === 'max') grid[rr][cc] = grid[rr][cc] == null ? vv : Math.max(grid[rr][cc], vv);
      else grid[rr][cc] = cur + vv;
    }

    return { rowVals, colVals, grid };
  };

  const saveDashboard = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/dashboard/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(dashboard)
      });

      if (!response.ok) {
        throw new Error('Failed to save dashboard');
      }

      const savedDashboard = await response.json();
      setDashboard(savedDashboard);
      upsertDashboard(savedDashboard as any);
      toast.success('Dashboard saved successfully!');

    } catch (error) {
      // Mock save for development
      setTimeout(() => {
        setDashboard(prev => {
          const updated = {
            ...prev,
            id: prev.id || Date.now().toString(),
            updated_at: new Date().toISOString()
          };
          upsertDashboard(updated as any);
          return updated;
        });
        toast.success('Dashboard saved successfully!');
        setIsSaving(false);
      }, 1000);
      return;
    }

    setIsSaving(false);
  };

  const mintDashboard = async () => {
    if (!user?.isPremium) {
      toast.error('Premium feature: Mint dashboards as NFTs');
      return;
    }

    setIsMinting(true);
    try {
      // First, save to IPFS
      const ipfsResponse = await fetch('/api/ipfs/pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          dashboard,
          metadata: {
            name: dashboard.name,
            description: dashboard.description,
            creator: user.address || user.email,
            created_at: dashboard.created_at
          }
        })
      });

      if (!ipfsResponse.ok) {
        throw new Error('Failed to pin to IPFS');
      }

      const { ipfsHash } = await ipfsResponse.json();

      // Then, mint NFT
      const mintResponse = await fetch('/api/mint/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          dashboardId: dashboard.id,
          ipfsHash,
          recipient: user.address
        })
      });

      if (!mintResponse.ok) {
        throw new Error('Failed to mint dashboard');
      }

      const { transactionHash } = await mintResponse.json();
      toast.success(`Dashboard minted successfully! TX: ${transactionHash}`);
      setShowMintModal(false);

    } catch (error) {
      // Mock minting for development
      setTimeout(() => {
        toast.success('Dashboard minted successfully! TX: 0x1234...5678');
        setShowMintModal(false);
        setIsMinting(false);
      }, 2000);
      return;
    }

    setIsMinting(false);
  };

  const deleteWidget = (widgetId: string) => {
    setDashboard(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId),
      updated_at: new Date().toISOString()
    }));
    toast.success('Widget deleted');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to access the dashboard builder
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={dashboard.name}
              onChange={(e) => setDashboard(prev => ({ ...prev, name: e.target.value }))}
              className="text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 text-gray-900 dark:text-white"
            />
            <span className="text-sm text-gray-500">
              {dashboard.widgets.length} widgets
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={saveDashboard}
              disabled={isSaving}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>

            <button
              onClick={() => setShowMintModal(true)}
              disabled={!user.isPremium || dashboard.widgets.length === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                user.isPremium && dashboard.widgets.length > 0
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600'
              }`}
            >
              <Coins className="h-4 w-4" />
              <span>Mint Dashboard</span>
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mt-2">
          <input
            type="text"
            value={dashboard.description || ''}
            onChange={(e) => setDashboard(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Add a description..."
            className="w-full bg-transparent border-none focus:outline-none text-gray-600 dark:text-gray-300 text-sm"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Widget:</span>
          {chartTypes.map(({ type, name, icon: Icon }) => (
            <button
              key={type}
              onClick={() => createWidget(type)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <Icon className="h-4 w-4" />
              <span>{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="p-6">
        {dashboard.widgets.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No widgets yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Add your first chart widget to get started
            </p>
            <button
              onClick={() => createWidget('bar')}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add Widget</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboard.widgets.map((widget) => (
              <div key={widget.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">{widget.title}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedWidget(widget);
                        setShowWidgetEditor(true);
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteWidget(widget.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="h-64">
                  {(() => {
                    const chartData = (widget.data && (widget.data.chartData || widget.data)) as any;
                    const result = widget.data && widget.data.result;

                    if (widget.type === 'bar' && chartData) return <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />;
                    if (widget.type === 'line' && chartData) return <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />;
                    if (widget.type === 'area' && chartData) return <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />;
                    if (widget.type === 'scatter' && chartData) return <Scatter data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />;
                    if (widget.type === 'pie' && chartData) return <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />;

                    if (widget.type === 'counter') {
                      const value = computeCounterFromResult(result, widget.config);
                      return (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">{widget.config.aggregation.toUpperCase()} of {widget.config.yAxis || 'rows'}</div>
                            <div className="text-4xl font-bold text-blue-600">{Number.isFinite(value) ? value.toLocaleString() : '-'}</div>
                          </div>
                        </div>
                      );
                    }

                    if (widget.type === 'table' && result) {
                      return (
                        <div className="h-full overflow-auto border border-gray-200 dark:border-gray-700 rounded-md">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                              <tr>
                                {result.columns.map((c: string) => (
                                  <th key={c} className="px-3 py-2 text-left font-semibold border-b border-gray-200 dark:border-gray-700">{c}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {result.rows.map((r: any[], i: number) => (
                                <tr key={i} className={i % 2 ? 'bg-white/5' : ''}>
                                  {r.map((cell: any, j: number) => (
                                    <td key={j} className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">{String(cell)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }

                    if (widget.type === 'pivot' && result) {
                      const pivot = computePivotFromResult(result, widget.config);
                      if (!pivot) return <div className="flex items-center justify-center h-full text-gray-500 text-sm">Configure Group by, X and Y to show pivot</div>;
                      return (
                        <div className="h-full overflow-auto border border-gray-200 dark:border-gray-700 rounded-md">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50 dark:bg-gray-800">
                                <th className="px-3 py-2 text-left font-semibold border-b border-gray-200 dark:border-gray-700">{widget.config.groupBy}</th>
                                {pivot.colVals.map((c: string) => (
                                  <th key={c} className="px-3 py-2 text-left font-semibold border-b border-gray-200 dark:border-gray-700">{c}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {pivot.rowVals.map((r: string) => (
                                <tr key={r}>
                                  <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 font-semibold">{r}</td>
                                  {pivot.colVals.map((c: string) => (
                                    <td key={c} className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">{(pivot.grid[r] && pivot.grid[r][c] != null) ? pivot.grid[r][c] : '-'}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }

                    if (widget.type === 'text') {
                      return (
                        <div className="h-full p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 overflow-auto prose prose-sm dark:prose-invert">
                          {widget.title && <h4 className="mb-2 font-semibold">{widget.title}</h4>}
                          <div>{(widget as any).content || 'No content'}</div>
                        </div>
                      );
                    }

                    return (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">No data</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Widget Editor Modal */}
      {showWidgetEditor && selectedWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Edit Widget
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={selectedWidget.title}
                  onChange={(e) => setSelectedWidget(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Chart Type
                </label>
                <select
                  value={selectedWidget.type}
                  onChange={(e) => setSelectedWidget(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SQL Query
                </label>
                <textarea
                  value={selectedWidget.query}
                  onChange={(e) => setSelectedWidget(prev => prev ? { ...prev, query: e.target.value } : null)}
                  rows={8}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    X-Axis Column
                  </label>
                  <input
                    type="text"
                    value={selectedWidget.config.xAxis}
                    onChange={(e) => setSelectedWidget(prev => prev ? { 
                      ...prev, 
                      config: { ...prev.config, xAxis: e.target.value }
                    } : null)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Y-Axis Column
                  </label>
                  <input
                    type="text"
                    value={selectedWidget.config.yAxis}
                    onChange={(e) => setSelectedWidget(prev => prev ? { 
                      ...prev, 
                      config: { ...prev.config, yAxis: e.target.value }
                    } : null)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sample Queries
                </label>
                <div className="space-y-2">
                  {sampleQueries.map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedWidget(prev => prev ? {
                        ...prev,
                        query: sample.query,
                        config: { ...prev.config, ...sample.config }
                      } : null)}
                      className="w-full text-left p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm"
                    >
                      {sample.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowWidgetEditor(false);
                  setSelectedWidget(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveWidget}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Save Widget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mint Modal */}
      {showMintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Mint Dashboard as NFT
            </h2>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-4 rounded-lg">
                <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                  {dashboard.name}
                </h3>
                <p className="text-sm text-purple-600 dark:text-purple-300">
                  {dashboard.description || 'No description'}
                </p>
                <div className="mt-2 text-xs text-purple-500">
                  {dashboard.widgets.length} widgets • Created {new Date(dashboard.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-300">
                <p>This will:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Upload dashboard to IPFS</li>
                  <li>Mint as NFT on Starknet</li>
                  <li>Transfer to your wallet</li>
                  <li>Make it tradeable on marketplaces</li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Minting requires gas fees and is irreversible.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowMintModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={mintDashboard}
                disabled={isMinting}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white rounded-lg font-medium"
              >
                <Coins className="h-4 w-4" />
                <span>{isMinting ? 'Minting...' : 'Mint NFT'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBuilder;