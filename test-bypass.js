async function testBypass() {
  const videoId = 'UF8uR6Z6KLc';
  
  console.log('Testing bypass method for:', videoId);
  
  try {
    // Try to get transcript using a different URL format
    const transcriptUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=srv3`;
    console.log('Trying URL:', transcriptUrl);
    
    const response = await fetch(transcriptUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const text = await response.text();
      console.log('Response length:', text.length);
      console.log('Response preview:', text.substring(0, 200));
      
      if (text.length > 0) {
        // Parse the XML
        const textMatches = text.match(/<text[^>]*>([^<]+)<\/text>/g);
        if (textMatches) {
          console.log(`Found ${textMatches.length} text segments`);
          
          const segments = [];
          for (const match of textMatches) {
            const textMatch = match.match(/<text[^>]*>([^<]+)<\/text>/);
            const durMatch = match.match(/dur="([^"]+)"/);
            const startMatch = match.match(/start="([^"]+)"/);
            
            if (textMatch) {
              const segmentText = textMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
              const start = startMatch ? parseFloat(startMatch[1]) : 0;
              const duration = durMatch ? parseFloat(durMatch[1]) : 0;
              
              segments.push({ text: segmentText, start, duration });
            }
          }
          
          console.log(`Parsed ${segments.length} segments`);
          if (segments.length > 0) {
            console.log('First segment:', segments[0]);
            console.log('Last segment:', segments[segments.length - 1]);
            
            const fullText = segments.map(s => s.text).join(' ');
            console.log(`Full text length: ${fullText.length} characters`);
            
            return {
              videoId,
              title: `YouTube Video ${videoId}`,
              segments,
              fullText
            };
          }
        } else {
          console.log('No text segments found in XML');
        }
      } else {
        console.log('Empty response');
      }
    } else {
      console.log(`Failed with status ${response.status}`);
    }
    
    throw new Error('No transcript found');
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

testBypass().then(result => {
  console.log('\n✅ SUCCESS!');
  console.log('Video ID:', result.videoId);
  console.log('Title:', result.title);
  console.log('Segments:', result.segments.length);
  console.log('Full text length:', result.fullText.length);
}).catch(error => {
  console.error('❌ FAILED:', error.message);
}); 