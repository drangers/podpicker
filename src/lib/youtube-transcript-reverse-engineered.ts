import axios, { AxiosInstance } from 'axios';

export interface TranscriptSegment {
  start: number;
  duration: number;
  text: string;
}

export interface YouTubeTranscript {
  videoId: string;
  title: string;
  segments: TranscriptSegment[];
  fullText: string;
}

export interface YouTubeTranscriptIOResponse {
  success: Array<{
    id: string;
    title: string;
    microformat: {
      playerMicroformatRenderer: {
        thumbnail: {
          thumbnails: Array<{
            url: string;
            width: number;
            height: number;
          }>;
        };
        embed: {
          iframeUrl: string;
        };
      };
    };
    tracks: Array<{
      language: string;
      transcript: Array<{
        text: string;
        start: string;
        dur: string;
      }>;
    }>;
  }>;
  failed: string[];
}

export class YouTubeTranscriptReverseEngineered {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://www.youtube-transcript.io',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/json',
        'Origin': 'https://www.youtube-transcript.io',
        'Referer': 'https://www.youtube-transcript.io/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
      },
    });
  }

  private extractVideoId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  }

  private async getAuthToken(): Promise<string> {
    if (this.authToken) {
      return this.authToken;
    }

    try {
      // Simulate the Firebase auth process that youtube-transcript.io uses
      // This is a simplified version - in practice, you'd need to implement the full Firebase auth flow
      const authResponse = await axios.post('https://identitytoolkit.googleapis.com/v1/accounts:signUp', {
        returnSecureToken: true
      }, {
        params: {
          key: 'AIzaSyC02AJ8YNuHAUKTf8e8u8orfZwTrLmqBeo'
        }
      });

      this.authToken = authResponse.data.idToken || '';
      return this.authToken || '';
    } catch (error) {
      console.log('Failed to get auth token, proceeding without authentication');
      return '';
    }
  }

  private generateIsHumanToken(): string {
    // This is a simplified version of the x-is-human token
    // In practice, this would be a more complex implementation
    const timestamp = Date.now();
    const randomValue = Math.random();
    
    return JSON.stringify({
      b: 1,
      v: randomValue,
      e: `eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..${Math.random().toString(36).substring(2)}.${Math.random().toString(36).substring(2)}`,
      s: Math.random().toString(36).substring(2),
      d: 0,
      vr: "1"
    });
  }

  async getTranscript(videoUrl: string): Promise<YouTubeTranscript> {
    const videoId = this.extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    console.log(`🎬 Extracting transcript for video ID: ${videoId}`);

    try {
      // Get authentication token
      const authToken = await this.getAuthToken();

      // Prepare headers similar to youtube-transcript.io
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/json',
        'Origin': 'https://www.youtube-transcript.io',
        'Referer': 'https://www.youtube-transcript.io/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'x-request-channel': '9527-c',
        'x-is-human': this.generateIsHumanToken(),
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      // Make the API request similar to youtube-transcript.io
      const response = await this.client.post('/api/transcripts/v2', {
        ids: [videoId]
      }, {
        headers
      });

      console.log('✅ Successfully received response from transcript API');

      const data: YouTubeTranscriptIOResponse = response.data;

      if (!data.success || data.success.length === 0) {
        throw new Error('No transcript available for this video');
      }

      const videoData = data.success[0];
      const tracks = videoData.tracks;

      if (!tracks || tracks.length === 0) {
        throw new Error('No transcript tracks found');
      }

      console.log('🌍 Available languages:', tracks.map(t => t.language));

      // Find English transcript (prefer auto-generated, then manual)
      let selectedTrack = tracks.find(t => t.language === 'English - English') ||
                         tracks.find(t => t.language === 'English (auto-generated)') ||
                         tracks.find(t => t.language.includes('English')) ||
                         tracks.find(t => t.language === 'English') ||
                         tracks[0]; // fallback to first available

      console.log('📝 Selected transcript language:', selectedTrack?.language);

      if (!selectedTrack || !selectedTrack.transcript || selectedTrack.transcript.length === 0) {
        throw new Error('No transcript segments found');
      }

      // Convert to our format
      const segments: TranscriptSegment[] = selectedTrack.transcript.map(segment => ({
        start: parseFloat(segment.start),
        duration: parseFloat(segment.dur),
        text: segment.text
      }));

      const fullText = segments.map(segment => segment.text).join(' ');

      return {
        videoId,
        title: videoData.title,
        segments,
        fullText
      };

    } catch (error) {
      console.error('❌ Error extracting transcript:', error);
      
      // Fallback to our existing implementation
      console.log('🔄 Falling back to existing implementation...');
      return await this.fallbackToExistingImplementation(videoUrl);
    }
  }

  private async fallbackToExistingImplementation(videoUrl: string): Promise<YouTubeTranscript> {
    // Import and use the existing implementation as fallback
    const { scrapeYouTubeTranscriptUnified } = await import('./youtube-transcript-unified');
    return await scrapeYouTubeTranscriptUnified(videoUrl);
  }

  // Alternative method: Direct YouTube API approach
  async getTranscriptDirect(videoUrl: string): Promise<YouTubeTranscript> {
    const videoId = this.extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    console.log(`🎬 Using direct YouTube API approach for video ID: ${videoId}`);

    try {
      // Method 1: Try the timedtext API
      const timedTextUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=srv3`;
      
      const response = await axios.get(timedTextUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });

      if (response.status === 200 && response.data) {
        const xmlText = response.data;
        const segments = this.parseTimedTextXML(xmlText);
        
        if (segments.length > 0) {
          const fullText = segments.map(segment => segment.text).join(' ');
          
          return {
            videoId,
            title: `YouTube Video ${videoId}`,
            segments,
            fullText
          };
        }
      }

      // Method 2: Try to extract from video page
      return await this.extractFromVideoPage(videoUrl);

    } catch (error) {
      console.error('❌ Error with direct approach:', error);
      throw new Error(`Failed to extract transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseTimedTextXML(xmlText: string): TranscriptSegment[] {
    const segments: TranscriptSegment[] = [];
    
    // Parse XML to extract text segments with timestamps
    const textMatches = xmlText.match(/<text[^>]*>([^<]+)<\/text>/g);
    
    if (textMatches) {
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
    }
    
    return segments;
  }

  private async extractFromVideoPage(videoUrl: string): Promise<YouTubeTranscript> {
    const videoId = this.extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    try {
      const response = await axios.get(videoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      const html = response.data;
      
      // Look for captionTracks in the page source
      const captionMatch = html.match(/"captionTracks":\s*(\[[^\]]+\])/);
      if (captionMatch) {
        const captionTracks = JSON.parse(captionMatch[1]);
        
        for (const track of captionTracks) {
          if (track.baseUrl) {
            try {
              const transcriptResponse = await axios.get(track.baseUrl);
              const transcriptXml = transcriptResponse.data;
              const segments = this.parseTimedTextXML(transcriptXml);
              
              if (segments.length > 0) {
                const fullText = segments.map(segment => segment.text).join(' ');
                
                return {
                  videoId,
                  title: `YouTube Video ${videoId}`,
                  segments,
                  fullText
                };
              }
            } catch (error) {
              console.log(`Failed to fetch transcript from ${track.baseUrl}`);
            }
          }
        }
      }
      
      throw new Error('No transcript found in video page');
      
    } catch (error) {
      throw new Error(`Failed to extract from video page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Utility function to create and use the reverse-engineered scraper
export async function scrapeYouTubeTranscriptReverseEngineered(videoUrl: string): Promise<YouTubeTranscript> {
  console.log('🚀 Starting reverse-engineered YouTube transcript extraction...');
  console.log(`📹 Video URL: ${videoUrl}`);
  
  const scraper = new YouTubeTranscriptReverseEngineered();
  
  try {
    // First try the youtube-transcript.io approach
    console.log('🔍 Trying youtube-transcript.io approach...');
    const result = await scraper.getTranscript(videoUrl);
    console.log('✅ Reverse-engineered approach successful');
    return result;
  } catch (error) {
    console.log('❌ youtube-transcript.io approach failed, trying direct YouTube API...');
    
    try {
      // Fallback to direct YouTube API approach
      const result = await scraper.getTranscriptDirect(videoUrl);
      console.log('✅ Direct YouTube API approach successful');
      return result;
    } catch (directError) {
      console.log('❌ Direct approach also failed, using existing implementation...');
      
      // Final fallback to existing implementation
      const { scrapeYouTubeTranscriptUnified } = await import('./youtube-transcript-unified');
      return await scrapeYouTubeTranscriptUnified(videoUrl);
    }
  }
} 