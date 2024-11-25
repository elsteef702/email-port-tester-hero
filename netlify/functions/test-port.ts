import { Handler } from '@netlify/functions';
import net from 'net';

export const handler: Handler = async (event) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod !== 'POST') {
    console.log('Invalid HTTP method:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let host, port;
  try {
    const body = JSON.parse(event.body || '{}');
    host = body.host;
    port = body.port;
  } catch (error) {
    console.error('Error parsing request body:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid request body' }),
    };
  }

  console.log(`Testing connection to ${host}:${port}`);

  try {
    const success = await new Promise((resolve) => {
      const socket = new net.Socket();
      
      socket.setTimeout(5000);
      
      socket.on('connect', () => {
        console.log(`Successfully connected to ${host}:${port}`);
        socket.destroy();
        resolve(true);
      });
      
      socket.on('timeout', () => {
        console.log(`Connection timeout for ${host}:${port}`);
        socket.destroy();
        resolve(false);
      });
      
      socket.on('error', (err) => {
        console.log(`Connection error for ${host}:${port}:`, err.message);
        resolve(false);
      });
      
      socket.connect(port, host);
    });

    console.log(`Test result for ${host}:${port}:`, success);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success }),
    };
  } catch (error) {
    console.error(`Unexpected error testing ${host}:${port}:`, error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
}