export default async function handler(req, res) {
  try {
    const response = await fetch("https://hub-portal-backend.onrender.com/health", {
      signal: AbortSignal.timeout(10000)
    });
    const data = await response.json();
    res.status(200).json({ 
      pinged: true, 
      backend: data, 
      timestamp: new Date().toISOString() 
    });
  } catch (e) {
    res.status(200).json({ 
      pinged: false, 
      error: e.message, 
      timestamp: new Date().toISOString() 
    });
  }
}
