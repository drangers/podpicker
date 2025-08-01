import { NextRequest, NextResponse } from 'next/server';
import { getTranscriptApiService } from '@/lib/transcript-api-service';
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
        { error: 'Invalid video ID format' },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to access YouTube API' },
        { status: 401 }
      );
    }

    // Get transcript using OAuth-authenticated service
    const transcriptApi = getTranscriptApiService();
    const transcriptResponse = await transcriptApi.fetchTranscript(finalVideoId, 'oauth');

    return NextResponse.json({
      transcript: transcriptResponse.transcript,
      title: transcriptResponse.metadata.title,
      videoData: transcriptResponse.metadata,
      videoId: finalVideoId,
      transcriptCount: transcriptResponse.transcript.length,
      method: 'oauth'
    });

  } catch (error: unknown) {
    console.error('OAuth transcript extraction error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle specific authentication errors
    if (errorMessage.includes('User must be authenticated') || errorMessage.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required to access YouTube API' },
        { status: 401 }
      );
    }
    
    // Handle specific YouTube API errors
    if (errorMessage.includes('No captions available') || errorMessage.includes('No suitable caption track found')) {
      return NextResponse.json(
        { 
          error: 'No transcript available for this video',
          details: errorMessage,
          videoId: finalVideoId || 'unknown'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to extract transcript using OAuth. Please check if the video has captions available.',
        details: errorMessage
      },
      { status: 500 }
    );
  }
} 