import { YoutubeTranscript } from 'youtube-transcript';

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface TranscriptResponse {
  transcript: TranscriptSegment[];
  videoId: string;
}

export class YouTubeTranscriptService {
  private proxyConfig: {
    host: string;
    port: number;
    auth?: {
      username: string;
      password: string;
    };
  } | null = null;

  constructor() {
    console.log('🔧 Initializing YouTube Transcript Service...');
    // Initialize proxy configuration from environment variables
    this.initializeProxyConfig();
    console.log('✅ YouTube Transcript Service initialized');
  }

  /**
   * Initialize proxy configuration from environment variables
   */
  private initializeProxyConfig(): void {
    console.log('🔧 Initializing proxy configuration...');
    const proxyHost = process.env.YOUTUBE_PROXY_HOST;
    const proxyPort = process.env.YOUTUBE_PROXY_PORT;
    const proxyUsername = process.env.YOUTUBE_PROXY_USERNAME;
    const proxyPassword = process.env.YOUTUBE_PROXY_PASSWORD;

    if (proxyHost && proxyPort) {
      console.log(`🌐 Proxy configuration found: ${proxyHost}:${proxyPort}`);
      this.proxyConfig = {
        host: proxyHost,
        port: parseInt(proxyPort, 10),
        ...(proxyUsername && proxyPassword && {
          auth: {
            username: proxyUsername,
            password: proxyPassword,
          },
        }),
      };
      if (proxyUsername && proxyPassword) {
        console.log('🔐 Proxy authentication configured');
      } else {
        console.log('ℹ️ No proxy authentication configured');
      }
    } else {
      console.log('ℹ️ No proxy configuration found, using direct connection');
    }
  }

  /**
   * Get transcript using youtube-transcript package with proxy support
   */
  async getTranscript(videoId: string): Promise<TranscriptResponse> {
    console.log(`🚀 Starting transcript fetch for video ID: ${videoId}`);
    
    try {
      // Configure proxy if available
      if (this.proxyConfig) {
        console.log('🌐 Configuring proxy for transcript fetch...');
        // Set proxy environment variables for the youtube-transcript package
        process.env.HTTP_PROXY = `http://${this.proxyConfig.host}:${this.proxyConfig.port}`;
        process.env.HTTPS_PROXY = `http://${this.proxyConfig.host}:${this.proxyConfig.port}`;
        console.log(`✅ HTTP_PROXY set to: ${process.env.HTTP_PROXY}`);
        console.log(`✅ HTTPS_PROXY set to: ${process.env.HTTPS_PROXY}`);
        
        if (this.proxyConfig.auth) {
          process.env.HTTP_PROXY_AUTH = `${this.proxyConfig.auth.username}:${this.proxyConfig.auth.password}`;
          process.env.HTTPS_PROXY_AUTH = `${this.proxyConfig.auth.username}:${this.proxyConfig.auth.password}`;
          console.log('✅ Proxy authentication environment variables set');
        }
      } else {
        console.log('ℹ️ No proxy configured, using direct connection');
      }

      // Get transcript using youtube-transcript package
      console.log('📖 Fetching transcript using youtube-transcript package...');
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'en',
      });
      console.log(`✅ Successfully fetched ${transcriptItems.length} transcript items`);

      // Convert to our format
      console.log('🔄 Converting transcript items to internal format...');
      const transcript: TranscriptSegment[] = transcriptItems.map((item, index) => {
        const segment = {
          text: item.text,
          start: item.offset / 1000, // Convert from milliseconds to seconds
          duration: item.duration / 1000, // Convert from milliseconds to seconds
        };
        console.log(`📝 Segment ${index + 1}: "${item.text.substring(0, 50)}${item.text.length > 50 ? '...' : ''}" at ${segment.start}s`);
        return segment;
      });

      console.log(`📊 Total transcript segments: ${transcript.length}`);
      console.log(`📄 Total transcript text length: ${transcript.reduce((acc, seg) => acc + seg.text.length, 0)} characters`);

      return {
        transcript,
        videoId,
      };
    } catch (error) {
      console.log('❌ Error fetching transcript:', error);
      
      // Handle specific youtube-transcript errors
      if (error instanceof Error) {
        console.log(`🔍 Error type: ${error.constructor.name}`);
        console.log(`📝 Error message: ${error.message}`);
        
        if (error.message.includes('Could not get transcripts')) {
          console.log('❌ No captions available for this video');
          throw new Error('No captions available for this video');
        }
        if (error.message.includes('Video unavailable')) {
          console.log('❌ Video is unavailable or private');
          throw new Error('Video is unavailable or private');
        }
        if (error.message.includes('Network error') || error.message.includes('ECONNRESET')) {
          console.log('❌ Network error - YouTube may be blocking requests');
          throw new Error('Network error - YouTube may be blocking requests. Try using a proxy.');
        }
      }
      
      console.log('❌ Unknown error occurred during transcript fetch');
      throw new Error(`Failed to get transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Clean up proxy environment variables
      if (this.proxyConfig) {
        console.log('🧹 Cleaning up proxy environment variables...');
        delete process.env.HTTP_PROXY;
        delete process.env.HTTPS_PROXY;
        delete process.env.HTTP_PROXY_AUTH;
        delete process.env.HTTPS_PROXY_AUTH;
        console.log('✅ Proxy environment variables cleaned up');
      }
    }
  }

  /**
   * Check if video has captions available
   */
  async hasCaptions(videoId: string): Promise<boolean> {
    console.log(`🔍 Checking caption availability for video ID: ${videoId}`);
    
    try {
      // Configure proxy if available
      if (this.proxyConfig) {
        console.log('🌐 Configuring proxy for caption check...');
        process.env.HTTP_PROXY = `http://${this.proxyConfig.host}:${this.proxyConfig.port}`;
        process.env.HTTPS_PROXY = `http://${this.proxyConfig.host}:${this.proxyConfig.port}`;
        console.log(`✅ HTTP_PROXY set to: ${process.env.HTTP_PROXY}`);
        console.log(`✅ HTTPS_PROXY set to: ${process.env.HTTPS_PROXY}`);
        
        if (this.proxyConfig.auth) {
          process.env.HTTP_PROXY_AUTH = `${this.proxyConfig.auth.username}:${this.proxyConfig.auth.password}`;
          process.env.HTTPS_PROXY_AUTH = `${this.proxyConfig.auth.username}:${this.proxyConfig.auth.password}`;
          console.log('✅ Proxy authentication environment variables set');
        }
      } else {
        console.log('ℹ️ No proxy configured for caption check');
      }

      console.log('📖 Attempting to fetch transcript list to check availability...');
      // Try to get transcript list to check availability
      const transcriptList = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'en',
      });

      const hasCaptions = transcriptList.length > 0;
      console.log(`📊 Found ${transcriptList.length} transcript items`);
      console.log(`✅ Caption availability: ${hasCaptions ? 'Available' : 'Not available'}`);
      
      return hasCaptions;
    } catch (error) {
      console.log('❌ Error checking captions availability:', error);
      
      if (error instanceof Error) {
        console.log(`🔍 Error type: ${error.constructor.name}`);
        console.log(`📝 Error message: ${error.message}`);
        
        if (error.message.includes('Could not get transcripts')) {
          console.log('❌ No captions available for this video');
        } else if (error.message.includes('Video unavailable')) {
          console.log('❌ Video is unavailable or private');
        } else if (error.message.includes('Network error') || error.message.includes('ECONNRESET')) {
          console.log('❌ Network error during caption check');
        }
      }
      
      console.log('❌ Caption check failed, assuming no captions available');
      return false;
    } finally {
      // Clean up proxy environment variables
      if (this.proxyConfig) {
        console.log('🧹 Cleaning up proxy environment variables...');
        delete process.env.HTTP_PROXY;
        delete process.env.HTTPS_PROXY;
        delete process.env.HTTP_PROXY_AUTH;
        delete process.env.HTTPS_PROXY_AUTH;
        console.log('✅ Proxy environment variables cleaned up');
      }
    }
  }

  /**
   * Update proxy configuration
   */
  setProxyConfig(config: {
    host: string;
    port: number;
    auth?: {
      username: string;
      password: string;
    };
  } | null): void {
    console.log('🔧 Updating proxy configuration...');
    if (config) {
      console.log(`🌐 New proxy config: ${config.host}:${config.port}`);
      if (config.auth) {
        console.log('🔐 Proxy authentication configured');
      }
    } else {
      console.log('ℹ️ Clearing proxy configuration');
    }
    this.proxyConfig = config;
    console.log('✅ Proxy configuration updated');
  }

  /**
   * Get current proxy configuration
   */
  getProxyConfig() {
    console.log('🔍 Getting current proxy configuration...');
    if (this.proxyConfig) {
      console.log(`🌐 Current proxy: ${this.proxyConfig.host}:${this.proxyConfig.port}`);
      if (this.proxyConfig.auth) {
        console.log('🔐 Proxy authentication is configured');
      }
    } else {
      console.log('ℹ️ No proxy configuration set');
    }
    return this.proxyConfig;
  }
}

// Singleton instance
let transcriptServiceInstance: YouTubeTranscriptService | null = null;

export function getYouTubeTranscriptService(): YouTubeTranscriptService {
  console.log('🔍 Getting YouTube Transcript Service instance...');
  if (!transcriptServiceInstance) {
    console.log('🆕 Creating new YouTube Transcript Service instance...');
    transcriptServiceInstance = new YouTubeTranscriptService();
  } else {
    console.log('✅ Using existing YouTube Transcript Service instance');
  }
  return transcriptServiceInstance;
}

export async function cleanupYouTubeTranscriptService(): Promise<void> {
  console.log('🧹 Cleaning up YouTube Transcript Service...');
  transcriptServiceInstance = null;
  console.log('✅ YouTube Transcript Service cleaned up');
} 