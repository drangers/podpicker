async function testYouTubePage() {
  const videoId = 'UF8uR6Z6KLc';
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  console.log('Testing YouTube page structure for:', videoUrl);
  
  try {
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video page: ${response.status}`);
    }

    const html = await response.text();
    console.log(`Page length: ${html.length} characters`);
    
    // Look for various transcript-related patterns
    const patterns = [
      { name: 'captionTracks', regex: /"captionTracks":\s*(\[[^\]]+\])/ },
      { name: 'captions', regex: /"captions":\s*({[^}]+})/ },
      { name: 'playerCaptionsTracklistRenderer', regex: /"playerCaptionsTracklistRenderer":\s*({[^}]+})/ },
      { name: 'transcript', regex: /"transcript":\s*({[^}]+})/ },
      { name: 'show transcript', regex: /show transcript/gi },
      { name: 'transcript button', regex: /transcript.*button/gi },
    ];
    
    for (const pattern of patterns) {
      const matches = html.match(pattern.regex);
      if (matches) {
        console.log(`✅ Found "${pattern.name}": ${matches.length} matches`);
        if (matches[1]) {
          console.log(`   Preview: ${matches[1].substring(0, 200)}...`);
        }
      } else {
        console.log(`❌ No "${pattern.name}" found`);
      }
    }
    
    // Look for title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      console.log(`📝 Title: ${titleMatch[1]}`);
    }
    
    // Save a sample of the HTML for inspection
    const fs = require('fs');
    fs.writeFileSync('youtube-page-sample.html', html.substring(0, 10000));
    console.log('📄 Saved first 10KB of HTML to youtube-page-sample.html');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testYouTubePage(); 