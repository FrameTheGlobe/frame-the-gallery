import { kv } from '@vercel/kv';

// Dynamic HTML generation for portfolio sharing
export default async function handler(request, response) {
  const { userId, portfolioId } = request.query;
  
  try {
    console.log('🔍 Sharing endpoint called with:', { userId, portfolioId });
    
    if (!userId || !portfolioId) {
      console.log('❌ Invalid parameters:', { userId, portfolioId });
      return response.status(400).send('Invalid portfolio URL');
    }

    // Get portfolio data
    console.log(`📂 Looking up portfolios for user: ${userId}`);
    const portfolios = await kv.get(`portfolios:${userId}`) || [];
    console.log(`📄 Found ${portfolios.length} portfolios for user ${userId}`);
    
    const portfolio = portfolios.find(p => p.id === portfolioId);
    console.log('🎯 Portfolio lookup result:', portfolio ? `Found: ${portfolio.title}` : 'Not found');
    
    if (!portfolio) {
      console.log('❌ Portfolio not found:', { userId, portfolioId, availableIds: portfolios.map(p => p.id) });
      return response.status(404).send('Portfolio not found');
    }

    // Get the first photo as the preview image
    const previewImage = portfolio.photos && portfolio.photos.length > 0 
      ? portfolio.photos[0].src 
      : 'https://framethegallery.xyz/og-image.png';

    const portfolioTitle = portfolio.title || 'Portfolio';
    const portfolioDescription = `${portfolio.photos?.length || 0} photos • Created with FrameTheGallery`;
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

    response.setHeader('Content-Type', 'text/html');
    response.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return response.status(200).send(html);

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
    
    response.setHeader('Content-Type', 'text/html');
    return response.status(200).send(fallbackHtml);
  }
}