export type ChartType = 'bar' | 'line' | 'area' | 'scatter' | 'pie' | 'counter' | 'table' | 'pivot';

export interface AxisConfig {
  field: string;
  label?: string;
  type?: 'category' | 'value' | 'time';
}

export interface VisualConfig {
  id: string;
  queryId: string;
  title: string;
  description?: string;
  chartType: ChartType;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  groupBy?: string;
  filters?: Record<string, any>;
  colors?: string[];
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
}

const STORAGE_KEY = 'starklytics_visuals';

function read(): VisualConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to read visuals from storage', e);
    return [];
  }
}

function write(visuals: VisualConfig[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visuals));
  } catch (e) {
    console.warn('Failed to write visuals to storage', e);
  }
}

export function getVisuals(): VisualConfig[] {
  return read();
}

export function getVisualById(id: string): VisualConfig | undefined {
  return read().find((v) => v.id === id);
}

export function getVisualsByQueryId(queryId: string): VisualConfig[] {
  return read().filter((v) => v.queryId === queryId);
}

export function createVisual(
  queryId: string,
  title: string,
  chartType: ChartType,
  config: Partial<VisualConfig> = {}
): VisualConfig {
  const visuals = read();
  const now = new Date().toISOString();
  const visual: VisualConfig = {
    id: Date.now().toString(),
    queryId,
    title,
    chartType,
    createdAt: now,
    updatedAt: now,
    isPublic: false,
    ...config
  };
  visuals.unshift(visual);
  write(visuals);
  return visual;
}

export function updateVisual(id: string, updates: Partial<VisualConfig>): VisualConfig | undefined {
  const visuals = read();
  const visual = visuals.find((v) => v.id === id);
  if (!visual) return undefined;

  Object.assign(visual, updates);
  visual.updatedAt = new Date().toISOString();
  write(visuals);
  return visual;
}

export function deleteVisual(id: string): boolean {
  const visuals = read();
  const index = visuals.findIndex((v) => v.id === id);
  if (index === -1) return false;

  visuals.splice(index, 1);
  write(visuals);
  return true;
}

export function searchVisuals(searchTerm: string): VisualConfig[] {
  const visuals = read();
  if (!searchTerm) return visuals;

  const term = searchTerm.toLowerCase();
  return visuals.filter((visual) => 
    visual.title.toLowerCase().includes(term) ||
    visual.description?.toLowerCase().includes(term)
  );
}

export function getVisualsForDashboard(dashboardId: string): VisualConfig[] {
  // This would typically query a relationship table
  // For now, return all visuals and let the dashboard filter them
  return read();
}
