import { rpcService } from './src/services/rpcService';
import { RPC_EVENTS } from './src/config/rpc';

// Test the RPC endpoint
async function testRpcEndpoint() {
  const endpoint = 'https://33b60227a006.ngrok-free.app';
  const wsEndpoint = endpoint.replace('http', 'ws');
  
  console.log(`Testing RPC endpoint: ${wsEndpoint}`);
  
  try {
    // Connect to the WebSocket
    console.log('Connecting to WebSocket...');
    await rpcService.connect(wsEndpoint);
    console.log('✅ Connected successfully!');
    
    // Subscribe to events to see if data is emitted
    rpcService.subscribe('NEW_BLOCK' as keyof typeof RPC_EVENTS, (data: any) => {
      console.log('📦 New block received:', data);
    });
    
    rpcService.subscribe('NEW_TRANSACTION' as keyof typeof RPC_EVENTS, (data: any) => {
      console.log('💸 New transaction received:', data);
    });
    
    rpcService.subscribe('QUERY_RESULT' as keyof typeof RPC_EVENTS, (data: any) => {
      console.log('🔍 Query result received:', data);
    });
    
    // Test a simple query
    console.log('Testing a simple query...');
    try {
      const result = await rpcService.executeQuery('SELECT 1');
      console.log('✅ Query executed successfully:', result);
    } catch (queryError) {
      console.log('⚠️ Query failed (this might be expected):', queryError.message);
    }
    
    // Keep the connection open for a while to see if data flows
    console.log('Listening for incoming data for 30 seconds...');
    console.log('Press Ctrl+C to stop');
    
    setTimeout(() => {
      console.log('Test completed');
      rpcService.disconnect();
      process.exit(0);
    }, 30000);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  rpcService.disconnect();
  process.exit(0);
});

// Run the test
testRpcEndpoint();
