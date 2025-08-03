import { YoutubeTranscript } from 'youtube-transcript';
import { TranscriptSegment, YouTubeTranscript as YouTubeTranscriptType } from './youtube-transcript-api';

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
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
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
 * Convert npm package transcript format to our standard format
 */
function convertNpmTranscriptToSegments(transcriptData: any[]): TranscriptSegment[] {
  return transcriptData.map(item => ({
    start: item.offset / 1000, // Convert from milliseconds to seconds
    duration: item.duration / 1000, // Convert from milliseconds to seconds
    text: item.text
  }));
}

/**
 * YouTube transcript scraper using the proven npm package
 */
export async function scrapeYouTubeTranscriptNpm(videoUrl: string): Promise<YouTubeTranscriptType> {
  console.log('🚀 Starting YouTube transcript scraping with npm package...');
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
    
    // Get transcript using the npm package
    console.log('📖 Fetching transcript using npm package...');
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
    console.log('✅ Transcript data fetched successfully');
    console.log(`📊 Raw transcript data length: ${transcriptData.length}`);
    
    // Convert to our standard format
    console.log('🔄 Converting transcript to standard format...');
    const segments = convertNpmTranscriptToSegments(transcriptData);
    console.log(`✅ Converted ${segments.length} segments`);
    
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