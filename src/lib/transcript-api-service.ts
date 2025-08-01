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

export interface TranscriptApiResponse {
  transcript: TranscriptSegment[];
  metadata: VideoMetadata;
  videoId: string;
}

export interface TranscriptApiConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  useOAuth?: boolean;
}

export class TranscriptApiService {
  private config: TranscriptApiConfig;

  constructor(config: TranscriptApiConfig = {}) {
    this.config = {
      timeout: 30000, // 30 seconds default
      useOAuth: false, // Default to API key authentication
      ...config
    };
  }

  /**
   * Extract transcript using RapidAPI YouTube Transcript API
   */
  async fetchTranscriptRapidAPI(videoId: string): Promise<TranscriptApiResponse> {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      throw new Error('RAPIDAPI_KEY environment variable is required');
    }

    const url = 'https://youtube-transcript-api.p.rapidapi.com/transcript';
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'youtube-transcript-api.p.rapidapi.com'
      },
      params: {
        video_id: videoId
      }
    };

    try {
      const response = await fetch(`${url}?video_id=${videoId}`, {
        method: 'GET',
        headers: options.headers,
        signal: AbortSignal.timeout(this.config.timeout || 30000)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Transform the response to match our interface
      const transcript: TranscriptSegment[] = data.transcript?.map((item: any) => ({
        text: item.text || '',
        start: item.start || 0,
        duration: item.duration || 0
      })) || [];

      const metadata: VideoMetadata = {
        title: data.title || `YouTube Video - ${videoId}`,
        description: data.description || '',
        channelTitle: data.channelTitle || '',
        duration: data.duration || 0,
        thumbnail: data.thumbnail || '',
      };

      return {
        transcript,
        metadata,
        videoId
      };
    } catch (error) {
      throw new Error(`RapidAPI transcript extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract transcript using AssemblyAI (if you have an account)
   */
  async fetchTranscriptAssemblyAI(videoId: string): Promise<TranscriptApiResponse> {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      throw new Error('ASSEMBLYAI_API_KEY environment variable is required');
    }

    // First, we need to get the audio URL from YouTube
    const audioUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    try {
      // Submit transcription request
      const submitResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audio_url: audioUrl,
          language_code: 'en'
        }),
        signal: AbortSignal.timeout(this.config.timeout || 30000)
      });

      if (!submitResponse.ok) {
        throw new Error(`AssemblyAI submit failed: ${submitResponse.status}`);
      }

      const submitData = await submitResponse.json();
      const transcriptId = submitData.id;

      // Poll for completion
      let transcriptData = null;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes with 5-second intervals

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

        const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
          headers: {
            'Authorization': apiKey
          }
        });

        if (!statusResponse.ok) {
          throw new Error(`AssemblyAI status check failed: ${statusResponse.status}`);
        }

        transcriptData = await statusResponse.json();

        if (transcriptData.status === 'completed') {
          break;
        } else if (transcriptData.status === 'error') {
          throw new Error(`AssemblyAI transcription failed: ${transcriptData.error}`);
        }

        attempts++;
      }

      if (!transcriptData || transcriptData.status !== 'completed') {
        throw new Error('AssemblyAI transcription timed out');
      }

      // Transform the response
      const transcript: TranscriptSegment[] = transcriptData.words?.map((word: any) => ({
        text: word.text,
        start: word.start / 1000, // Convert to seconds
        duration: (word.end - word.start) / 1000
      })) || [];

      const metadata: VideoMetadata = {
        title: `YouTube Video - ${videoId}`,
        description: '',
        channelTitle: '',
        duration: transcriptData.audio_duration || 0,
        thumbnail: '',
      };

      return {
        transcript,
        metadata,
        videoId
      };
    } catch (error) {
      throw new Error(`AssemblyAI transcript extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract transcript using a custom API endpoint
   */
  async fetchTranscriptCustomAPI(videoId: string): Promise<TranscriptApiResponse> {
    const apiUrl = process.env.CUSTOM_TRANSCRIPT_API_URL;
    const apiKey = process.env.CUSTOM_TRANSCRIPT_API_KEY;

    if (!apiUrl) {
      throw new Error('CUSTOM_TRANSCRIPT_API_URL environment variable is required');
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          videoId,
          platform: 'youtube'
        }),
        signal: AbortSignal.timeout(this.config.timeout || 30000)
      });

      if (!response.ok) {
        throw new Error(`Custom API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Transform the response to match our interface
      const transcript: TranscriptSegment[] = data.transcript?.map((item: any) => ({
        text: item.text || '',
        start: item.start || 0,
        duration: item.duration || 0
      })) || [];

      const metadata: VideoMetadata = {
        title: data.title || `YouTube Video - ${videoId}`,
        description: data.description || '',
        channelTitle: data.channelTitle || '',
        duration: data.duration || 0,
        thumbnail: data.thumbnail || '',
      };

      return {
        transcript,
        metadata,
        videoId
      };
    } catch (error) {
      throw new Error(`Custom API transcript extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Main method to fetch transcript using the configured service
   */
  async fetchTranscript(videoId: string, service: 'rapidapi' | 'assemblyai' | 'custom' | 'oauth' = 'rapidapi'): Promise<TranscriptApiResponse> {
    switch (service) {
      case 'rapidapi':
        return this.fetchTranscriptRapidAPI(videoId);
      case 'assemblyai':
        return this.fetchTranscriptAssemblyAI(videoId);
      case 'custom':
        return this.fetchTranscriptCustomAPI(videoId);
      case 'oauth':
        return this.fetchTranscriptOAuth(videoId);
      default:
        throw new Error(`Unknown transcript service: ${service}`);
    }
  }

  /**
   * Extract transcript using OAuth-authenticated YouTube API
   */
  async fetchTranscriptOAuth(videoId: string): Promise<TranscriptApiResponse> {
    try {
      // Import the YouTube API service dynamically to avoid circular dependencies
      const { getYouTubeApiService } = await import('./youtube-api-service');
      const youtubeApi = getYouTubeApiService();
      
      const response = await youtubeApi.getTranscript(videoId);
      
      return {
        transcript: response.transcript,
        metadata: {
          title: response.metadata.title,
          description: response.metadata.description,
          channelTitle: response.metadata.channelTitle,
          duration: response.metadata.duration,
          thumbnail: response.metadata.thumbnail,
        },
        videoId: response.videoId,
      };
    } catch (error) {
      throw new Error(`OAuth transcript extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if transcript is available using the configured service
   */
  async checkTranscriptAvailability(videoId: string, service: 'rapidapi' | 'assemblyai' | 'custom' | 'oauth' = 'rapidapi'): Promise<boolean> {
    try {
      await this.fetchTranscript(videoId, service);
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
let transcriptApiInstance: TranscriptApiService | null = null;

export function getTranscriptApiService(): TranscriptApiService {
  if (!transcriptApiInstance) {
    transcriptApiInstance = new TranscriptApiService();
  }
  return transcriptApiInstance;
}

export async function cleanupTranscriptApiService(): Promise<void> {
  transcriptApiInstance = null;
} 