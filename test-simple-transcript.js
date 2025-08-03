async function testSimpleTranscript() {
  const videoId = 'UF8uR6Z6KLc';
  
  console.log('Testing simple transcript URL approach for:', videoId);
  
  // Try different transcript URL formats
  const urls = [
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=srv3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=vtt`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=ttml`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=srv1`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=srv2`,
  ];
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`\nTesting URL ${i + 1}: ${url}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      
      console.log(`Response status: ${response.status}`);
      
      if (response.ok) {
        const text = await response.text();
        console.log(`Response length: ${text.length} characters`);
        
        if (text.length > 0) {
          console.log('✅ Success! Found transcript content');
          console.log('Preview:', text.substring(0, 200));
          
          // Try to parse XML
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
            }
          } else {
            console.log('No text segments found in XML');
          }
          
          break; // Found working URL
        } else {
          console.log('❌ Empty response');
        }
      } else {
        console.log(`❌ Failed with status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

testSimpleTranscript(); 