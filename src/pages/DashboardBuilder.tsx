import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { getVisuals, getVisualById, deleteVisual } from '../services/visualStore';
import { getQueries, getQueryById } from '../services/queryStore';
import { getDashboards, createDashboard, addWidget } from '../services/dashboardStore';

const DashboardBuilder: React.FC = () => {
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [visuals, setVisuals] = useState<any[]>([]);
  const [queries, setQueries] = useState<any[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchedDashboards = getDashboards();
    setDashboards(fetchedDashboards);
    
    const fetchedVisuals = getVisuals();
    setVisuals(fetchedVisuals);
    
    const fetchedQueries = getQueries();
    setQueries(fetchedQueries);
  }, []);

  const handleCreateDashboard = () => {
    const newDashboard = createDashboard('New Dashboard', 'A new dashboard for your visualizations');
    setDashboards([...dashboards, newDashboard]);
    setSelectedDashboard(newDashboard);
    setIsEditing(true);
  };

  const handleAddVisual = (visualId: string) => {
    if (!selectedDashboard) return;
    
    const visual = getVisualById(visualId);
    if (!visual) return;

    const query = getQueryById(visual.queryId);
    if (!query) return;

    const widget = {
      id: visual.id,
      type: visual.chartType,
      title: visual.title,
      query: query.sql,
      data: query.result,
      config: {
        xAxis: visual.xAxis,
        yAxis: visual.yAxis,
        groupBy: visual.groupBy
      }
    };

    addWidget(selectedDashboard.id, widget);
    // Refresh the dashboard
    const updatedDashboards = getDashboards();
    setDashboards(updatedDashboards);
    setSelectedDashboard(updatedDashboards.find(d => d.id === selectedDashboard.id));
  };

  const handleDeleteVisual = (visualId: string) => {
    deleteVisual(visualId);
    setVisuals(getVisuals());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Builder</h1>
        <button
          onClick={handleCreateDashboard}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Dashboard</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Available Visuals */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Available Visuals</h3>
          <div className="space-y-2">
            {visuals.map((visual) => (
              <div key={visual.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm">{visual.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{visual.chartType}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleAddVisual(visual.id)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Add to dashboard"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteVisual(visual.id)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Delete visual"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {visuals.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No visuals created yet. <Link to="/query-editor" className="text-blue-600 hover:underline">Create a query</Link> first.
              </p>
            )}
          </div>
        </div>

        {/* Dashboard Canvas */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {selectedDashboard ? selectedDashboard.name : 'Select a Dashboard'}
            </h3>
            {selectedDashboard && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                >
                  {isEditing ? <Eye className="h-3 w-3" /> : <Edit className="h-3 w-3" />}
                  <span>{isEditing ? 'View' : 'Edit'}</span>
                </button>
              </div>
            )}
          </div>

          {!selectedDashboard ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Select or create a dashboard to get started</p>
            </div>
          ) : selectedDashboard.widgets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Drag visuals from the sidebar to build your dashboard</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDashboard.widgets.map((widget: any) => (
                <div key={widget.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{widget.title}</h4>
                  <div className="text-sm text-gray-500">
                    {widget.type} chart - {widget.data?.rows?.length || 0} data points
                  </div>
                  {/* Render actual chart component here based on widget.type */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardBuilder;
