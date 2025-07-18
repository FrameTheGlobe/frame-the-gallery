import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

// Get user portfolios
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const portfolios = await kv.get(`portfolios:${userId}`) || [];
    
    console.log(`Retrieved ${portfolios.length} portfolios for user ${userId}`);
    
    return NextResponse.json({
      success: true,
      portfolios: portfolios,
      count: portfolios.length
    });

  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolios', details: error.message },
      { status: 500 }
    );
  }
}

// Save user portfolios
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, portfolios } = body;
    
    if (!userId || !Array.isArray(portfolios)) {
      return NextResponse.json({ 
        error: 'User ID and portfolios array required' 
      }, { status: 400 });
    }

    // Save to KV store
    await kv.set(`portfolios:${userId}`, portfolios);
    
    // Also save a metadata entry for analytics
    const metadata = {
      userId,
      portfolioCount: portfolios.length,
      totalPhotos: portfolios.reduce((sum, p) => sum + p.photos.length, 0),
      lastUpdated: new Date().toISOString()
    };
    await kv.set(`metadata:${userId}`, metadata);
    
    console.log(`Saved ${portfolios.length} portfolios for user ${userId}`, metadata);
    
    return NextResponse.json({
      success: true,
      saved: portfolios.length,
      metadata: metadata
    });

  } catch (error) {
    console.error('Error saving portfolios:', error);
    return NextResponse.json(
      { error: 'Failed to save portfolios', details: error.message },
      { status: 500 }
    );
  }
}

// Delete specific portfolio
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const portfolioId = searchParams.get('portfolioId');
    
    if (!userId || !portfolioId) {
      return NextResponse.json({ 
        error: 'User ID and Portfolio ID required' 
      }, { status: 400 });
    }

    const portfolios = await kv.get(`portfolios:${userId}`) || [];
    const updatedPortfolios = portfolios.filter(p => p.id !== portfolioId);
    
    await kv.set(`portfolios:${userId}`, updatedPortfolios);
    
    console.log(`Deleted portfolio ${portfolioId} for user ${userId}`);
    
    return NextResponse.json({
      success: true,
      deleted: portfolioId,
      remaining: updatedPortfolios.length
    });

  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to delete portfolio', details: error.message },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';