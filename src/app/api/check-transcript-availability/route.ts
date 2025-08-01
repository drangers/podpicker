import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeTranscriptPlus } from '@/lib/youtube-transcript-plus';

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

    // Check transcript availability using youtube-transcript-plus
    try {
      const transcriptPlus = getYouTubeTranscriptPlus();
      const hasTranscript = await transcriptPlus.checkTranscriptAvailability(finalVideoId);
      
      return NextResponse.json({
        hasTranscript,
        message: hasTranscript ? 'Transcript is available' : 'No transcript found',
        videoId: finalVideoId,
        transcriptCount: hasTranscript ? 0 : 0 // We don't know the count until we actually scrape
      });
      
    } catch (transcriptError: unknown) {
      // If transcript check fails, it means no transcript is available
      const errorMessage = transcriptError instanceof Error ? transcriptError.message : 'Unknown error';
      console.log('Transcript not available for video:', finalVideoId, errorMessage);
      
      const userMessage = errorMessage.includes('Transcript button not found') 
        ? 'Transcript is not available for this video'
        : errorMessage.includes('Transcript not found')
        ? 'No transcript content found'
        : 'No transcript available for this video';
        
      return NextResponse.json({
        hasTranscript: false,
        message: userMessage,
        videoId: finalVideoId,
        details: errorMessage
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