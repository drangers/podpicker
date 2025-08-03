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
   * Get video metadata using provided access token
   */
  async getVideoMetadataWithToken(videoId: string, accessToken: string): Promise<VideoMetadata> {
    try {
      const { google } = await import('googleapis');
      
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: accessToken,
      });

      const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client,
      });

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
      console.error('Error fetching video metadata with token:', error);
      throw new Error(`Failed to fetch video metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get video captions/transcripts using YouTube's direct timedtext API
   * This approach doesn't require authentication
   */
  async getVideoCaptions(videoId: string): Promise<TranscriptSegment[]> {
    try {
      // First, get available caption tracks
      const tracksUrl = `https://www.youtube.com/api/timedtext?type=list&v=${videoId}`;
      const tracksResponse = await fetch(tracksUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      });
      
      if (!tracksResponse.ok) {
        throw new Error(`Failed to fetch caption tracks: ${tracksResponse.status} ${tracksResponse.statusText}`);
      }
      
      const tracksXml = await tracksResponse.text();
      
      // Check if response is empty (YouTube might be blocking the request)
      if (!tracksXml.trim()) {
        throw new Error('YouTube timedtext API returned empty response. This may be due to rate limiting or access restrictions.');
      }
      
      const tracks = this.parseCaptionTracks(tracksXml);
      
      if (tracks.length === 0) {
        throw new Error('No captions available for this video');
      }

      // Find the best caption track (prefer English auto-generated)
      const bestTrack = tracks.find(track => 
        track.lang_code === 'en' && track.kind === 'asr'
      ) || tracks.find(track => 
        track.lang_code === 'en'
      ) || tracks[0];

      if (!bestTrack) {
        throw new Error('No suitable caption track found');
      }

      // Download the caption content
      const captionUrl = `https://www.youtube.com/api/timedtext?lang=${bestTrack.lang_code}&v=${videoId}`;
      const captionResponse = await fetch(captionUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      });

      if (!captionResponse.ok) {
        throw new Error(`Failed to download caption content: ${captionResponse.status} ${captionResponse.statusText}`);
      }

      const captionXml = await captionResponse.text();
      
      // Check if caption content is empty
      if (!captionXml.trim()) {
        throw new Error('YouTube timedtext API returned empty caption content. This may be due to rate limiting or access restrictions.');
      }
      
      return this.parseTimedTextXml(captionXml);
    } catch (error) {
      console.error('Error fetching video captions:', error);
      throw new Error(`Failed to fetch video captions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get video captions/transcripts using provided access token
   */
  async getVideoCaptionsWithToken(videoId: string, accessToken: string): Promise<TranscriptSegment[]> {
    try {
      const { google } = await import('googleapis');
      
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: accessToken,
      });

      const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client,
      });

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
      console.error('Error fetching video captions with token:', error);
      throw new Error(`Failed to fetch video captions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse caption tracks XML to get available languages
   */
  private parseCaptionTracks(xml: string): Array<{lang_code: string; lang_original: string; kind?: string}> {
    const tracks: Array<{lang_code: string; lang_original: string; kind?: string}> = [];
    
    // Simple XML parsing for track list
    const trackMatches = xml.match(/<track[^>]*>/g);
    if (!trackMatches) return tracks;

    for (const match of trackMatches) {
      const langCodeMatch = match.match(/lang_code="([^"]*)"/);
      const langOriginalMatch = match.match(/lang_original="([^"]*)"/);
      const kindMatch = match.match(/kind="([^"]*)"/);
      
      if (langCodeMatch && langOriginalMatch) {
        tracks.push({
          lang_code: langCodeMatch[1],
          lang_original: langOriginalMatch[1],
          kind: kindMatch ? kindMatch[1] : undefined
        });
      }
    }

    return tracks;
  }

  /**
   * Parse timedtext XML content into our transcript format
   */
  private parseTimedTextXml(xml: string): TranscriptSegment[] {
    const segments: TranscriptSegment[] = [];
    
    // Parse XML to extract text elements with timing
    const textMatches = xml.match(/<text[^>]*>([^<]*)<\/text>/g);
    if (!textMatches) return segments;

    for (const match of textMatches) {
      // Extract timing attributes
      const startMatch = match.match(/start="([^"]*)"/);
      const durMatch = match.match(/dur="([^"]*)"/);
      
      if (startMatch && durMatch) {
        const start = parseFloat(startMatch[1]) / 1000; // Convert from milliseconds to seconds
        const duration = parseFloat(durMatch[1]) / 1000;
        
        // Extract text content
        const textMatch = match.match(/<text[^>]*>([^<]*)<\/text>/);
        if (textMatch && textMatch[1].trim()) {
          segments.push({
            text: textMatch[1].trim(),
            start,
            duration,
          });
        }
      }
    }

    return segments;
  }

  /**
   * Parse SRT (SubRip) format content into our transcript format
   */
  private parseSRTContent(srtContent: string): TranscriptSegment[] {
    const segments: TranscriptSegment[] = [];
    const lines = srtContent.split('\n');
    
    let currentSegment: Partial<TranscriptSegment> = {};
    let lineIndex = 0;
    
    while (lineIndex < lines.length) {
      const line = lines[lineIndex].trim();
      
      // Skip empty lines
      if (!line) {
        lineIndex++;
        continue;
      }
      
      // Check if this is a subtitle number (just a number)
      if (/^\d+$/.test(line)) {
        // Next line should be timestamp
        lineIndex++;
        if (lineIndex < lines.length) {
          const timestampLine = lines[lineIndex].trim();
          const timestampMatch = timestampLine.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
          
          if (timestampMatch) {
            const startTime = this.parseSRTTime(timestampMatch[1]);
            const endTime = this.parseSRTTime(timestampMatch[2]);
            const duration = endTime - startTime;
            
            currentSegment = {
              start: startTime,
              duration,
              text: ''
            };
            
            // Next lines should be the subtitle text
            lineIndex++;
            const textLines: string[] = [];
            
            while (lineIndex < lines.length && lines[lineIndex].trim() && !/^\d+$/.test(lines[lineIndex].trim())) {
              textLines.push(lines[lineIndex].trim());
              lineIndex++;
            }
            
            if (textLines.length > 0) {
              currentSegment.text = textLines.join(' ');
              segments.push(currentSegment as TranscriptSegment);
            }
          }
        }
      }
      
      lineIndex++;
    }
    
    return segments;
  }

  /**
   * Parse SRT timestamp format (HH:MM:SS,mmm) to seconds
   */
  private parseSRTTime(timestamp: string): number {
    const match = timestamp.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    if (!match) return 0;
    
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);
    const milliseconds = parseInt(match[4], 10);
    
    return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
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
   * Get complete transcript with metadata using provided access token
   */
  async getTranscriptWithToken(videoId: string, accessToken: string): Promise<TranscriptResponse> {
    try {
      const [metadata, transcript] = await Promise.all([
        this.getVideoMetadataWithToken(videoId, accessToken),
        this.getVideoCaptionsWithToken(videoId, accessToken),
      ]);

      return {
        transcript,
        metadata,
        videoId,
      };
    } catch (error) {
      console.error('Error getting transcript with token:', error);
      throw new Error(`Failed to get transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if video has captions available using direct timedtext API
   */
  async hasCaptions(videoId: string): Promise<boolean> {
    try {
      const tracksUrl = `https://www.youtube.com/api/timedtext?type=list&v=${videoId}`;
      const response = await fetch(tracksUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      });
      
      if (!response.ok) {
        return false;
      }
      
      const tracksXml = await response.text();
      
      // Check if response is empty
      if (!tracksXml.trim()) {
        return false;
      }
      
      const tracks = this.parseCaptionTracks(tracksXml);
      return tracks.length > 0;
    } catch (error) {
      console.error('Error checking captions availability:', error);
      return false;
    }
  }

  /**
   * Check if video has captions available using provided access token
   */
  async hasCaptionsWithToken(videoId: string, accessToken: string): Promise<boolean> {
    try {
      const { google } = await import('googleapis');
      
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: accessToken,
      });

      const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client,
      });

      const response = await youtube.captions.list({
        part: ['snippet'],
        videoId: videoId,
      });

      return !!(response.data.items && response.data.items.length > 0);
    } catch (error) {
      console.error('Error checking captions availability with token:', error);
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