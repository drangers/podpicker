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
 * Working YouTube transcript scraper based on proven GitHub solution
 */
export async function scrapeYouTubeTranscriptWorking(videoUrl: string): Promise<YouTubeTranscript> {
  console.log('🚀 Starting working YouTube transcript scraping...');
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
    
    // Get video page to extract transcript data
    console.log('📖 Fetching video page...');
    const videoPageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });
    
    if (!videoPageResponse.ok) {
      throw new Error('Failed to fetch video page');
    }
    
    const videoPageHtml = await videoPageResponse.text();
    console.log(`📄 Video page length: ${videoPageHtml.length} characters`);
    
    // Look for transcript data in the page - try multiple patterns
    let transcriptMatch = videoPageHtml.match(/"captions":\s*({[^}]+})/);
    if (!transcriptMatch) {
      transcriptMatch = videoPageHtml.match(/"playerCaptionsTracklistRenderer":\s*({[^}]+})/);
    }
    if (!transcriptMatch) {
      transcriptMatch = videoPageHtml.match(/"captionTracks":\s*(\[[^\]]+\])/);
    }
    
    if (!transcriptMatch) {
      throw new Error('No transcript data found in video page');
    }
    
    console.log('✅ Found transcript data in video page');
    
    // Parse the transcript data
    let captionsData;
    try {
      const jsonStr = transcriptMatch[1];
      console.log(`🔍 JSON string preview: ${jsonStr.substring(0, 200)}...`);
      
      // Try to find the complete JSON object by looking for the closing brace
      let braceCount = 0;
      let endIndex = 0;
      let startIndex = jsonStr.indexOf('{');
      
      if (startIndex === -1) {
        // If no opening brace, try to find the start of the object
        startIndex = 0;
      }
      
      for (let i = startIndex; i < jsonStr.length; i++) {
        if (jsonStr[i] === '{') braceCount++;
        if (jsonStr[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i + 1;
            break;
          }
        }
      }
      
      if (endIndex === 0) {
        // If we couldn't find the end, try a different approach
        console.log('🔍 Could not find complete JSON, trying alternative approach...');
        
        // Look for the end of the captions object by finding the next major key
        const nextKeyMatch = jsonStr.match(/,"([^"]+)":/);
        if (nextKeyMatch && nextKeyMatch.index !== undefined) {
          endIndex = nextKeyMatch.index;
        } else {
          endIndex = jsonStr.length;
        }
      }
      
      const completeJsonStr = jsonStr.substring(startIndex, endIndex);
      console.log(`🔍 Complete JSON string length: ${completeJsonStr.length}`);
      console.log(`🔍 Complete JSON string: ${completeJsonStr}`);
      
      captionsData = JSON.parse(completeJsonStr);
      console.log(`✅ Successfully parsed captions JSON`);
      
    } catch (parseError) {
      console.log('❌ Failed to parse captions JSON:', parseError);
      
      // Try a simpler approach - look for captionTracks directly
      console.log('🔄 Trying simpler approach...');
      const captionTracksMatch = videoPageHtml.match(/"captionTracks":\s*(\[[^\]]+\])/);
      if (captionTracksMatch) {
        try {
          const tracksArray = JSON.parse(captionTracksMatch[1]);
          console.log(`✅ Found ${tracksArray.length} caption tracks directly`);
          
          if (tracksArray.length > 0) {
            // Try to find English track first, then fall back to any available track
            let track = tracksArray.find((t: any) => t.languageCode === 'en');
            if (!track) {
              track = tracksArray.find((t: any) => t.languageCode === 'en-US');
            }
            if (!track) {
              track = tracksArray.find((t: any) => t.languageCode === 'en-GB');
            }
            if (!track) {
              track = tracksArray[0]; // Use first available track
            }
            
            console.log(`📊 Using track: ${track.languageCode} - ${track.languageName}`);
            console.log(`🔗 Track URL: ${track.baseUrl}`);
            
            // Fetch the transcript from the track URL
            console.log('📖 Fetching transcript from track URL...');
            const trackResponse = await fetch(track.baseUrl, {
              headers: {
                'User-Agent': USER_AGENT,
              },
            });
            
            if (!trackResponse.ok) {
              throw new Error(`Failed to fetch transcript: ${trackResponse.status}`);
            }
            
            const trackText = await trackResponse.text();
            console.log(`📄 Track transcript length: ${trackText.length} characters`);
            
            if (trackText.length === 0) {
              throw new Error('Transcript is empty');
            }
            
            // Parse the XML transcript
            const segments = parseTranscriptXML(trackText);
            console.log(`✅ Parsed ${segments.length} segments from XML`);
            
            if (segments.length === 0) {
              throw new Error('No transcript segments found');
            }
            
            // Combine all text
            const fullText = segments.map(segment => segment.text).join(' ');
            console.log(`📄 Full transcript text length: ${fullText.length} characters`);
            
            return {
              videoId,
              title,
              segments,
              fullText
            };
          }
        } catch (directParseError) {
          console.log('❌ Failed to parse tracks directly:', directParseError);
        }
      }
      
      throw new Error('Failed to parse transcript data');
    }
    
    if (!captionsData.captionTracks || captionsData.captionTracks.length === 0) {
      throw new Error('No caption tracks found');
    }
    
    console.log(`📊 Found ${captionsData.captionTracks.length} caption tracks`);
    
    // Use the first available track
    const track = captionsData.captionTracks[0];
    console.log(`📊 Using track: ${track.languageCode} - ${track.languageName}`);
    console.log(`🔗 Track URL: ${track.baseUrl}`);
    
    // Fetch the transcript from the track URL
    console.log('📖 Fetching transcript from track URL...');
    const trackResponse = await fetch(track.baseUrl, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });
    
    if (!trackResponse.ok) {
      throw new Error(`Failed to fetch transcript: ${trackResponse.status}`);
    }
    
    const trackText = await trackResponse.text();
    console.log(`📄 Track transcript length: ${trackText.length} characters`);
    
    if (trackText.length === 0) {
      throw new Error('Transcript is empty');
    }
    
    // Parse the XML transcript
    const segments = parseTranscriptXML(trackText);
    console.log(`✅ Parsed ${segments.length} segments from XML`);
    
    if (segments.length === 0) {
      throw new Error('No transcript segments found');
    }
    
    // Combine all text
    const fullText = segments.map(segment => segment.text).join(' ');
    console.log(`📄 Full transcript text length: ${fullText.length} characters`);
    
    return {
      videoId,
      title,
      segments,
      fullText
    };
    
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
    const text = match[3]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"');
    
    segments.push({
      start,
      duration,
      text
    });
  }
  
  return segments;
} 