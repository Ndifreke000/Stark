import WebSocket from 'ws';
import fetch from 'node-fetch';

const TEST_USER_ID = 'test-user-123';
const BASE_URL = 'http://localhost:3001';
const WS_URL = 'ws://localhost:3001';

async function testRESTEndpoints() {
  console.log('Testing REST endpoints...');

  // Test health endpoint
  try {
    const healthResponse = await fetch(`${BASE_URL}/health`);
    console.log('Health check:', await healthResponse.json());
  } catch (error) {
    console.error('Health check failed:', error);
  }

  // Test saving a query
  try {
    const saveResponse = await fetch(`${BASE_URL}/queries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Query',
        query: 'SELECT * FROM transactions LIMIT 10',
        userId: TEST_USER_ID
      })
    });
    console.log('Save query:', await saveResponse.json());
  } catch (error) {
    console.error('Save query failed:', error);
  }

  // Test getting saved queries
  try {
    const queriesResponse = await fetch(`${BASE_URL}/queries/${TEST_USER_ID}`);
    console.log('Get saved queries:', await queriesResponse.json());
  } catch (error) {
    console.error('Get queries failed:', error);
  }
}

function testWebSocket() {
  console.log('Testing WebSocket connection...');
  
  const ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log('WebSocket connected');
    
    // Test query execution
    ws.send(JSON.stringify({
      type: 'query',
      payload: {
        query: 'SELECT * FROM starknet_transactions LIMIT 5'
      }
    }));
  });

  ws.on('message', (data) => {
    console.log('Received:', JSON.parse(data.toString()));
    ws.close();
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('WebSocket closed');
  });
}

async function runTests() {
  try {
    await testRESTEndpoints();
    testWebSocket();
  } catch (error) {
    console.error('Tests failed:', error);
  }
}

runTests();
