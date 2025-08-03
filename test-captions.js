async function testCaptions() {
  const videoId = 'UF8uR6Z6KLc';
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  console.log('Testing caption extraction for:', videoUrl);
  
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
    
    // Look for captionTracks with a more robust regex
    const captionMatch = html.match(/"captionTracks":\s*(\[[^\]]+\])/);
    if (captionMatch) {
      console.log('✅ Found captionTracks');
      console.log('Raw match:', captionMatch[1].substring(0, 500));
      
      try {
        // Try to parse the JSON
        const captionTracks = JSON.parse(captionMatch[1]);
        console.log('✅ Successfully parsed captionTracks JSON');
        console.log('Number of tracks:', captionTracks.length);
        
        for (let i = 0; i < captionTracks.length; i++) {
          const track = captionTracks[i];
          console.log(`Track ${i + 1}:`, {
            name: track.name,
            languageCode: track.languageCode,
            baseUrl: track.baseUrl ? track.baseUrl.substring(0, 100) + '...' : 'No URL'
          });
          
          if (track.baseUrl) {
            // Test fetching the transcript from the URL
            console.log(`Testing transcript URL for track ${i + 1}...`);
            try {
              const transcriptResponse = await fetch(track.baseUrl);
              if (transcriptResponse.ok) {
                const transcriptXml = await transcriptResponse.text();
                console.log(`✅ Successfully fetched transcript (${transcriptXml.length} characters)`);
                console.log('Transcript preview:', transcriptXml.substring(0, 200));
                
                // Parse the XML to extract text
                const textMatches = transcriptXml.match(/<text[^>]*>([^<]+)<\/text>/g);
                if (textMatches) {
                  console.log(`Found ${textMatches.length} text segments`);
                  const segments = [];
                  
                  for (const match of textMatches) {
                    const textMatch = match.match(/<text[^>]*>([^<]+)<\/text>/);
                    const durMatch = match.match(/dur="([^"]+)"/);
                    const startMatch = match.match(/start="([^"]+)"/);
                    
                    if (textMatch) {
                      const text = textMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                      const start = startMatch ? parseFloat(startMatch[1]) : 0;
                      const duration = durMatch ? parseFloat(durMatch[1]) : 0;
                      
                      segments.push({ text, start, duration });
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
              } else {
                console.log(`❌ Failed to fetch transcript: ${transcriptResponse.status}`);
              }
            } catch (error) {
              console.log(`❌ Error fetching transcript: ${error.message}`);
            }
          }
        }
      } catch (error) {
        console.log('❌ Failed to parse captionTracks JSON:', error.message);
      }
    } else {
      console.log('❌ No captionTracks found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCaptions(); 