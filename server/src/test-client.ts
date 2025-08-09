import WebSocket from 'ws';

// Test the WebSocket connection
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  console.log('Connected to test server');
  
  // Test query
  ws.send(JSON.stringify({
    type: 'query',
    payload: {
      query: 'SELECT * FROM transactions'
    }
  }));
};

ws.onmessage = (event: WebSocket.MessageEvent) => {
  const data = event.data.toString();
  console.log('Received:', JSON.parse(data));
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

// Test REST endpoints
async function testEndpoints() {
  try {
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:3001/health');
    console.log('Health check:', await healthResponse.json());

    // Test saving query
    const saveResponse = await fetch('http://localhost:3001/queries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Query',
        query: 'SELECT * FROM transactions',
        userId: 'test-user'
      })
    });
    console.log('Save query:', await saveResponse.json());

    // Test getting queries
    const queriesResponse = await fetch('http://localhost:3001/queries/test-user');
    console.log('Get queries:', await queriesResponse.json());
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run tests
testEndpoints();
