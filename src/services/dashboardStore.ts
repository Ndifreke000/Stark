export type WidgetType = 'bar' | 'line' | 'area' | 'scatter' | 'pie' | 'counter' | 'table' | 'pivot' | 'text';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title?: string;
  query?: string;
  data?: any;
  config?: any;
  position?: { x: number; y: number; w: number; h: number };
  content?: string; // for text widgets
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  isPublic?: boolean;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'starklytics_dashboards';

function read(): Dashboard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to read dashboards from storage', e);
    return [];
  }
}

function write(dashboards: Dashboard[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
  } catch (e) {
    console.warn('Failed to write dashboards to storage', e);
  }
}

export function getDashboards(): Dashboard[] {
  return read();
}

export function getDashboardById(id: string): Dashboard | undefined {
  return read().find((d) => d.id === id);
}

export function createDashboard(name: string, description = ''): Dashboard {
  const dashboards = read();
  const now = new Date().toISOString();
  const dash: Dashboard = {
    id: Date.now().toString(),
    name,
    description,
    widgets: [],
    isPublic: false,
    created_at: now,
    updated_at: now,
  };
  dashboards.unshift(dash);
  write(dashboards);
  return dash;
}

export function upsertDashboard(d: Dashboard) {
  const dashboards = read();
  const idx = dashboards.findIndex((x) => x.id === d.id);
  if (idx >= 0) dashboards[idx] = d;
  else dashboards.unshift(d);
  d.updated_at = new Date().toISOString();
  write(dashboards);
}

export function addWidget(dashboardId: string, widget: DashboardWidget): Dashboard | undefined {
  const dashboards = read();
  const idx = dashboards.findIndex((d) => d.id === dashboardId);
  if (idx === -1) return undefined;
  dashboards[idx].widgets.push({ ...widget, id: widget.id || `${Date.now()}_${Math.random().toString(36).slice(2, 6)}` });
  dashboards[idx].updated_at = new Date().toISOString();
  write(dashboards);
  return dashboards[idx];
}
