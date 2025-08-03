import { TranscriptSegment, YouTubeTranscript } from './youtube-transcript-api';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36';

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : '';
}

/**
 * Get video title from YouTube page
 */
async function getVideoTitle(videoId: string): Promise<string> {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });
    
    if (!response.ok) {
      return 'Unknown Title';
    }
    
    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      return titleMatch[1].replace(' - YouTube', '').trim();
    }
  } catch (error) {
    console.log('Failed to get video title:', error);
  }
  
  return 'Unknown Title';
}

/**
 * Simple and reliable YouTube transcript scraper
 */
export async function scrapeYouTubeTranscriptSimple(videoUrl: string): Promise<YouTubeTranscript> {
  console.log('🚀 Starting simple YouTube transcript scraping...');
  console.log(`📹 Video URL: ${videoUrl}`);
  
  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }
  
  console.log(`🎬 Video ID: ${videoId}`);
  
  try {
    // Get video title
    console.log('📝 Getting video title...');
    const title = await getVideoTitle(videoId);
    console.log(`✅ Video title: "${title}"`);
    
    // Try to get transcript using a simple approach
    console.log('📖 Attempting to get transcript...');
    
    // Method 1: Try the simple transcript URL format
    const transcriptUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`;
    console.log(`🔗 Trying transcript URL: ${transcriptUrl}`);
    
    const response = await fetch(transcriptUrl, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });
    
    if (response.ok) {
      const transcriptText = await response.text();
      console.log(`📄 Transcript response length: ${transcriptText.length} characters`);
      
      if (transcriptText.length > 0) {
        // Parse the XML transcript
        const segments = parseTranscriptXML(transcriptText);
        console.log(`✅ Parsed ${segments.length} segments from XML`);
        
        const fullText = segments.map(segment => segment.text).join(' ');
        console.log(`📄 Full transcript text length: ${fullText.length} characters`);
        
        return {
          videoId,
          title,
          segments,
          fullText
        };
      }
    }
    
    // Method 2: Try to extract from video page
    console.log('🔄 Trying to extract transcript from video page...');
    const videoPageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });
    
    if (videoPageResponse.ok) {
      const videoPageHtml = await videoPageResponse.text();
      
      // Look for transcript data in the page
      const transcriptMatch = videoPageHtml.match(/"captions":\s*({[^}]+})/);
      if (transcriptMatch) {
        console.log('✅ Found captions data in video page');
        
        try {
          const captionsData = JSON.parse(transcriptMatch[1]);
          console.log(`📊 Captions data keys: ${Object.keys(captionsData).join(', ')}`);
          
          if (captionsData.captionTracks && captionsData.captionTracks.length > 0) {
            const track = captionsData.captionTracks[0];
            console.log(`📊 Using track: ${track.languageCode} - ${track.languageName}`);
            
            // Fetch the transcript from the track URL
            const trackResponse = await fetch(track.baseUrl, {
              headers: {
                'User-Agent': USER_AGENT,
              },
            });
            
            if (trackResponse.ok) {
              const trackText = await trackResponse.text();
              console.log(`📄 Track transcript length: ${trackText.length} characters`);
              
              if (trackText.length > 0) {
                const segments = parseTranscriptXML(trackText);
                console.log(`✅ Parsed ${segments.length} segments from track`);
                
                const fullText = segments.map(segment => segment.text).join(' ');
                console.log(`📄 Full transcript text length: ${fullText.length} characters`);
                
                return {
                  videoId,
                  title,
                  segments,
                  fullText
                };
              }
            }
          }
        } catch (parseError) {
          console.log('❌ Failed to parse captions data:', parseError);
        }
      }
    }
    
    // If we get here, no transcript was found
    console.log('❌ No transcript found using any method');
    throw new Error('No transcript available for this video');
    
  } catch (error) {
    console.log('❌ Error during transcript scraping:', error);
    throw error;
  }
}

/**
 * Parse transcript XML and extract segments
 */
function parseTranscriptXML(xmlText: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  
  // Parse XML using regex (simple approach)
  const textRegex = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
  let match;
  
  while ((match = textRegex.exec(xmlText)) !== null) {
    const start = parseFloat(match[1]);
    const duration = parseFloat(match[2]);
    const text = match[3].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    
    segments.push({
      start,
      duration,
      text
    });
  }
  
  return segments;
} 