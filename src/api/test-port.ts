import net from 'net';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { host, port } = req.body;

  try {
    const success = await new Promise((resolve) => {
      const socket = new net.Socket();
      
      socket.setTimeout(5000); // 5 second timeout
      
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

    return res.json({ success });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}