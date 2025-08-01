import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const youtube = google.youtube('v3');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId') || 'dQw4w9WgXcQ'; // Default to a test video

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API key not configured', message: 'Please set YOUTUBE_API_KEY in your environment variables' },
        { status: 500 }
      );
    }

    // Test the YouTube Data API
    const videoResponse = await youtube.videos.list({
      key: apiKey,
      part: ['snippet', 'contentDetails'],
      id: [videoId],
    });

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      return NextResponse.json(
        { error: 'Video not found', videoId },
        { status: 404 }
      );
    }

    const video = videoResponse.data.items[0];
    
    return NextResponse.json({
      success: true,
      message: 'YouTube Data API is working correctly',
      video: {
        id: videoId,
        title: video.snippet?.title,
        channelTitle: video.snippet?.channelTitle,
        duration: video.contentDetails?.duration,
      }
    });

  } catch (error) {
    console.error('YouTube Data API test error:', error);
    return NextResponse.json(
      { 
        error: 'YouTube Data API test failed',
        message: 'Check your API key and network connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 