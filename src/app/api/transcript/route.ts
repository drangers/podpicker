import { NextRequest, NextResponse } from 'next/server';
import { scrapeYouTubeTranscriptReverseEngineered } from '@/lib/youtube-transcript-reverse-engineered';

export async function POST(request: NextRequest) {
  console.log('🚀 Starting transcript extraction API request...');
  
  try {
    console.log('📥 Parsing request body...');
    const { videoUrl } = await request.json();
    console.log(`📹 Video URL from request: ${videoUrl || 'not provided'}`);
    
    if (!videoUrl) {
      console.log('❌ No video URL provided in request');
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Validate YouTube URL
    console.log('🔍 Validating YouTube URL format...');
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const isValidUrl = youtubeRegex.test(videoUrl);
    console.log(`✅ YouTube URL validation result: ${isValidUrl ? 'Valid' : 'Invalid'}`);
    
    if (!isValidUrl) {
      console.log('❌ Invalid YouTube URL format');
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    console.log(`📹 Target video URL: ${videoUrl}`);
    
    const transcript = await scrapeYouTubeTranscriptReverseEngineered(videoUrl);
    console.log('✅ Transcript scraping completed successfully');
    console.log(`📊 Extracted transcript data:`);
    console.log(`  - Video ID: ${transcript.videoId}`);
    console.log(`  - Title: ${transcript.title}`);
    console.log(`  - Segments: ${transcript.segments.length}`);
    console.log(`  - Full text length: ${transcript.fullText.length} characters`);
    
    return NextResponse.json({
      success: true,
      data: transcript
    });
    
  } catch (error) {
    console.log('❌ Error during transcript extraction:', error);
    console.log(`🔍 Error type: ${error instanceof Error ? error.constructor.name : 'Unknown'}`);
    console.log(`📝 Error message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return NextResponse.json(
      { 
        error: 'Failed to extract transcript',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'YouTube Transcript Scraper API',
    usage: 'POST /api/transcript with { "videoUrl": "https://youtube.com/watch?v=..." }'
  });
}