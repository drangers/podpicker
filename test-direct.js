async function testDirectTranscript() {
  const videoId = 'UF8uR6Z6KLc';
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  console.log('Testing direct transcript extraction for:', videoUrl);
  
  try {
    // Fetch the video page
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
    
    // Get video title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : `YouTube Video ${videoId}`;
    console.log(`Video title: "${title}"`);
    
    // Look for caption tracks
    const captionTracksMatch = html.match(/"captionTracks":\s*(\[[^\]]+\])/);
    if (!captionTracksMatch) {
      throw new Error('No caption tracks found in video page');
    }
    
    console.log('Found caption tracks section');
    console.log('Caption tracks preview:', captionTracksMatch[1].substring(0, 200));
    
    // Try to parse the caption tracks
    try {
      const captionTracks = JSON.parse(captionTracksMatch[1]);
      console.log(`Found ${captionTracks.length} caption tracks`);
      
      for (let i = 0; i < captionTracks.length; i++) {
        const track = captionTracks[i];
        console.log(`Track ${i + 1}: ${track.languageCode} - ${track.name?.simpleText || 'Unknown'}`);
        console.log(`  URL: ${track.baseUrl.substring(0, 100)}...`);
        
        // Try to fetch the transcript from this track
        try {
          const transcriptResponse = await fetch(track.baseUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
          });
          
          if (transcriptResponse.ok) {
            const transcriptText = await transcriptResponse.text();
            console.log(`  Transcript length: ${transcriptText.length} characters`);
            
            if (transcriptText.length > 0) {
              console.log('  ✅ Success! Found transcript content');
              console.log('  Preview:', transcriptText.substring(0, 200));
              
              // Parse the XML
              const textMatches = transcriptText.match(/<text[^>]*>([^<]+)<\/text>/g);
              if (textMatches) {
                console.log(`  Found ${textMatches.length} text segments`);
                
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
                
                console.log(`  Parsed ${segments.length} segments`);
                if (segments.length > 0) {
                  console.log('  First segment:', segments[0]);
                  console.log('  Last segment:', segments[segments.length - 1]);
                  
                  const fullText = segments.map(s => s.text).join(' ');
                  console.log(`  Full text length: ${fullText.length} characters`);
                  
                  return {
                    videoId,
                    title,
                    segments,
                    fullText
                  };
                }
              } else {
                console.log('  No text segments found in XML');
              }
            } else {
              console.log('  ❌ Empty transcript');
            }
          } else {
            console.log(`  ❌ Failed to fetch transcript: ${transcriptResponse.status}`);
          }
        } catch (error) {
          console.log(`  ❌ Error fetching transcript: ${error.message}`);
        }
      }
      
      throw new Error('No working transcript found');
      
    } catch (parseError) {
      console.log('Failed to parse caption tracks:', parseError);
      throw new Error('Failed to parse caption tracks');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

testDirectTranscript().then(result => {
  console.log('\n✅ SUCCESS!');
  console.log('Video ID:', result.videoId);
  console.log('Title:', result.title);
  console.log('Segments:', result.segments.length);
  console.log('Full text length:', result.fullText.length);
}).catch(error => {
  console.error('❌ FAILED:', error.message);
}); 