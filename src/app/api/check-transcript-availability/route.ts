import { NextRequest, NextResponse } from 'next/server';
import { scrapeYouTubeTranscriptReverseEngineered } from '@/lib/youtube-transcript-reverse-engineered';

// Helper function to validate video ID
function isValidVideoId(videoId: string): boolean {
  console.log(`🔍 Validating video ID: ${videoId}`);
  const isValid = /^[a-zA-Z0-9_-]{11}$/.test(videoId);
  console.log(`✅ Video ID validation result: ${isValid ? 'Valid' : 'Invalid'}`);
  return isValid;
}

// Helper function to extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  console.log(`🔍 Extracting video ID from URL: ${url}`);
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    console.log(`🔍 Trying pattern ${i + 1}: ${pattern}`);
    const match = url.match(pattern);
    if (match) {
      const videoId = match[1];
      console.log(`✅ Video ID extracted: ${videoId}`);
      return videoId;
    } else {
      console.log(`❌ Pattern ${i + 1} did not match`);
    }
  }
  
  console.log('❌ No video ID found in URL');
  return null;
}

export async function POST(request: NextRequest) {
  console.log('🚀 Starting transcript availability check...');
  
  try {
    console.log('📥 Parsing request body...');
    const { videoId, youtubeUrl } = await request.json();
    console.log(`📊 Request data - videoId: ${videoId || 'not provided'}, youtubeUrl: ${youtubeUrl || 'not provided'}`);

    let finalVideoId = videoId;
    let finalYoutubeUrl = youtubeUrl;
    
    // If videoId is not provided but youtubeUrl is, extract videoId from URL
    if (!finalVideoId && youtubeUrl) {
      console.log('🔍 Video ID not provided, extracting from YouTube URL...');
      finalVideoId = extractVideoId(youtubeUrl);
    }

    // If youtubeUrl is not provided but videoId is, construct the URL
    if (!finalYoutubeUrl && finalVideoId) {
      console.log('🔍 YouTube URL not provided, constructing from video ID...');
      finalYoutubeUrl = `https://www.youtube.com/watch?v=${finalVideoId}`;
    }

    if (!finalVideoId) {
      console.log('❌ No video ID found in request');
      return NextResponse.json(
        { error: 'Video ID or YouTube URL is required' },
        { status: 400 }
      );
    }

    console.log(`🎬 Final video ID: ${finalVideoId}`);
    console.log(`📹 Final YouTube URL: ${finalYoutubeUrl}`);

    // Validate video ID format
    console.log('🔍 Validating video ID format...');
    if (!isValidVideoId(finalVideoId)) {
      console.log('❌ Invalid video ID format');
      return NextResponse.json(
        { 
          error: 'Invalid video ID format',
          hasTranscript: false,
          message: 'Invalid video ID format'
        },
        { status: 400 }
      );
    }

    console.log('✅ Video ID format is valid');

    // Check transcript availability using reverse-engineered implementation
    console.log('🔍 Starting transcript availability check using reverse-engineered implementation...');
    try {
      console.log('📖 Attempting to get transcript to check availability...');
      const transcript = await scrapeYouTubeTranscriptReverseEngineered(finalYoutubeUrl);
      console.log(`📊 Transcript check successful - found ${transcript.segments.length} segments`);
      
      if (transcript.segments.length > 0) {
        console.log('✅ Transcript is available for this video');
        return NextResponse.json({
          hasTranscript: true,
          message: 'Transcript is available',
          videoId: finalVideoId,
          transcriptCount: transcript.segments.length
        });
      } else {
        console.log('❌ No transcript segments found for this video');
        return NextResponse.json({
          hasTranscript: false,
          message: 'No transcript available for this video',
          videoId: finalVideoId,
          details: 'No transcript segments found'
        });
      }
      
    } catch (transcriptError: unknown) {
      // If transcript check fails, it means no transcript is available
      console.log('❌ Transcript check failed with error:', transcriptError);
      const errorMessage = transcriptError instanceof Error ? transcriptError.message : 'Unknown error';
      console.log(`📝 Error message: ${errorMessage}`);
      console.log(`🔍 Error type: ${transcriptError instanceof Error ? transcriptError.constructor.name : 'Unknown'}`);
      
      console.log('❌ Transcript not available for video:', finalVideoId, errorMessage);
      
      return NextResponse.json({
        hasTranscript: false,
        message: 'No transcript available for this video',
        videoId: finalVideoId,
        details: errorMessage
      });
    }

  } catch (error: unknown) {
    console.log('❌ Transcript availability check error:', error);
    console.log(`🔍 Error type: ${error instanceof Error ? error.constructor.name : 'Unknown'}`);
    console.log(`📝 Error message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
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