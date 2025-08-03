// @ts-ignore
import { YoutubeTranscript } from 'youtube-transcript';

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface TranscriptResult {
  videoId: string;
  title: string;
  segments: TranscriptSegment[];
  fullText: string;
}

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

async function getVideoTitle(videoId: string): Promise<string> {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return `YouTube Video ${videoId}`;
    }

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : `YouTube Video ${videoId}`;
  } catch (error) {
    console.log('Failed to get video title:', error);
    return `YouTube Video ${videoId}`;
  }
}

export async function scrapeYouTubeTranscriptUnified(videoUrl: string): Promise<TranscriptResult> {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) throw new Error('Invalid YouTube URL');

  try {
    console.log(`🎬 Video ID: ${videoId}`);
    
    // Get video title
    const title = await getVideoTitle(videoId);
    console.log(`📝 Video title: "${title}"`);
    
    // Use the youtube-transcript package
    console.log('📖 Fetching transcript using youtube-transcript...');
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
    console.log(`📊 Found ${transcriptData.length} transcript segments`);
    
    if (transcriptData.length === 0) {
      throw new Error('No transcript available for this video. The video may not have auto-generated or manually added transcripts.');
    }
    
    // Convert to our format
    const segments: TranscriptSegment[] = transcriptData.map(item => ({
      text: item.text,
      start: parseFloat(String(item.offset || 0)) / 1000, // Convert from milliseconds to seconds
      duration: parseFloat(String(item.duration || 0)) / 1000 // Convert from milliseconds to seconds
    }));
    
    const fullText = segments.map(segment => segment.text).join(' ');
    
    return { videoId, title, segments, fullText };
  } catch (error) {
    throw new Error(`Failed to extract transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 