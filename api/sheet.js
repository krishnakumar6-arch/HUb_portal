export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const SHEET_ID = '1lJaDQzuMdEK28Zlzsti8VuhdCaRsrb2jUHZYYEBJJ5c';
  const gid = req.query.gid || '0';
  
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: `Sheet fetch failed: ${response.status}` });
    }
    
    const csv = await response.text();
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(csv);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
