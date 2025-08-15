import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Image as ImageIcon, Copy, Check, GitFork } from 'lucide-react';
import { getDashboardById, upsertDashboard } from '../services/dashboardStore';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import * as htmlToImage from 'html-to-image';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const PublicDashboardView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const d = getDashboardById(id);
    setDashboard(d);
  }, [id]);

  const shareUrl = useMemo(() => `${window.location.origin}/d/${id}`, [id]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const exportPng = async () => {
    if (!containerRef.current) return;
    setExporting(true);
    try {
      // Ensure charts finished rendering
      await new Promise((r) => setTimeout(r, 200));
      const dataUrl = await htmlToImage.toPng(containerRef.current, { pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `dashboard_${dashboard?.name || id}_${Date.now()}.png`;
      a.click();
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setExporting(false);
    }
  };

  const forkDashboard = () => {
    if (!dashboard) return;
    const fork = {
      ...dashboard,
      id: `fork_${Date.now()}`,
      name: `${dashboard.name} (fork)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    upsertDashboard(fork);
    navigate(`/dashboard?dashId=${fork.id}`);
  };

  if (!dashboard) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-600 dark:text-gray-300">
        Dashboard not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboard.name}</h1>
            {dashboard.description && (
              <div className="text-gray-600 dark:text-gray-300 text-sm">{dashboard.description}</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyLink} className="px-3 py-1.5 border rounded-md bg-white dark:bg-gray-800">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <button onClick={exportPng} disabled={exporting} className="px-3 py-1.5 border rounded-md bg-white dark:bg-gray-800 disabled:opacity-50">
              <ImageIcon className="w-4 h-4" />
            </button>
            <button onClick={forkDashboard} className="px-3 py-1.5 border rounded-md bg-white dark:bg-gray-800">
              <GitFork className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div id="dashboard-capture" ref={containerRef} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboard.widgets.map((widget: any) => (
              <div key={widget.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="font-medium text-gray-900 dark:text-white mb-2">{widget.title}</div>
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
                      const val = result ? (result.rows.length) : (widget.value || 0);
                      return (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-4xl font-bold text-blue-600">{val}</div>
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
                      // Minimal pivot render; reuse if present in data
                      const pivot = (widget.data && widget.data.pivot) || null;
                      if (!pivot) return <div className="flex items-center justify-center h-full text-gray-500 text-sm">No pivot data</div>;
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
                          {widget.content || 'No content'}
                        </div>
                      );
                    }

                    return (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No data
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicDashboardView;
