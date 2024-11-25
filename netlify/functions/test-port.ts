import { Handler } from '@netlify/functions';
import net from 'net';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const { host, port } = JSON.parse(event.body || '{}');

  try {
    const success = await new Promise((resolve) => {
      const socket = new net.Socket();
      
      socket.setTimeout(5000);
      
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.on('error', () => {
        resolve(false);
      });
      
      socket.connect(port, host);
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}