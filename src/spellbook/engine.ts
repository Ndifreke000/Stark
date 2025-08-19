// Spellbook: Local dbt-style metrics engine (no DB)
// - Raw sample data per chain
// - Base/source layer -> metrics/daily -> cross-chain views
// - Standardized metrics format
// - Simple query executor to mimic MVP behavior

export type Chain = 'starknet' | 'ethereum';
export type MetricType = 'transactions' | 'transfers' | 'gas_fees' | 'dex_pools';

export interface DailyMetricRow {
  blockchain: Chain;
  block_date: string; // YYYY-MM-DD
  project?: string;
  version?: string;
  metric_type: string; // 'volume' | 'fees' | 'tvl' | 'users' | etc.
  metric_value: number;
  metric_currency?: string; // 'USD' | 'ETH'
}

// ------------------------------
// 1) RAW SAMPLE DATA (BASE SOURCES)
// ------------------------------

// Minimal raw transactions for demo purposes
const rawTransactions: Array<{ chain: Chain; timestamp: string; tx_hash: string; gas_fee_usd: number }> = [
  { chain: 'starknet', timestamp: '2024-01-15T10:00:00Z', tx_hash: '0xsn1', gas_fee_usd: 1.2 },
  { chain: 'starknet', timestamp: '2024-01-15T13:00:00Z', tx_hash: '0xsn2', gas_fee_usd: 0.9 },
  { chain: 'starknet', timestamp: '2024-01-16T09:00:00Z', tx_hash: '0xsn3', gas_fee_usd: 1.1 },
  { chain: 'ethereum', timestamp: '2024-01-15T08:00:00Z', tx_hash: '0xeth1', gas_fee_usd: 3.2 },
  { chain: 'ethereum', timestamp: '2024-01-16T11:30:00Z', tx_hash: '0xeth2', gas_fee_usd: 2.8 },
];

// Minimal raw transfers (token movements)
const rawTransfers: Array<{ chain: Chain; timestamp: string; token: string; amount_usd: number }> = [
  { chain: 'starknet', timestamp: '2024-01-15T12:30:00Z', token: 'USDC', amount_usd: 150 },
  { chain: 'starknet', timestamp: '2024-01-16T15:00:00Z', token: 'USDC', amount_usd: 90 },
  { chain: 'ethereum', timestamp: '2024-01-15T07:45:00Z', token: 'USDC', amount_usd: 1200 },
  { chain: 'ethereum', timestamp: '2024-01-16T14:10:00Z', token: 'USDC', amount_usd: 800 },
];

// Utility: date-only string
const toDate = (iso: string) => iso.slice(0, 10);

// GroupBy util
function groupBy<T, K extends string | number | symbol>(arr: T[], key: (item: T) => K): Record<K, T[]> {
  return arr.reduce((acc: any, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

// ------------------------------
// 2) METRICS GENERATION (MVP)
// ------------------------------

export function metricsTransactionsDaily(chain: Chain): DailyMetricRow[] {
  const filtered = rawTransactions.filter((t) => t.chain === chain);
  const byDay = groupBy(filtered, (t) => toDate(t.timestamp));
  const rows: DailyMetricRow[] = Object.entries(byDay).map(([date, items]) => ({
    blockchain: chain,
    block_date: date,
    metric_type: 'tx_count',
    metric_value: items.length,
  }));
  return rows.sort((a, b) => a.block_date.localeCompare(b.block_date));
}

export function metricsTransfersDaily(chain: Chain, minUsd = 1): DailyMetricRow[] {
  const filtered = rawTransfers.filter((t) => t.chain === chain && t.amount_usd >= minUsd);
  const byDay = groupBy(filtered, (t) => toDate(t.timestamp));
  const rows: DailyMetricRow[] = Object.entries(byDay).map(([date, items]) => ({
    blockchain: chain,
    block_date: date,
    metric_type: 'transfer_volume_usd',
    metric_value: items.reduce((sum, x) => sum + x.amount_usd, 0),
    metric_currency: 'USD',
  }));
  return rows.sort((a, b) => a.block_date.localeCompare(b.block_date));
}

export function metricsGasFeesDaily(chain: Chain): DailyMetricRow[] {
  const filtered = rawTransactions.filter((t) => t.chain === chain);
  const byDay = groupBy(filtered, (t) => toDate(t.timestamp));
  const rows: DailyMetricRow[] = Object.entries(byDay).map(([date, items]) => ({
    blockchain: chain,
    block_date: date,
    metric_type: 'gas_fees_usd',
    metric_value: items.reduce((sum, x) => sum + x.gas_fee_usd, 0),
    metric_currency: 'USD',
  }));
  return rows.sort((a, b) => a.block_date.localeCompare(b.block_date));
}

// Cross-chain aggregation
export function crossChainTransactionsDaily(chains: Chain[]): DailyMetricRow[] {
  return chains.flatMap((c) => metricsTransactionsDaily(c));
}

// ------------------------------
// 3) SIMPLE QUERY EXECUTOR (MVP)
// ------------------------------
// Not a full SQL parser; maps known patterns to metrics functions.

export interface QueryResult {
  columns: string[];
  rows: any[][];
}

export function executeQuery(query: string): QueryResult {
  const q = query.toLowerCase();

  // detect chain param in naive way
  const chainMatch = q.match(/blockchain\s*=\s*'([a-z0-9_\-]+)'/);
  const chain = (chainMatch?.[1] as Chain) || 'starknet';

  // transfers volume pattern
  if (q.includes('from') && q.includes('transfers')) {
    const data = metricsTransfersDaily(chain, 1);
    return {
      columns: ['blockchain', 'block_date', 'metric_type', 'metric_value', 'metric_currency'],
      rows: data.map((r) => [r.blockchain, r.block_date, r.metric_type, r.metric_value, r.metric_currency || null]),
    };
  }

  // transactions count pattern
  if (q.includes('transactions') || q.includes('tx_count')) {
    const data = metricsTransactionsDaily(chain);
    return {
      columns: ['blockchain', 'block_date', 'metric_type', 'metric_value'],
      rows: data.map((r) => [r.blockchain, r.block_date, r.metric_type, r.metric_value]),
    };
  }

  // gas fees pattern
  if (q.includes('gas') && q.includes('fees')) {
    const data = metricsGasFeesDaily(chain);
    return {
      columns: ['blockchain', 'block_date', 'metric_type', 'metric_value', 'metric_currency'],
      rows: data.map((r) => [r.blockchain, r.block_date, r.metric_type, r.metric_value, r.metric_currency || null]),
    };
  }

  // default fall-back: return small table
  return {
    columns: ['message'],
    rows: [[`No matching pattern for chain=${chain}`]],
  };
}

// ------------------------------
// 4) FRONTEND HELPERS
// ------------------------------

export function toChartJsFromDaily(rows: DailyMetricRow[], labelKey: string, valueLabel: string) {
  const labels = rows.map((r) => r.block_date);
  const values = rows.map((r) => r.metric_value);
  return {
    labels,
    datasets: [
      {
        label: valueLabel,
        data: values,
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
        fill: false,
        tension: 0.25,
      },
    ],
  };
}

// ------------------------------
// 5) EXPORTS FOR INTEGRATION
// ------------------------------
export const Spellbook = {
  metricsTransactionsDaily,
  metricsTransfersDaily,
  metricsGasFeesDaily,
  crossChainTransactionsDaily,
  executeQuery,
  toChartJsFromDaily,
};
