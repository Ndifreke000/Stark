import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { getVisuals, deleteVisual } from '../services/visualStore';
import { getDashboards, createDashboard, addWidget } from '../services/dashboardStore';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedCard from '../components/ui/AnimatedCard';

const DashboardBuilder: React.FC = () => {
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [visuals, setVisuals] = useState<any[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<any>(null);

  useEffect(() => {
    setDashboards(getDashboards());
    setVisuals(getVisuals());
  }, []);

  const handleCreateDashboard = () => {
    const newDashboard = createDashboard('New Dashboard', 'A new dashboard');
    setDashboards([...dashboards, newDashboard]);
    setSelectedDashboard(newDashboard);
  };

  const handleAddVisual = (visualId: string) => {
    if (!selectedDashboard) return;
    // Simplified logic for adding a widget
    const visual = visuals.find(v => v.id === visualId);
    if (visual) {
      addWidget(selectedDashboard.id, { ...visual, id: Date.now().toString() });
      const updatedDashboards = getDashboards();
      setDashboards(updatedDashboards);
      setSelectedDashboard(updatedDashboards.find(d => d.id === selectedDashboard.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Builder</h1>
            <AnimatedButton onClick={handleCreateDashboard} icon={Plus}>
              New Dashboard
            </AnimatedButton>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <AnimatedCard className="p-4">
              <h3 className="font-semibold mb-3">Contract EDA</h3>
              <div className="space-y-2">
                <input type="text" placeholder="Enter contract address" className="w-full p-2 border rounded-lg" />
                <AnimatedButton className="w-full">Fetch EDA</AnimatedButton>
              </div>
            </AnimatedCard>
            <AnimatedCard className="p-4">
              <h3 className="font-semibold mb-3">Available Visuals</h3>
              <div className="space-y-2">
                {visuals.map((visual) => (
                  <div key={visual.id} className="p-3 border rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{visual.title}</p>
                      <p className="text-xs text-gray-500">{visual.chartType}</p>
                    </div>
                    <AnimatedButton size="sm" onClick={() => handleAddVisual(visual.id)}>+</AnimatedButton>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          </div>
          <div className="lg:col-span-3">
            <AnimatedCard className="p-4 min-h-[60vh]">
              <h3 className="font-semibold mb-3">{selectedDashboard ? selectedDashboard.name : 'Select a Dashboard'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDashboard?.widgets.map((widget: any) => (
                  <AnimatedCard key={widget.id} className="p-4">
                    <h4 className="font-semibold mb-2">{widget.title}</h4>
                    {/* Placeholder for chart */}
                    <div className="bg-gray-100 dark:bg-gray-800 h-40 rounded-lg flex items-center justify-center">
                      <p className="text-sm text-gray-500">{widget.type} chart</p>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </AnimatedCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardBuilder;
