// Simple test endpoint to verify Vercel functions are working
export default function handler(req, res) {
  return res.status(200).json({ 
    message: 'Test endpoint working',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}