import { kv } from '@vercel/kv';

// Dynamic HTML generation for portfolio sharing
export async function GET(request, { params }) {
  try {
    const { userId, portfolioId } = params;
    
    if (!userId || !portfolioId) {
      return new Response('Invalid portfolio URL', { status: 400 });
    }

    // Get portfolio data
    const portfolios = await kv.get(`portfolios:${userId}`) || [];
    const portfolio = portfolios.find(p => p.id === portfolioId);
    
    if (!portfolio) {
      return new Response('Portfolio not found', { status: 404 });
    }

    // Get the first image as the preview image
    const previewImage = portfolio.images && portfolio.images.length > 0 
      ? portfolio.images[0].url 
      : 'https://framethegallery.xyz/og-image.png';

    const portfolioTitle = portfolio.title || 'Portfolio';
    const portfolioDescription = `${portfolio.images?.length || 0} photos • Created with FrameTheGallery`;
    const portfolioUrl = `https://framethegallery.xyz/?portfolio=${userId}_${portfolioId}&miniApp=true`;

    // Generate HTML with dynamic meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${portfolioTitle} - FrameTheGallery</title>
    
    <!-- Standard Meta Tags -->
    <meta name="description" content="${portfolioDescription}">
    
    <!-- OpenGraph Meta Tags -->
    <meta property="og:url" content="${portfolioUrl}">
    <meta property="og:title" content="${portfolioTitle} - FrameTheGallery">
    <meta property="og:description" content="${portfolioDescription}">
    <meta property="og:image" content="${previewImage}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="FrameTheGallery">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${portfolioTitle} - FrameTheGallery">
    <meta name="twitter:description" content="${portfolioDescription}">
    <meta name="twitter:image" content="${previewImage}">
    
    <!-- Farcaster Frame Meta Tags -->
    <meta property="fc:frame" content="vNext">
    <meta property="fc:frame:title" content="${portfolioTitle}">
    <meta property="fc:frame:image" content="${previewImage}">
    <meta property="fc:frame:button:1" content="📸 View Gallery">
    <meta property="fc:frame:button:1:action" content="link">
    <meta property="fc:frame:button:1:target" content="${portfolioUrl}">
    
    <!-- Farcaster Mini App Meta Tags -->
    <meta name="fc:miniapp" content='{"version":"1","imageUrl":"${previewImage}","button":{"title":"📸 View ${portfolioTitle}","action":{"type":"launch_miniapp","url":"${portfolioUrl}","name":"FrameTheGallery","splashImageUrl":"https://framethegallery.xyz/splash.svg","splashBackgroundColor":"#667eea"}}}'>
    
    <!-- Redirect to main app -->
    <meta http-equiv="refresh" content="0; url=${portfolioUrl}">
    <script>
      window.location.href = "${portfolioUrl}";
    </script>
</head>
<body>
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>${portfolioTitle}</h1>
        <p>${portfolioDescription}</p>
        <p>If you are not redirected automatically, <a href="${portfolioUrl}">click here</a>.</p>
    </div>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });

  } catch (error) {
    console.error('Error generating portfolio share page:', error);
    
    // Fallback to main app
    const fallbackUrl = 'https://framethegallery.xyz';
    const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FrameTheGallery - Professional Photo Portfolio</title>
    <meta http-equiv="refresh" content="0; url=${fallbackUrl}">
    <script>window.location.href = "${fallbackUrl}";</script>
</head>
<body>
    <p>Redirecting to FrameTheGallery...</p>
</body>
</html>`;
    
    return new Response(fallbackHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html'
      }
    });
  }
}

export const runtime = 'edge';