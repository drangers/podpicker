import { fetchTranscript } from 'youtube-transcript-plus';

export interface TranscriptSegment {
  text: string;
  start: number; // in seconds
  duration: number; // in seconds
}

export interface VideoMetadata {
  title: string;
  description: string;
  channelTitle: string;
  duration: number;
  thumbnail: string;
}

export class YouTubeTranscriptPlus {
  /**
   * Fetch transcript for a YouTube video using youtube-transcript-plus
   */
  public async fetchTranscript(videoId: string): Promise<{
    transcript: TranscriptSegment[];
    metadata: VideoMetadata;
  }> {
    try {
      const transcriptData = await fetchTranscript(videoId);
      
      // Transform the transcript data to match our interface
      const transcript: TranscriptSegment[] = transcriptData.map((item: { text: string; offset: number; duration: number }) => ({
        text: item.text,
        start: item.offset / 1000, // Convert milliseconds to seconds
        duration: item.duration / 1000 // Convert milliseconds to seconds
      }));

      // For now, we'll return basic metadata since youtube-transcript-plus doesn't provide video metadata
      // The API routes will handle fetching metadata from YouTube Data API
      const metadata: VideoMetadata = {
        title: `YouTube Video - ${videoId}`,
        description: '',
        channelTitle: '',
        duration: 0,
        thumbnail: '',
      };

      return {
        transcript,
        metadata
      };
    } catch (error) {
      throw new Error(`Failed to fetch transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if transcript is available for a YouTube video
   */
  public async checkTranscriptAvailability(videoId: string): Promise<boolean> {
    try {
      await fetchTranscript(videoId);
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
let transcriptPlusInstance: YouTubeTranscriptPlus | null = null;

export function getYouTubeTranscriptPlus(): YouTubeTranscriptPlus {
  if (!transcriptPlusInstance) {
    transcriptPlusInstance = new YouTubeTranscriptPlus();
  }
  return transcriptPlusInstance;
}

export async function cleanupTranscriptPlus(): Promise<void> {
  // No cleanup needed for youtube-transcript-plus
  transcriptPlusInstance = null;
} 