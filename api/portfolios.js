/**
 * FrameTheGallery API - Portfolio Management (Blob Storage)
 * 
 * Handles CRUD operations for user portfolios using Vercel Blob storage.
 * Stores portfolio metadata as JSON files in Blob.
 */

import { put, list, head } from '@vercel/blob';

export default async function handler(request, response) {
  const { userId, portfolioId } = request.query;
  
  if (request.method === 'GET') {
    try {
      if (!userId) {
        return response.status(400).json({ error: 'User ID required' });
      }

      // Try to find the user's portfolio file in Blob storage
      const blobPath = `portfolios/${userId}.json`;
      
      try {
        // List blobs to find the user's portfolio file
        const { blobs } = await list({ prefix: `portfolios/${userId}` });
        
        if (blobs.length === 0) {
          // No portfolios file found, return empty array
          return response.status(200).json({
            success: true,
            portfolios: [],
            count: 0
          });
        }
        
        // Get the first matching blob (should be the portfolios.json file)
        const portfolioBlob = blobs.find(blob => blob.pathname.endsWith('.json'));
        
        if (!portfolioBlob) {
          return response.status(200).json({
            success: true,
            portfolios: [],
            count: 0
          });
        }
        
        // Fetch the actual content
        const blobResponse = await fetch(portfolioBlob.url);
        const portfolios = await blobResponse.json();
        
        console.log(`Retrieved ${portfolios.length} portfolios for user ${userId}`);
        
        return response.status(200).json({
          success: true,
          portfolios: portfolios,
          count: portfolios.length
        });
        
      } catch (fetchError) {
        console.log(`Error fetching portfolios for user ${userId}:`, fetchError.message);
        // Return empty array if file doesn't exist or can't be fetched
        return response.status(200).json({
          success: true,
          portfolios: [],
          count: 0
        });
      }

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
      const { userId, portfolios } = request.body;
      
      if (!userId || !Array.isArray(portfolios)) {
        return response.status(400).json({ 
          error: 'User ID and portfolios array required' 
        });
      }

      // Save portfolios as JSON file to Blob
      const portfolioData = JSON.stringify(portfolios, null, 2);
      const blob = await put(`portfolios/${userId}.json`, portfolioData, {
        access: 'public',
        addRandomSuffix: false,
      });

      console.log(`Saved ${portfolios.length} portfolios for user ${userId} to ${blob.url}`);
      
      return response.status(200).json({
        success: true,
        saved: portfolios.length,
        url: blob.url
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
      if (!userId || !portfolioId) {
        return response.status(400).json({ 
          error: 'User ID and portfolio ID required' 
        });
      }

      // First, get existing portfolios
      const { blobs } = await list({ prefix: `portfolios/${userId}` });
      const portfolioBlob = blobs.find(blob => blob.pathname.endsWith('.json'));
      
      if (!portfolioBlob) {
        return response.status(404).json({ error: 'User portfolios not found' });
      }
      
      // Fetch current portfolios
      const blobResponse = await fetch(portfolioBlob.url);
      const portfolios = await blobResponse.json();
      
      // Remove the specified portfolio
      const updatedPortfolios = portfolios.filter(p => p.id !== portfolioId);
      
      // Save updated portfolios back to Blob
      const portfolioData = JSON.stringify(updatedPortfolios, null, 2);
      await put(`portfolios/${userId}.json`, portfolioData, {
        access: 'public',
        addRandomSuffix: false,
      });
      
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