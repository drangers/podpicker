import axios from 'axios';
import * as cheerio from 'cheerio';

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

/**
 * Generates a random hex string.
 * @param {number} size - Length of hex string
 * @returns A random hex string
 */
function generateRandomHex(size: number): string {
  return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

class TranscriptClient {
  ready: Promise<void>;
  #instance: any;
  #firebase_cfg_creds: any;

  constructor(AxiosOptions?: any) {
    this.#instance = axios.create({
      ...(AxiosOptions || {}),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:139.0) Gecko/20100101 Firefox/139.0",
        ...(AxiosOptions?.headers || {})
      },
      baseURL: "https://www.youtube-transcript.io/"
    });

    // Promise-based ready event trigger system
    this.ready = new Promise(async resolve => {
      this.#firebase_cfg_creds = await this.#get_firebase_cfg_creds();
      resolve();
    });
  }

  /**
   * Gets Google Firebase configuration credentials
   * @returns Firebase auth details
   */
  #get_firebase_cfg_creds() {
    return (async () => {
      const { data } = await this.#instance.get("/");
      const $ = cheerio.load(data);

      for (const elem of $("script[src]").toArray()) {
        const url = $(elem).attr("src");
        const { data: script } = await this.#instance.get(url);

        const match = script.match(/\(\{[^}]*apiKey:"([^"]+)"[^}]*\}\)/gm);
        if (match) return Function("return " + match[0])();
      }
    })();
  }

  /**
   * Gets API authorization details from the Google Identity Platform
   * @returns SignupNewUserResponse
   */
  #get_auth() {
    const creds = this.#firebase_cfg_creds;
    if (!creds) throw new Error("client not fully initialized!");

    const url = new URL("https://identitytoolkit.googleapis.com/v1/accounts:signUp");
    url.searchParams.set("key", creds.apiKey);

    return (async () => {
      const { data } = await this.#instance.post(url, {
        returnSecureToken: true
      }, {
        headers: {
          "X-Client-Version": "Firefox/JsCore/10.14.1/FirebaseCore-web",
          "X-Firebase-Client": JSON.stringify({
            "version": 2,
            "heartbeats": [
              {
                "agent": "fire-core/0.10.13 fire-core-esm2017/0.10.13 fire-js/ fire-js-all-app/10.14.1 fire-auth/1.7.9 fire-auth-esm2017/1.7.9",
                "dates": [
                  new Date().toISOString().split('T')[0]
                ]
              }
            ]
          }),
          "X-Firebase-gmpid": creds.appId.slice(2)
        }
      });
      return data;
    })();
  }

  /**
   * Gets x-client-context value
   * @param {string} id - The YouTube video ID
   * @returns Firebase auth details
   */
  #get_x_client_context(id: string) {
    return (async () => {
      const { data } = await this.#instance.get("/videos/" + id);
      const $ = cheerio.load(data);

      for (const elem of $("script[src]").toArray()) {
        const url = $(elem).attr("src");
        const { data: script } = await this.#instance.get(url);
        const match = script.match(/"([^"]+)"\s*:\s*"([^"]+)"\},body:JSON\.stringify\(\{ids:\[t\]\}\)/gm);
        if (match) {
          const nextMatch = match[0].match(/"([^"]+)"\s*:\s*"([^"]+)"/);
          return [nextMatch[1], nextMatch[2]];
        }
      }
    })();
  }

  /**
   * Retrieves the transcript of a particular video.
   * @param {string} id - The YouTube video ID
   * @param {object} [config] - Request configurations for the Axios HTTP client
   * @returns A Promise that resolves to the transcript object
   */
  async getTranscript(id: string, config?: any) {
    const auth = await this.#get_auth();
    const x_header = await this.#get_x_client_context(id);

    try {
      const { data } = await this.#instance.post("/api/transcripts", {
        ids: [id]
      }, {
        ...(config || {}),
        headers: {
          ...(config?.headers || {}),
          Authorization: "Bearer " + auth.idToken,
          ...(x_header && { [x_header[0]]: x_header[1] }),
          'X-Hash': generateRandomHex(64)
        }
      });

      return data[0];
    } catch (e: any) {
      if (e.status == 403) throw new Error('invalid video ID');
      else throw e;
    }
  }

  /**
   * Retrieves the transcript of multiple videos.
   * @param {string[]} ids - A list of YouTube video IDs
   * @param {object} [config] - Request configurations for the Axios HTTP client
   * @returns A Promise that resolves to an array of transcript objects
   */
  async bulkGetTranscript(ids: string[], config?: any) {
    const auth = await this.#get_auth();
    const x_header = await this.#get_x_client_context(ids[0]);

    try {
      const { data } = await this.#instance.post("/api/transcripts", {
        ids
      }, {
        ...(config || {}),
        headers: {
          ...(config?.headers || {}),
          Authorization: "Bearer " + auth.idToken,
          ...(x_header && { [x_header[0]]: x_header[1] }),
          'X-Hash': generateRandomHex(64)
        }
      });

      return data;
    } catch (e: any) {
      if (e.status == 403) throw new Error('video not found or unavailable');
      else throw e;
    }
  }
}

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : '';
}

/**
 * Get video title using YouTube Data API or fallback method
 */
async function getVideoTitle(videoId: string): Promise<string> {
  try {
    // Try to get title from YouTube page
    const response = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
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
 * Convert transcript data to our standard format
 */
function convertTranscriptToSegments(transcriptData: any): TranscriptSegment[] {
  if (!transcriptData || !transcriptData.transcript) {
    return [];
  }

  return transcriptData.transcript.map((segment: any) => ({
    start: segment.start || 0,
    duration: segment.duration || 0,
    text: segment.text || ''
  }));
}

/**
 * Main function to scrape YouTube transcript using the proven API approach
 */
export async function scrapeYouTubeTranscript(videoUrl: string): Promise<YouTubeTranscript> {
  console.log('🚀 Starting YouTube transcript scraping with API approach...');
  console.log(`📹 Video URL: ${videoUrl}`);
  
  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }
  
  console.log(`🎬 Video ID: ${videoId}`);
  
  try {
    // Initialize the transcript client
    console.log('🔧 Initializing transcript client...');
    const client = new TranscriptClient();
    await client.ready;
    console.log('✅ Transcript client initialized');
    
    // Get transcript data
    console.log('📖 Fetching transcript data...');
    const transcriptData = await client.getTranscript(videoId);
    console.log('✅ Transcript data fetched successfully');
    
    // Get video title
    console.log('📝 Getting video title...');
    const title = await getVideoTitle(videoId);
    console.log(`✅ Video title: "${title}"`);
    
    // Convert to our standard format
    console.log('🔄 Converting transcript to standard format...');
    const segments = convertTranscriptToSegments(transcriptData);
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