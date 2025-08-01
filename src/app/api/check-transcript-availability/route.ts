import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Try to fetch transcript to check if it's available
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      
      // If we can fetch transcript items and they have content, transcript is available
      const hasTranscript = transcriptItems && transcriptItems.length > 0 && 
        transcriptItems.some((item: { text: string }) => item.text && item.text.trim().length > 0);
      
      return NextResponse.json({
        hasTranscript,
        message: hasTranscript ? 'Transcript is available' : 'No transcript found'
      });
      
    } catch (transcriptError) {
      // If transcript fetch fails, it means no transcript is available
      console.log('Transcript not available for video:', videoId);
      return NextResponse.json({
        hasTranscript: false,
        message: 'No transcript available for this video'
      });
    }

  } catch (error: unknown) {
    console.error('Transcript availability check error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check transcript availability',
        hasTranscript: false 
      },
      { status: 500 }
    );
  }
} 