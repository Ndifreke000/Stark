const WebSocket = require('ws');

// Test the RPC endpoint
async function testRpcEndpoint() {
  const endpoint = 'wss://33b60227a006.ngrok-free.app';
  
  console.log(`Testing RPC WebSocket endpoint: ${endpoint}`);
  
  return new Promise((resolve, reject) => {
    try {
      const ws = new WebSocket(endpoint);
      
      ws.on('open', () => {
        console.log('✅ Connected successfully to WebSocket!');
        console.log('Sending test message...');
        
        // Send a simple test message
        ws.send(JSON.stringify({
          type: 'ping',
          payload: { message: 'test connection' }
        }));
        
        // Set timeout to close connection after test
        setTimeout(() => {
          ws.close();
          resolve(true);
        }, 5000);
      });
      
      ws.on('message', (data) => {
        console.log('📦 Received message:', data.toString());
      });
      
      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error.message);
        reject(error);
      });
      
      ws.on('close', () => {
        console.log('🔌 Connection closed');
      });
      
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      reject(error);
    }
  });
}

// Also test HTTP endpoint
async function testHttpEndpoint() {
  const endpoint = 'https://33b60227a006.ngrok-free.app';
  
  console.log(`\nTesting HTTP endpoint: ${endpoint}`);
  
  try {
    // Try a simple fetch request
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.text();
      console.log('✅ HTTP endpoint responded:', data.substring(0, 200) + '...');
      return true;
    } else {
      console.log(`⚠️ HTTP endpoint returned status: ${response.status}`);
      const data = await response.text();
      console.log('Response:', data.substring(0, 200) + '...');
      return false;
    }
  } catch (error) {
    console.error('❌ HTTP endpoint test failed:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('Starting RPC endpoint tests...\n');
  
  try {
    // Test WebSocket first
    const wsSuccess = await testRpcEndpoint();
    console.log(`\nWebSocket test: ${wsSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    
    // Test HTTP
    const httpSuccess = await testHttpEndpoint();
    console.log(`HTTP test: ${httpSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    
    console.log('\n' + '='.repeat(50));
    if (wsSuccess || httpSuccess) {
      console.log('🎉 Some tests passed! Your RPC endpoint is partially working.');
    } else {
      console.log('❌ All tests failed. Your RPC endpoint appears to be offline.');
      console.log('Check that your ngrok tunnel is running and the endpoint is correct.');
    }
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('Test execution error:', error.message);
  }
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\nTests interrupted by user');
  process.exit(0);
});

// Run the tests
runTests();
