import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { YoutubeTranscript } from 'youtube-transcript';

const youtube = google.youtube('v3');

// Helper function to validate video ID
function isValidVideoId(videoId: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

// Helper function to extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { videoId, youtubeUrl } = await request.json();

    let finalVideoId = videoId;
    
    // If videoId is not provided but youtubeUrl is, extract videoId from URL
    if (!finalVideoId && youtubeUrl) {
      finalVideoId = extractVideoId(youtubeUrl);
    }

    if (!finalVideoId) {
      return NextResponse.json(
        { error: 'Video ID or YouTube URL is required' },
        { status: 400 }
      );
    }

    // Validate video ID format
    if (!isValidVideoId(finalVideoId)) {
      return NextResponse.json(
        { error: 'Invalid video ID format' },
        { status: 400 }
      );
    }

    // Get transcript from YouTube using youtube-transcript
    let transcriptItems: Array<{ text: string; start: number; duration: number }> = [];
    let transcriptError: Error | null = null;
    
    try {
      const transcriptData = await YoutubeTranscript.fetchTranscript(finalVideoId);
      
      // Transform the transcript data to match our interface
      transcriptItems = transcriptData.map((item: { text: string; offset: number; duration: number }) => ({
        text: item.text,
        start: item.offset / 1000, // Convert milliseconds to seconds
        duration: item.duration / 1000 // Convert milliseconds to seconds
      }));
      
      // Validate transcript items
      if (!Array.isArray(transcriptItems)) {
        throw new Error('Invalid transcript format received');
      }
      
      // Check if transcript has meaningful content
      const hasContent = transcriptItems.some((item) => 
        item && item.text && item.text.trim().length > 0
      );
      
      if (!hasContent) {
        throw new Error('No transcript content available');
      }
      
    } catch (error: unknown) {
      transcriptError = error instanceof Error ? error : new Error('Unknown error');
      console.error('Transcript extraction failed:', transcriptError.message);
    }

    // If transcript extraction failed, return appropriate error
    if (transcriptError) {
      const errorMessage = transcriptError.message.includes('Transcript button not found') 
        ? 'Transcript is not available for this video'
        : transcriptError.message.includes('Transcript not found')
        ? 'No transcript content found'
        : 'No transcript available for this video';
        
      return NextResponse.json(
        { 
          error: errorMessage,
          details: transcriptError.message,
          videoId: finalVideoId
        },
        { status: 404 }
      );
    }

    // Format transcript data to match expected structure
    const formattedTranscript = transcriptItems.map((item: { text: string; start: number; duration: number }) => ({
      text: item.text,
      start: item.start,
      duration: item.duration
    }));

    // Get video metadata from YouTube Data API
    let videoData = null;
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (apiKey) {
        const videoResponse = await youtube.videos.list({
          key: apiKey,
          part: ['snippet', 'contentDetails'],
          id: [finalVideoId],
        });

        if (videoResponse.data.items && videoResponse.data.items.length > 0) {
          const video = videoResponse.data.items[0];
          const snippet = video.snippet;
          const contentDetails = video.contentDetails;

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

          videoData = {
            title: snippet?.title || `YouTube Video - ${finalVideoId}`,
            description: snippet?.description || '',
            channelTitle: snippet?.channelTitle || '',
            duration: durationInSeconds,
            thumbnail: snippet?.thumbnails?.maxres?.url || 
                      snippet?.thumbnails?.high?.url || 
                      snippet?.thumbnails?.medium?.url || 
                      snippet?.thumbnails?.default?.url || '',
          };
        }
      }
    } catch (apiError) {
      console.warn('Failed to fetch video metadata from YouTube API:', apiError);
      // Fallback to basic title if API fails
      videoData = {
        title: `YouTube Video - ${finalVideoId}`,
        description: '',
        channelTitle: '',
        duration: 0,
        thumbnail: '',
      };
    }

    return NextResponse.json({
      transcript: formattedTranscript,
      title: videoData?.title || `YouTube Video - ${finalVideoId}`,
      videoData: videoData,
      videoId: finalVideoId,
      transcriptCount: formattedTranscript.length
    });

  } catch (error: unknown) {
    console.error('Transcript extraction error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to extract transcript. Please check if the video has captions available.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}