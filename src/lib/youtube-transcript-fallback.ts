import { TranscriptSegment, YouTubeTranscript } from './youtube-transcript-api';

const RE_YOUTUBE = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)';
const RE_XML_TRANSCRIPT = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;

export class YoutubeTranscriptError extends Error {
  constructor(message: string) {
    super(`[YoutubeTranscript] 🚨 ${message}`);
  }
}

export class YoutubeTranscriptTooManyRequestError extends YoutubeTranscriptError {
  constructor() {
    super('YouTube is receiving too many requests from this IP and now requires solving a captcha to continue');
  }
}

export class YoutubeTranscriptVideoUnavailableError extends YoutubeTranscriptError {
  constructor(videoId: string) {
    super(`The video is no longer available (${videoId})`);
  }
}

export class YoutubeTranscriptDisabledError extends YoutubeTranscriptError {
  constructor(videoId: string) {
    super(`Transcript is disabled on this video (${videoId})`);
  }
}

export class YoutubeTranscriptNotAvailableError extends YoutubeTranscriptError {
  constructor(videoId: string) {
    super(`No transcripts are available for this video (${videoId})`);
  }
}

export class YoutubeTranscriptNotAvailableLanguageError extends YoutubeTranscriptError {
  constructor(lang: string, availableLangs: string[], videoId: string) {
    super(`No transcripts are available in ${lang} this video (${videoId}). Available languages: ${availableLangs.join(', ')}`);
  }
}

export interface TranscriptConfig {
  languages?: string[];
  lang?: string;
  preserveFormatting?: boolean;
}

export interface TranscriptResponse {
  text: string;
  duration: number;
  offset: number;
  lang?: string;
  isGenerated?: boolean;
}

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url: string): string {
  const match = url.match(RE_YOUTUBE);
  if (match && match.length) {
    return match[1];
  }
  throw new YoutubeTranscriptError('Impossible to retrieve Youtube video ID.');
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
 * Fetch transcript from YouTube video using direct API access
 */
export async function fetchTranscriptFallback(
  videoUrl: string,
  config?: TranscriptConfig
): Promise<TranscriptResponse[]> {
  const videoId = extractVideoId(videoUrl);
  
  console.log(`🔍 Fetching video page for ID: ${videoId}`);
  const videoPageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      ...(config?.lang && { 'Accept-Language': config.lang }),
      'User-Agent': USER_AGENT,
    },
  });
  
  const videoPageBody = await videoPageResponse.text();
  console.log(`📄 Video page body length: ${videoPageBody.length} characters`);

  const splittedHTML = videoPageBody.split('"captions":');
  console.log(`🔍 Found ${splittedHTML.length} parts after splitting by "captions":`);

  if (splittedHTML.length <= 1) {
    if (videoPageBody.includes('class="g-recaptcha"')) {
      throw new YoutubeTranscriptTooManyRequestError();
    }
    if (!videoPageBody.includes('"playabilityStatus":')) {
      throw new YoutubeTranscriptVideoUnavailableError(videoId);
    }
    throw new YoutubeTranscriptDisabledError(videoId);
  }

  const captions = (() => {
    try {
      const captionsPart = splittedHTML[1].split(',"videoDetails')[0].replace('\n', '');
      console.log(`🔍 Captions part length: ${captionsPart.length} characters`);
      console.log(`🔍 Captions part preview: ${captionsPart.substring(0, 200)}...`);
      
      const parsed = JSON.parse(captionsPart);
      console.log(`✅ Successfully parsed captions JSON`);
      return parsed;
    } catch (e) {
      console.log(`❌ Failed to parse captions JSON:`, e);
      return undefined;
    }
  })()?.['playerCaptionsTracklistRenderer'];

  if (!captions) {
    console.log(`❌ No playerCaptionsTracklistRenderer found`);
    throw new YoutubeTranscriptDisabledError(videoId);
  }

  console.log(`📊 Captions object keys: ${Object.keys(captions).join(', ')}`);

  if (!('captionTracks' in captions)) {
    console.log(`❌ No captionTracks found in captions`);
    throw new YoutubeTranscriptNotAvailableError(videoId);
  }

  console.log(`📊 Found ${captions.captionTracks.length} caption tracks`);

  if (
    config?.lang &&
    !captions.captionTracks.some(
      (track: any) => track.languageCode === config?.lang
    )
  ) {
    throw new YoutubeTranscriptNotAvailableLanguageError(
      config?.lang,
      captions.captionTracks.map((track: any) => track.languageCode),
      videoId
    );
  }

  const selectedTrack = config?.lang
    ? captions.captionTracks.find(
        (track: any) => track.languageCode === config?.lang
      )
    : captions.captionTracks[0];

  console.log(`📊 Selected track: ${selectedTrack.languageCode} - ${selectedTrack.languageName}`);
  console.log(`🔗 Transcript URL: ${selectedTrack.baseUrl}`);

  const transcriptResponse = await fetch(selectedTrack.baseUrl, {
    headers: {
      ...(config?.lang && { 'Accept-Language': config.lang }),
      'User-Agent': USER_AGENT,
    },
  });
  
  if (!transcriptResponse.ok) {
    console.log(`❌ Transcript response not OK: ${transcriptResponse.status}`);
    throw new YoutubeTranscriptNotAvailableError(videoId);
  }
  
  const transcriptBody = await transcriptResponse.text();
  console.log(`📄 Transcript body length: ${transcriptBody.length} characters`);
  console.log(`🔍 Transcript body preview: ${transcriptBody.substring(0, 200)}...`);
  
  const results = [...transcriptBody.matchAll(RE_XML_TRANSCRIPT)];
  console.log(`📊 Found ${results.length} transcript segments`);
  
  return results.map((result) => ({
    text: result[3],
    duration: parseFloat(result[2]),
    offset: parseFloat(result[1]),
    lang: config?.lang ?? selectedTrack.languageCode,
  }));
}

/**
 * Convert transcript response to our standard format
 */
function convertTranscriptResponseToSegments(transcriptResponse: TranscriptResponse[]): TranscriptSegment[] {
  return transcriptResponse.map(response => ({
    start: response.offset,
    duration: response.duration,
    text: response.text
  }));
}

/**
 * Fallback function to scrape YouTube transcript using direct API access
 */
export async function scrapeYouTubeTranscriptFallback(videoUrl: string): Promise<YouTubeTranscript> {
  console.log('🚀 Starting YouTube transcript scraping with fallback API approach...');
  console.log(`📹 Video URL: ${videoUrl}`);
  
  const videoId = extractVideoId(videoUrl);
  console.log(`🎬 Video ID: ${videoId}`);
  
  try {
    // Get transcript data using direct API access
    console.log('📖 Fetching transcript data using direct API...');
    const transcriptResponse = await fetchTranscriptFallback(videoUrl);
    console.log('✅ Transcript data fetched successfully');
    
    // Get video title
    console.log('📝 Getting video title...');
    const title = await getVideoTitle(videoId);
    console.log(`✅ Video title: "${title}"`);
    
    // Convert to our standard format
    console.log('🔄 Converting transcript to standard format...');
    const segments = convertTranscriptResponseToSegments(transcriptResponse);
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