import { google } from 'googleapis';
import { getGoogleAuthService } from './google-auth';
import { getUser } from './auth';

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  duration: number;
  viewCount: number;
  likeCount: number;
  thumbnail: string;
  tags: string[];
}

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface TranscriptResponse {
  transcript: TranscriptSegment[];
  metadata: VideoMetadata;
  videoId: string;
}

export class YouTubeApiService {
  /**
   * Get video metadata using OAuth authentication
   */
  async getVideoMetadata(videoId: string): Promise<VideoMetadata> {
    try {
      // Check if user is authenticated
      const user = await getUser();
      if (!user) {
        throw new Error('User must be authenticated to access YouTube API');
      }

      const googleAuth = getGoogleAuthService();
      const youtube = await googleAuth.createYouTubeClient();

      const response = await youtube.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: [videoId],
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = response.data.items[0];
      const snippet = video.snippet;
      const contentDetails = video.contentDetails;
      const statistics = video.statistics;

      // Parse duration (ISO 8601 format)
      const duration = contentDetails?.duration;
      let durationInSeconds = 0;
      if (duration) {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (match) {
          const hours = parseInt(match[1] || '0');
          const minutes = parseInt(match[2] || '0');
          const seconds = parseInt(match[3] || '0');
          durationInSeconds = hours * 3600 + minutes * 60 + seconds;
        }
      }

      return {
        id: videoId,
        title: snippet?.title || '',
        description: snippet?.description || '',
        channelTitle: snippet?.channelTitle || '',
        publishedAt: snippet?.publishedAt || '',
        duration: durationInSeconds,
        viewCount: statistics?.viewCount ? parseInt(statistics.viewCount) : 0,
        likeCount: statistics?.likeCount ? parseInt(statistics.likeCount) : 0,
        thumbnail: snippet?.thumbnails?.maxres?.url || 
                  snippet?.thumbnails?.high?.url || 
                  snippet?.thumbnails?.medium?.url || 
                  snippet?.thumbnails?.default?.url || '',
        tags: snippet?.tags || [],
      };
    } catch (error) {
      console.error('Error fetching video metadata:', error);
      throw new Error(`Failed to fetch video metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get video captions/transcripts using OAuth authentication
   */
  async getVideoCaptions(videoId: string): Promise<TranscriptSegment[]> {
    try {
      // Check if user is authenticated
      const user = await getUser();
      if (!user) {
        throw new Error('User must be authenticated to access YouTube API');
      }

      const googleAuth = getGoogleAuthService();
      const youtube = await googleAuth.createYouTubeClient();

      // First, get available captions for the video
      const captionsResponse = await youtube.captions.list({
        part: ['snippet'],
        videoId: videoId,
      });

      if (!captionsResponse.data.items || captionsResponse.data.items.length === 0) {
        throw new Error('No captions available for this video');
      }

      // Find the best caption track (prefer auto-generated English)
      const captionTrack = captionsResponse.data.items.find(
        caption => caption.snippet?.language === 'en' && caption.snippet?.trackKind === 'ASR'
      ) || captionsResponse.data.items[0];

      if (!captionTrack?.id) {
        throw new Error('No suitable caption track found');
      }

      // Download the caption content
      const captionResponse = await youtube.captions.download({
        id: captionTrack.id,
        tfmt: 'srt', // SubRip format for easier parsing
      });

      if (!captionResponse.data) {
        throw new Error('Failed to download caption content');
      }

      // Parse SRT format and convert to our format
      const srtContent = captionResponse.data as string;
      return this.parseSRTContent(srtContent);
    } catch (error) {
      console.error('Error fetching video captions:', error);
      throw new Error(`Failed to fetch video captions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse SRT caption content into our transcript format
   */
  private parseSRTContent(srtContent: string): TranscriptSegment[] {
    const segments: TranscriptSegment[] = [];
    const blocks = srtContent.trim().split('\n\n');

    for (const block of blocks) {
      const lines = block.split('\n');
      if (lines.length < 3) continue;

      // Skip the sequence number (first line)
      const timeLine = lines[1];
      const text = lines.slice(2).join('\n').trim();

      if (!timeLine || !text) continue;

      // Parse time format: 00:00:00,000 --> 00:00:00,000
      const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/);
      if (!timeMatch) continue;

      const startTime = this.parseTimeToSeconds(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4]);
      const endTime = this.parseTimeToSeconds(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8]);
      const duration = endTime - startTime;

      segments.push({
        text,
        start: startTime,
        duration,
      });
    }

    return segments;
  }

  /**
   * Parse time components to seconds
   */
  private parseTimeToSeconds(hours: string, minutes: string, seconds: string, milliseconds: string): number {
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000;
  }

  /**
   * Get complete transcript with metadata
   */
  async getTranscript(videoId: string): Promise<TranscriptResponse> {
    try {
      const [metadata, transcript] = await Promise.all([
        this.getVideoMetadata(videoId),
        this.getVideoCaptions(videoId),
      ]);

      return {
        transcript,
        metadata,
        videoId,
      };
    } catch (error) {
      console.error('Error getting transcript:', error);
      throw new Error(`Failed to get transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if video has captions available
   */
  async hasCaptions(videoId: string): Promise<boolean> {
    try {
      const user = await getUser();
      if (!user) {
        return false;
      }

      const googleAuth = getGoogleAuthService();
      const youtube = await googleAuth.createYouTubeClient();

      const response = await youtube.captions.list({
        part: ['snippet'],
        videoId: videoId,
      });

      return !!(response.data.items && response.data.items.length > 0);
    } catch (error) {
      console.error('Error checking captions availability:', error);
      return false;
    }
  }
}

// Singleton instance
let youtubeApiInstance: YouTubeApiService | null = null;

export function getYouTubeApiService(): YouTubeApiService {
  if (!youtubeApiInstance) {
    youtubeApiInstance = new YouTubeApiService();
  }
  return youtubeApiInstance;
}

export async function cleanupYouTubeApiService(): Promise<void> {
  youtubeApiInstance = null;
} 