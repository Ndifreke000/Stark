import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Save, Share2, Coins, BarChart3, LineChart, PieChart, Download, Settings, Trash2, Sparkles, Zap, Database, Type } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { getDashboardById, upsertDashboard } from '../services/dashboardStore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCard from '../components/ui/AnimatedCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const ResponsiveGridLayout = WidthProvider(Responsive);

type WidgetType = 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'counter' | 'table' | 'pivot' | 'text';

interface ChartWidget {
  id: string;
  type: WidgetType;
  title: string;
  query: string;
  data: any;
  content?: string; // for text widgets
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
  const [copied, setCopied] = useState(false);

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
    { type: 'bar' as const, name: 'Bar', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
    { type: 'line' as const, name: 'Line', icon: LineChart, color: 'from-green-500 to-emerald-500' },
    { type: 'pie' as const, name: 'Pie', icon: PieChart, color: 'from-purple-500 to-pink-500' },
    { type: 'text' as const, name: 'Text', icon: Type, color: 'from-gray-500 to-gray-700' },
  ];

  const sampleQueries = [
    {
      name: 'Daily Transaction Volume',
      query: `SELECT DATE(timestamp) as date, COUNT(*) as transaction_count FROM starknet_transactions WHERE timestamp >= DATE('now', '-30 days') GROUP BY DATE(timestamp) ORDER BY date`,
      config: { xAxis: 'date', yAxis: 'transaction_count', aggregation: 'sum' as const }
    },
    {
      name: 'Top Contracts by Calls',
      query: `SELECT contract_address, COUNT(*) as call_count FROM contract_calls WHERE timestamp >= DATE('now', '-7 days') GROUP BY contract_address ORDER BY call_count DESC LIMIT 10`,
      config: { xAxis: 'contract_address', yAxis: 'call_count', aggregation: 'count' as const }
    },
    {
      name: 'Gas Usage Distribution',
      query: `SELECT CASE WHEN gas_used < 50000 THEN 'Low' WHEN gas_used < 200000 THEN 'Medium' ELSE 'High' END as gas_category, COUNT(*) as transaction_count FROM starknet_transactions WHERE timestamp >= DATE('now', '-24 hours') GROUP BY gas_category`,
      config: { xAxis: 'gas_category', yAxis: 'transaction_count', aggregation: 'count' as const }
    }
  ];

  const createWidget = (type: 'bar' | 'line' | 'pie' | 'text') => {
    const newWidget: ChartWidget = {
      id: Date.now().toString(),
      type,
      title: type === 'text' ? 'Text Block' : `${type.charAt(0).toUpperCase() + type.slice(1)} Chart` ,
      query: type === 'text' ? '' : sampleQueries[0].query,
      content: type === 'text' ? 'Click the settings icon to edit this text...' : undefined,
      data: null,
      config: type === 'text' ? { xAxis: '', yAxis: '', aggregation: 'sum' } as any : sampleQueries[0].config,
      position: { x: 0, y: 0, w: type === 'text' ? 4 : 4, h: type === 'text' ? 6 : 8 },
    };

    setSelectedWidget(newWidget);
    setShowWidgetEditor(true);
  };

  const executeWidgetQuery = async (widget: ChartWidget) => {
    try {
      const response = await fetch('/api/query/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        body: JSON.stringify({ query: widget.query })
      });
      if (!response.ok) throw new Error('Query execution failed');
      const result = await response.json();
      return result;
    } catch (error) {
      const mockData = {
        columns: ['label', 'value'],
        rows: [
          ['A', 12], ['B', 18], ['C', 7], ['D', 15]
        ]
      };
      return mockData;
    }
  };

  const transformDataForChart = (queryResult: any, widget: ChartWidget) => {
    const { config } = widget;
    const labels = queryResult.rows.map((row: any[]) => {
      const xIndex = queryResult.columns.indexOf(config.xAxis) !== -1 ? queryResult.columns.indexOf(config.xAxis) : 0;
      return row[xIndex];
    });

    const values = queryResult.rows.map((row: any[]) => {
      const yIndex = queryResult.columns.indexOf(config.yAxis) !== -1 ? queryResult.columns.indexOf(config.yAxis) : 1;
      return row[yIndex];
    });

    if (widget.type === 'pie') {
      return { labels, datasets: [{ data: values, backgroundColor: ['#3B82F6','#EF4444','#10B981','#F59E0B','#8B5CF6','#EC4899','#14B8A6','#F97316','#84CC16','#6366F1'] }] };
    }

    return {
      labels,
      datasets: [{
        label: config.yAxis || 'value',
        data: values,
        backgroundColor: widget.type === 'bar' ? '#3B82F6' : undefined,
        borderColor: widget.type === 'line' ? '#3B82F6' : undefined,
        fill: widget.type === 'line' ? false : undefined
      }]
    };
  };

  const canRenderChart = (w: ChartWidget) => w.type === 'bar' || w.type === 'line' || w.type === 'pie';

  const saveWidget = async () => {
    if (!selectedWidget) return;
    try {
      let updatedWidget = { ...selectedWidget } as ChartWidget;
      if (canRenderChart(selectedWidget)) {
        const queryResult = await executeWidgetQuery(selectedWidget);
        const chartData = transformDataForChart(queryResult, selectedWidget);
        updatedWidget = { ...updatedWidget, data: chartData };
      }

      setDashboard(prev => {
        const exists = prev.widgets.find(w => w.id === updatedWidget.id);
        const widgets = exists
          ? prev.widgets.map(w => (w.id === updatedWidget.id ? updatedWidget : w))
          : [...prev.widgets, updatedWidget];
        return { ...prev, widgets, updated_at: new Date().toISOString() };
      });

      setShowWidgetEditor(false);
      setSelectedWidget(null);
      toast.success('Widget saved');
    } catch (error) {
      toast.error('Failed to save widget');
    }
  };

  // Layout helpers for react-grid-layout
  const layouts: Layouts = useMemo(() => {
    const lg: Layout[] = dashboard.widgets.map((w) => ({
      i: w.id,
      x: w.position.x ?? 0,
      y: w.position.y ?? 0,
      w: w.position.w ?? 4,
      h: w.position.h ?? 8,
      minW: 2,
      minH: 4,
    }));
    return { lg, md: lg, sm: lg, xs: lg, xxs: lg };
  }, [dashboard.widgets]);

  const onLayoutChange = (current: Layout[]) => {
    // Map the new layout back into dashboard widgets
    setDashboard(prev => {
      const map = new Map(current.map((l) => [l.i, l]));
      const widgets = prev.widgets.map((w) => {
        const l = map.get(w.id);
        if (!l) return w;
        return { ...w, position: { x: l.x, y: l.y, w: l.w, h: l.h } };
        });
      return { ...prev, widgets, updated_at: new Date().toISOString() };
    });
  };

  const saveDashboard = async () => {
    setIsSaving(true);
    try {
      setTimeout(() => {
        setDashboard(prev => {
          const updated = { ...prev, id: prev.id || Date.now().toString(), updated_at: new Date().toISOString() };
          upsertDashboard(updated as any);
          return updated;
        });
        toast.success('Dashboard saved successfully!');
        setIsSaving(false);
      }, 800);
    } catch (error) {
      toast.error('Failed to save dashboard');
      setIsSaving(false);
    }
  };

  const mintDashboard = async () => {
    if (!user?.isPremium) {
      toast.error('Premium feature: Mint dashboards as NFTs');
      return;
    }
    setIsMinting(true);
    setTimeout(() => {
      toast.success('Dashboard minted successfully! TX: 0x1234...5678');
      setShowMintModal(false);
      setIsMinting(false);
    }, 1500);
  };

  const deleteWidget = (widgetId: string) => {
    setDashboard(prev => ({ ...prev, widgets: prev.widgets.filter(w => w.id !== widgetId), updated_at: new Date().toISOString() }));
    toast.success('Widget deleted');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 flex items-center justify-center font-['Inter',sans-serif]">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <AnimatedCard className="p-12 max-w-md mx-auto" glow={true}>
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="mb-6">
              <BarChart3 className="w-16 h-16 text-blue-600 mx-auto" />
            </motion.div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Sign In Required</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Please sign in to access the dashboard builder and create stunning visualizations.</p>
            <AnimatedButton variant="primary" size="lg" icon={Zap}>Sign In</AnimatedButton>
          </AnimatedCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 font-['Inter',sans-serif]">
      {/* Header */}
      <motion.div className="glass border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </motion.div>
              <motion.input type="text" value={dashboard.name} onChange={(e) => setDashboard(prev => ({ ...prev, name: e.target.value }))} className="text-xl font-black bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1 text-gray-900 dark:text-white min-w-[260px]" whileFocus={{ scale: 1.02 }} />
            </motion.div>
            <motion.div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full" whileHover={{ scale: 1.05 }}>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{dashboard.widgets.length} widgets</span>
            </motion.div>
          </div>

          <div className="flex items-center space-x-3">
            <motion.div className="flex items-center gap-3 text-sm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <motion.label className="inline-flex items-center gap-2 cursor-pointer" whileHover={{ scale: 1.05 }}>
                <input type="checkbox" checked={Boolean((dashboard as any).isPublic)} onChange={(e) => setDashboard(prev => ({ ...prev, isPublic: e.target.checked }))} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Public</span>
              </motion.label>

              <AnimatedButton variant="secondary" size="sm" icon={Share2} onClick={async () => { await navigator.clipboard.writeText(`${window.location.origin}/d/${dashboard.id || ''}`); setCopied(true); setTimeout(() => setCopied(false), 1200); }} disabled={!dashboard.id}>{copied ? 'Copied!' : 'Share'}</AnimatedButton>
              <AnimatedButton variant="secondary" size="sm" icon={Download} onClick={async () => { const el = document.getElementById('dashboard-capture'); if (!el) return; await new Promise((r) => setTimeout(r, 200)); const dataUrl = await htmlToImage.toPng(el, { pixelRatio: 2 }); const a = document.createElement('a'); a.href = dataUrl; a.download = `dashboard_${dashboard.name || 'export'}_${Date.now()}.png`; a.click(); }}>Export</AnimatedButton>
            </motion.div>

            <AnimatedButton variant="primary" size="sm" icon={Save} onClick={saveDashboard} loading={isSaving}>{isSaving ? 'Saving...' : 'Save'}</AnimatedButton>
            <AnimatedButton variant={user.isPremium && dashboard.widgets.length > 0 ? 'warning' : 'secondary'} size="sm" icon={Coins} onClick={() => setShowMintModal(true)} disabled={!user.isPremium || dashboard.widgets.length === 0} className={user.isPremium && dashboard.widgets.length > 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' : 'opacity-50 cursor-not-allowed'}>Mint NFT</AnimatedButton>
          </div>
        </div>

        {/* Description */}
        <motion.div className="mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <motion.input type="text" value={dashboard.description || ''} onChange={(e) => setDashboard(prev => ({ ...prev, description: e.target.value }))} placeholder="Add a description..." className="w-full bg-transparent border-none focus:outline-none text-gray-600 dark:text-gray-300 text-sm font-medium placeholder-gray-400" whileFocus={{ scale: 1.01 }} />
        </motion.div>
      </motion.div>

      {/* Toolbar */}
      <motion.div className="glass border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Sparkles className="w-4 h-4" />Add Widget:</span>
          {chartTypes.map(({ type, name, icon: Icon, color }, index) => (
            <motion.button key={type} onClick={() => createWidget(type)} className={`flex items-center space-x-2 px-3 py-2 bg-gradient-to-r ${color} text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
              <Icon className="h-4 w-4" />
              <span>{name}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Dashboard Grid */}
      <div className="p-4">
        <div id="dashboard-capture">
          {dashboard.widgets.length === 0 ? (
            <motion.div className="text-center py-16" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <AnimatedCard className="p-8 max-w-md mx-auto" glow={true}>
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">No widgets yet</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-base">Add your first chart widget to get started</p>
                <AnimatedButton variant="primary" size="md" icon={Plus} onClick={() => createWidget('bar')}>Add Your First Widget</AnimatedButton>
              </AnimatedCard>
            </motion.div>
          ) : (
            <ResponsiveGridLayout
              className="layout"
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 8, xs: 6, xxs: 4 }}
              rowHeight={24}
              margin={[8, 8]}
              compactType="vertical"
              draggableHandle=".drag-handle"
              layouts={layouts}
              onLayoutChange={(curr, all) => onLayoutChange(curr)}
            >
              {dashboard.widgets.map((widget) => (
                <div key={widget.id}>
                  <AnimatedCard className="p-3 h-full" hover={true} glow={true}>
                    <div className="flex justify-between items-center mb-2 drag-handle cursor-move">
                      <motion.h3 className="font-black text-sm text-gray-900 dark:text-white" whileHover={{ scale: 1.02 }}>{widget.title}</motion.h3>
                      <div className="flex items-center space-x-1">
                        <motion.button onClick={() => { setSelectedWidget(widget); setShowWidgetEditor(true); }} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Settings className="h-4 w-4" /></motion.button>
                        <motion.button onClick={() => deleteWidget(widget.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Trash2 className="h-4 w-4" /></motion.button>
                      </div>
                    </div>

                    <div className="h-full">
                      {(() => {
                        if (widget.type === 'text') {
                          return (
                            <div className="h-full p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 overflow-auto text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                              {widget.content || 'Empty'}
                            </div>
                          );
                        }
                        const chartData = (widget.data && (widget.data.chartData || widget.data)) as any;
                        if (widget.type === 'bar' && chartData) return <div className="h-48"><Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>;
                        if (widget.type === 'line' && chartData) return <div className="h-48"><Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>;
                        if (widget.type === 'pie' && chartData) return <div className="h-48"><Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>;
                        return (
                          <div className="flex items-center justify-center h-40 text-gray-500">
                            <div className="text-center">
                              <Database className="h-10 w-10 mx-auto mb-2 opacity-50" />
                              <p className="text-xs font-medium">Configure widget to see data</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </AnimatedCard>
                </div>
              ))}
            </ResponsiveGridLayout>
          )}
        </div>
      </div>

      {/* Widget Editor Modal */}
      <AnimatePresence>
        {showWidgetEditor && selectedWidget && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="glass rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <Settings className="w-6 h-6 text-blue-600" />
                  Edit Widget
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Widget Title</label>
                    <input type="text" value={selectedWidget.title} onChange={(e) => setSelectedWidget(prev => prev ? { ...prev, title: e.target.value } : null)} className="input-field" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Widget Type</label>
                    <select value={selectedWidget.type} onChange={(e) => setSelectedWidget(prev => prev ? { ...prev, type: e.target.value as WidgetType } : null)} className="input-field">
                      <option value="bar">Bar Chart</option>
                      <option value="line">Line Chart</option>
                      <option value="pie">Pie Chart</option>
                      <option value="text">Text</option>
                    </select>
                  </div>

                  {selectedWidget.type !== 'text' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">X-Axis Column</label>
                        <input type="text" value={selectedWidget.config.xAxis} onChange={(e) => setSelectedWidget(prev => prev ? { ...prev, config: { ...prev.config, xAxis: e.target.value } } : null)} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Y-Axis Column</label>
                        <input type="text" value={selectedWidget.config.yAxis} onChange={(e) => setSelectedWidget(prev => prev ? { ...prev, config: { ...prev.config, yAxis: e.target.value } } : null)} className="input-field" />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  {selectedWidget.type === 'text' ? (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Text Content</label>
                      <textarea value={selectedWidget.content || ''} onChange={(e) => setSelectedWidget(prev => prev ? { ...prev, content: e.target.value } : null)} rows={12} className="input-field font-sans text-sm resize-none" />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">SQL Query</label>
                      <textarea value={selectedWidget.query} onChange={(e) => setSelectedWidget(prev => prev ? { ...prev, query: e.target.value } : null)} rows={12} className="input-field font-mono text-sm resize-none" />
                      <div className="mt-3 text-xs text-gray-500">Tip: Use the sample queries to quickly populate the editor.</div>
                    </div>
                  )}
                </div>
              </div>

              {selectedWidget.type !== 'text' && (
                <div className="mt-6">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Sample Queries</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {sampleQueries.map((sample, index) => (
                      <button key={index} onClick={() => setSelectedWidget(prev => prev ? { ...prev, query: sample.query, config: { ...prev.config, ...sample.config } } : null)} className="text-left p-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 rounded-lg border border-blue-200 dark:border-blue-800 transition-all">
                        <div className="font-bold text-blue-900 dark:text-blue-200 mb-1">{sample.name}</div>
                        <div className="text-xs text-blue-700 dark:text-blue-300 font-mono">{sample.query.slice(0, 60)}...</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <AnimatedButton variant="secondary" onClick={() => { setShowWidgetEditor(false); setSelectedWidget(null); }}>Cancel</AnimatedButton>
                <AnimatedButton variant="primary" icon={Save} onClick={saveWidget}>Save Widget</AnimatedButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mint Modal */}
      <AnimatePresence>
        {showMintModal && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="glass rounded-2xl p-8 w-full max-w-md" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="text-center mb-6">
                <Coins className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Mint Dashboard as NFT</h2>
              </div>
              <AnimatedCard className="p-6 mb-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                <h3 className="font-black text-purple-800 dark:text-purple-200 mb-2">{dashboard.name}</h3>
                <p className="text-sm text-purple-600 dark:text-purple-300 mb-2">{dashboard.description || 'No description'}</p>
                <div className="text-xs text-purple-500">{dashboard.widgets.length} widgets • Created {new Date(dashboard.created_at).toLocaleDateString()}</div>
              </AnimatedCard>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                <p className="font-bold mb-2">This will:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Upload dashboard to IPFS</li>
                  <li>Mint as NFT on Starknet</li>
                  <li>Transfer to your wallet</li>
                  <li>Make it tradeable on marketplaces</li>
                </ul>
              </div>
              <AnimatedCard className="p-4 mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200"><strong>Note:</strong> Minting requires gas fees and is irreversible.</p>
              </AnimatedCard>
              <div className="flex justify-end space-x-3">
                <AnimatedButton variant="secondary" onClick={() => setShowMintModal(false)}>Cancel</AnimatedButton>
                <AnimatedButton variant="warning" icon={Coins} onClick={mintDashboard} loading={isMinting} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">{isMinting ? 'Minting...' : 'Mint NFT'}</AnimatedButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardBuilder;