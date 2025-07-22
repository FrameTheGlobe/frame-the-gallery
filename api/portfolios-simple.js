// Simplified portfolios API for debugging
export default function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }
      
      // Return empty portfolio list for now to test basic functionality
      return res.status(200).json({
        success: true,
        portfolios: [],
        count: 0,
        debug: { userId, method: req.method }
      });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal error',
      message: error.message 
    });
  }
}