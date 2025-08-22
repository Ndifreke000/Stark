import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, BarChart3, LineChart, PieChart, Table } from 'lucide-react';
import { getQueryById } from '../services/queryStore';
import { createVisual, updateVisual, getVisualById, type VisualConfig, type ChartType } from '../services/visualStore';

const VisualConfig: React.FC = () => {
  const { queryId, visualId } = useParams<{ queryId: string; visualId?: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState<any>(null);
  const [visual, setVisual] = useState<Partial<VisualConfig>>({
    title: '',
    chartType: 'bar' as ChartType,
    xAxis: { field: '', label: '', type: 'category' },
    yAxis: { field: '', label: '', type: 'value' },
    groupBy: '',
    filters: {},
    colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00']
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (queryId) {
      const foundQuery = getQueryById(queryId);
      if (foundQuery) {
        setQuery(foundQuery);
      }
    }

    if (visualId) {
      const foundVisual = getVisualById(visualId);
      if (foundVisual) {
        setVisual(foundVisual);
        setIsEditing(true);
      }
    }
  }, [queryId, visualId]);

  const handleSave = () => {
    if (!queryId || !visual.title || !visual.chartType) return;

    if (isEditing && visualId) {
      updateVisual(visualId, visual as VisualConfig);
    } else {
      createVisual(queryId, visual.title, visual.chartType!, visual);
    }

    navigate('/dashboard');
  };

  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: BarChart3 },
    { id: 'line', name: 'Line Chart', icon: LineChart },
    { id: 'pie', name: 'Pie Chart', icon: PieChart },
    { id: 'table', name: 'Table', icon: Table }
  ];

  if (!query) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Query not found</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            The query you're trying to visualize doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white ml-4">
          {isEditing ? 'Edit Visualization' : 'Create Visualization'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Query Preview */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Query Preview</h3>
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            <p className="font-medium">{query.title}</p>
            <p className="mt-1">{query.description}</p>
          </div>
          
          {query.result && (
            <div className="text-xs">
              <p className="text-gray-500 dark:text-gray-400">
                {query.result.rows?.length || 0} rows, {query.result.columns?.length || 0} columns
              </p>
              {query.result.columns && (
                <div className="mt-2 space-y-1">
                  {query.result.columns.slice(0, 5).map((col: string) => (
                    <div key={col} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      {col}
                    </div>
                  ))}
                  {query.result.columns.length > 5 && (
                    <div className="text-gray-400">+{query.result.columns.length - 5} more</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Configuration Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={visual.title}
                  onChange={(e) => setVisual({ ...visual, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter visualization title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={visual.description || ''}
                  onChange={(e) => setVisual({ ...visual, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter description (optional)"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Chart Type */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Chart Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {chartTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setVisual({ ...visual, chartType: type.id as ChartType })}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      visual.chartType === type.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">{type.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Axis Configuration */}
          {visual.chartType && visual.chartType !== 'table' && query.result?.columns && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Axis Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    X-Axis
                  </label>
                  <select
                    value={visual.xAxis?.field || ''}
                    onChange={(e) => setVisual({
                      ...visual,
                      xAxis: { ...visual.xAxis, field: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select field</option>
                    {query.result.columns.map((col: string) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Y-Axis
                  </label>
                  <select
                    value={visual.yAxis?.field || ''}
                    onChange={(e) => setVisual({
                      ...visual,
                      yAxis: { ...visual.yAxis, field: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select field</option>
                    {query.result.columns.map((col: string) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={!visual.title || !visual.chartType}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{isEditing ? 'Update Visualization' : 'Create Visualization'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualConfig;
