import { kv } from '@vercel/kv';

// Get specific portfolio for public sharing
export default async function handler(request, response) {
  const { userId, portfolioId } = request.query;
  
  try {
    
    if (!userId || !portfolioId) {
      return response.status(400).json({ error: 'Invalid portfolio URL' });
    }

    const portfolios = await kv.get(`portfolios:${userId}`) || [];
    const portfolio = portfolios.find(p => p.id === portfolioId);
    
    if (!portfolio) {
      return response.status(404).json({ error: 'Portfolio not found' });
    }

    // Increment view count
    const viewKey = `views:${userId}:${portfolioId}`;
    const currentViews = await kv.get(viewKey) || 0;
    await kv.set(viewKey, currentViews + 1);

    console.log(`Public portfolio viewed: ${userId}/${portfolioId}, views: ${currentViews + 1}`);
    
    return response.status(200).json({
      success: true,
      portfolio: {
        ...portfolio,
        views: currentViews + 1
      }
    });

  } catch (error) {
    console.error('Error fetching public portfolio:', error);
    return response.status(500).json({
      error: 'Failed to fetch portfolio', 
      details: error.message
    });
  }
}