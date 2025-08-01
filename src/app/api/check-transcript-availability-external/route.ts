import { NextRequest, NextResponse } from 'next/server';
import { getTranscriptApiService } from '@/lib/transcript-api-service';

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
    const { videoId, youtubeUrl, service = 'rapidapi' } = await request.json();

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

    // Validate service parameter
    const validServices = ['rapidapi', 'assemblyai', 'custom'];
    if (!validServices.includes(service)) {
      return NextResponse.json(
        { error: 'Invalid service. Must be one of: rapidapi, assemblyai, custom' },
        { status: 400 }
      );
    }

    // Check transcript availability using external service
    let isAvailable = false;
    let error = null;
    
    try {
      const transcriptService = getTranscriptApiService();
      isAvailable = await transcriptService.checkTranscriptAvailability(finalVideoId, service as 'rapidapi' | 'assemblyai' | 'custom');
    } catch (err) {
      error = err instanceof Error ? err : new Error('Unknown error');
      console.error('External transcript availability check failed:', error.message);
    }

    return NextResponse.json({
      videoId: finalVideoId,
      available: isAvailable,
      service: service,
      error: error ? error.message : null
    });

  } catch (error: unknown) {
    console.error('External transcript availability check error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check transcript availability using external service.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 