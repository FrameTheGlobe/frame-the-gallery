import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

// Get specific portfolio for public sharing
export async function GET(request, { params }) {
  try {
    const { userId, portfolioId } = params;
    
    if (!userId || !portfolioId) {
      return NextResponse.json({ error: 'Invalid portfolio URL' }, { status: 400 });
    }

    const portfolios = await kv.get(`portfolios:${userId}`) || [];
    const portfolio = portfolios.find(p => p.id === portfolioId);
    
    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Increment view count
    const viewKey = `views:${userId}:${portfolioId}`;
    const currentViews = await kv.get(viewKey) || 0;
    await kv.set(viewKey, currentViews + 1);

    console.log(`Public portfolio viewed: ${userId}/${portfolioId}, views: ${currentViews + 1}`);
    
    return NextResponse.json({
      success: true,
      portfolio: {
        ...portfolio,
        views: currentViews + 1
      }
    });

  } catch (error) {
    console.error('Error fetching public portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio', details: error.message },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';