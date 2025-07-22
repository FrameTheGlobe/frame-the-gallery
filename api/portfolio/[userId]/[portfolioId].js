/**
 * Individual Portfolio API - Blob Storage
 * 
 * Get specific portfolio for public sharing using Blob storage
 */

import { list } from '@vercel/blob';

export default async function handler(request, response) {
  const { userId, portfolioId } = request.query;
  
  try {
    if (!userId || !portfolioId) {
      return response.status(400).json({ error: 'Invalid portfolio URL' });
    }

    // Find user's portfolio file in Blob storage
    const { blobs } = await list({ prefix: `portfolios/${userId}` });
    const portfolioBlob = blobs.find(blob => blob.pathname.endsWith('.json'));
    
    if (!portfolioBlob) {
      return response.status(404).json({ error: 'User portfolios not found' });
    }
    
    // Fetch the portfolio data
    const blobResponse = await fetch(portfolioBlob.url);
    const portfolios = await blobResponse.json();
    const portfolio = portfolios.find(p => p.id === portfolioId);
    
    if (!portfolio) {
      return response.status(404).json({ error: 'Portfolio not found' });
    }

    console.log(`Public portfolio viewed: ${userId}/${portfolioId}`);
    
    return response.status(200).json({
      success: true,
      portfolio: portfolio
    });

  } catch (error) {
    console.error('Error fetching public portfolio:', error);
    return response.status(500).json({
      error: 'Failed to fetch portfolio', 
      details: error.message
    });
  }
}