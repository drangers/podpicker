import { NextRequest, NextResponse } from 'next/server';
import youtubeTranscript from 'youtube-transcript';

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
        { 
          error: 'Invalid video ID format',
          hasTranscript: false,
          message: 'Invalid video ID format'
        },
        { status: 400 }
      );
    }

    // Try to fetch transcript to check if it's available
    try {
      const transcriptItems = await youtubeTranscript.YoutubeTranscript.fetchTranscript(finalVideoId);
      
      // If we can fetch transcript items and they have content, transcript is available
      const hasTranscript = transcriptItems && 
        Array.isArray(transcriptItems) && 
        transcriptItems.length > 0 && 
        transcriptItems.some((item: { text: string }) => item.text && item.text.trim().length > 0);
      
      return NextResponse.json({
        hasTranscript,
        message: hasTranscript ? 'Transcript is available' : 'No transcript found',
        videoId: finalVideoId,
        transcriptCount: hasTranscript ? transcriptItems.length : 0
      });
      
    } catch (transcriptError: any) {
      // If transcript fetch fails, it means no transcript is available
      console.log('Transcript not available for video:', finalVideoId, transcriptError.message);
      
      const errorMessage = transcriptError.message.includes('disabled') 
        ? 'Transcript is disabled for this video'
        : transcriptError.message.includes('Impossible to retrieve')
        ? 'Invalid video ID or video not found'
        : 'No transcript available for this video';
        
      return NextResponse.json({
        hasTranscript: false,
        message: errorMessage,
        videoId: finalVideoId,
        details: transcriptError.message
      });
    }

  } catch (error: unknown) {
    console.error('Transcript availability check error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check transcript availability',
        hasTranscript: false,
        message: 'Failed to check transcript availability',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 