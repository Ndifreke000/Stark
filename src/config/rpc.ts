export interface RPCConfig {
  defaultEndpoint?: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  queryTimeout: number;
}

export const rpcConfig: RPCConfig = {
  reconnectInterval: 5000, // 5 seconds
  maxReconnectAttempts: 5,
  queryTimeout: 30000, // 30 seconds
};

export const RPC_EVENTS = {
  NEW_BLOCK: 'new_block',
  NEW_TRANSACTION: 'new_transaction',
  QUERY_RESULT: 'query_result',
} as const;
