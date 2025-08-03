import { NextRequest, NextResponse } from 'next/server';
import { scrapeYouTubeTranscriptReverseEngineered } from '@/lib/youtube-transcript-reverse-engineered';

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();
    
    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    if (!youtubeRegex.test(videoUrl)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    console.log('Starting YouTube transcript scraping for:', videoUrl);
    
    const transcript = await scrapeYouTubeTranscriptReverseEngineered(videoUrl);
    
    return NextResponse.json({
      success: true,
      data: transcript
    });
    
  } catch (error) {
    console.error('Error scraping YouTube transcript:', error);
    return NextResponse.json(
      { 
        error: 'Failed to scrape YouTube transcript',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'YouTube Transcript Scraper API',
    usage: 'POST /api/youtube-transcript with { "videoUrl": "https://youtube.com/watch?v=..." }'
  });
} 