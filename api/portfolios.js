/**
 * FrameTheGallery API - Portfolio Management Endpoint
 * 
 * Handles CRUD operations for user portfolios using Vercel KV storage.
 * Provides GET (retrieve), POST (save), and DELETE (remove) operations
 * with user-namespaced data isolation.
 * 
 * @module api/portfolios
 * @version 1.0.3
 */

import { kv } from '@vercel/kv';

/**
 * Portfolio management API endpoint
 * 
 * GET /api/portfolios?userId={fid} - Get user portfolios
 * POST /api/portfolios - Save user portfolios
 * DELETE /api/portfolios?userId={fid}&portfolioId={id} - Delete specific portfolio
 */
export default async function handler(request, response) {
  
  if (request.method === 'GET') {
    try {
      const { userId } = request.query;
      
      if (!userId) {
        return response.status(400).json({ error: 'User ID required' });
      }

      const portfolios = await kv.get(`portfolios:${userId}`) || [];
      
      console.log(`Retrieved ${portfolios.length} portfolios for user ${userId}`);
      
      return response.status(200).json({
        success: true,
        portfolios: portfolios,
        count: portfolios.length
      });

    } catch (error) {
      console.error('Error fetching portfolios:', error);
      return response.status(500).json({
        error: 'Failed to fetch portfolios', 
        details: error.message
      });
    }
  }
  
  else if (request.method === 'POST') {
    try {
      // Parse JSON body for POST requests
      let body = {};
      if (request.body) {
        body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
      }
      const { userId, portfolios } = body;
      
      if (!userId || !Array.isArray(portfolios)) {
        return response.status(400).json({ 
          error: 'User ID and portfolios array required' 
        });
      }

      // Save to KV store
      await kv.set(`portfolios:${userId}`, portfolios);
      
      // Also save a metadata entry for analytics
      const metadata = {
        userId,
        portfolioCount: portfolios.length,
        totalPhotos: portfolios.reduce((sum, p) => sum + (p.photos?.length || 0), 0),
        lastUpdated: new Date().toISOString()
      };
      await kv.set(`metadata:${userId}`, metadata);

      console.log(`Saved ${portfolios.length} portfolios for user ${userId}`);
      
      return response.status(200).json({
        success: true,
        saved: portfolios.length,
        metadata: metadata
      });

    } catch (error) {
      console.error('Error saving portfolios:', error);
      return response.status(500).json({
        error: 'Failed to save portfolios', 
        details: error.message
      });
    }
  }
  
  else if (request.method === 'DELETE') {
    try {
      const { userId, portfolioId } = request.query;
      
      if (!userId || !portfolioId) {
        return response.status(400).json({ 
          error: 'User ID and portfolio ID required' 
        });
      }

      // Get existing portfolios
      const portfolios = await kv.get(`portfolios:${userId}`) || [];
      
      // Remove the specified portfolio
      const updatedPortfolios = portfolios.filter(p => p.id !== portfolioId);
      
      // Save updated list
      await kv.set(`portfolios:${userId}`, updatedPortfolios);
      
      console.log(`Deleted portfolio ${portfolioId} for user ${userId}`);
      
      return response.status(200).json({
        success: true,
        deleted: portfolioId,
        remaining: updatedPortfolios.length
      });

    } catch (error) {
      console.error('Error deleting portfolio:', error);
      return response.status(500).json({
        error: 'Failed to delete portfolio', 
        details: error.message
      });
    }
  }
  
  else {
    return response.status(405).json({ error: 'Method not allowed' });
  }
}