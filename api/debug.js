// Most basic possible API endpoint
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'working',
    method: req.method,
    query: req.query,
    timestamp: new Date().toISOString()
  });
}