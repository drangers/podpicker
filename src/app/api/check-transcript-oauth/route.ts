import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeApiService } from '@/lib/youtube-api-service';
import { getUser } from '@/lib/auth';

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
  let finalVideoId: string | null = null;
  
  try {
    const { videoId, youtubeUrl } = await request.json();

    finalVideoId = videoId;
    
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

    // Check if user is authenticated
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { 
          error: 'Authentication required to access YouTube API',
          hasTranscript: false,
          message: 'Authentication required to access YouTube API'
        },
        { status: 401 }
      );
    }

    // Check transcript availability using OAuth-authenticated YouTube API
    try {
      const youtubeApi = getYouTubeApiService();
      const hasCaptions = await youtubeApi.hasCaptions(finalVideoId);
      
      if (hasCaptions) {
        return NextResponse.json({
          hasTranscript: true,
          message: 'Transcript is available',
          videoId: finalVideoId,
          transcriptCount: 0, // We don't know the count until we actually scrape
          method: 'oauth'
        });
      } else {
        return NextResponse.json({
          hasTranscript: false,
          message: 'No transcript available for this video',
          videoId: finalVideoId,
          details: 'No captions found for this video',
          method: 'oauth'
        });
      }
      
    } catch (transcriptError: unknown) {
      // If transcript check fails, it means no transcript is available
      const errorMessage = transcriptError instanceof Error ? transcriptError.message : 'Unknown error';
      console.log('Transcript not available for video:', finalVideoId, errorMessage);
      
      return NextResponse.json({
        hasTranscript: false,
        message: 'No transcript available for this video',
        videoId: finalVideoId,
        details: errorMessage,
        method: 'oauth'
      });
    }

  } catch (error: unknown) {
    console.error('OAuth transcript availability check error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check transcript availability',
        hasTranscript: false,
        message: 'Failed to check transcript availability',
        details: error instanceof Error ? error.message : 'Unknown error',
        method: 'oauth'
      },
      { status: 500 }
    );
  }
} 