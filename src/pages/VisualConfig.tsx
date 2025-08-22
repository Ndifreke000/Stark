import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, BarChart3, LineChart, PieChart, Table } from 'lucide-react';
import { getQueryById } from '../services/queryStore';
import { createVisual, updateVisual, getVisualById, type VisualConfig, type ChartType } from '../services/visualStore';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedCard from '../components/ui/AnimatedCard';
import AnimatedInput from '../components/ui/AnimatedInput';

const VisualConfig: React.FC = () => {
  const { queryId, visualId } = useParams<{ queryId: string; visualId?: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState<any>(null);
  const [visual, setVisual] = useState<Partial<VisualConfig>>({
    title: '',
    chartType: 'bar' as ChartType,
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (queryId) setQuery(getQueryById(queryId));
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

  if (!query) return <div className="text-center py-12"><h2>Query not found</h2></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <AnimatedButton variant="secondary" onClick={() => navigate(-1)} icon={ArrowLeft}>Back</AnimatedButton>
            <h1 className="text-2xl font-bold tracking-tight">{isEditing ? 'Edit Visualization' : 'Create Visualization'}</h1>
            <AnimatedButton onClick={handleSave} icon={Save} disabled={!visual.title || !visual.chartType}>
              {isEditing ? 'Update' : 'Create'}
            </AnimatedButton>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <AnimatedCard className="p-4">
              <h3 className="font-semibold mb-3">Query Preview</h3>
              <p className="font-medium">{query.title}</p>
              <p className="text-sm text-gray-500">{query.result?.rows?.length || 0} rows</p>
            </AnimatedCard>
          </div>
          <div className="lg:col-span-2 space-y-8">
            <AnimatedCard className="p-6">
              <AnimatedInput
                label="Title"
                value={visual.title}
                onChange={(e) => setVisual({ ...visual, title: e.target.value })}
                placeholder="Enter visualization title"
              />
            </AnimatedCard>
            <AnimatedCard className="p-6">
              <h3 className="font-semibold mb-3">Chart Type</h3>
              {/* Simplified chart type selector */}
              <select
                value={visual.chartType}
                onChange={(e) => setVisual({ ...visual, chartType: e.target.value as ChartType })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="table">Table</option>
              </select>
            </AnimatedCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VisualConfig;
