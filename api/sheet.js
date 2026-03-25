export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const SHEET_ID = '1lJaDQzuMdEK28Zlzsti8VuhdCaRsrb2jUHZYYEBJJ5c';
  const gid = req.query.gid || '0';

  // Try gviz endpoint first (works better for public sheets)
  const urls = [
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&id=${SHEET_ID}&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (response.ok) {
        const csv = await response.text();
        if (csv && !csv.includes('<!DOCTYPE') && csv.length > 10) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          return res.status(200).send(csv);
        }
      }
    } catch (e) { continue; }
  }

  res.status(400).json({ error: 'Could not fetch sheet. Make sure it is public.' });
}
