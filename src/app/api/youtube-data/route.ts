import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeApiService } from '@/lib/youtube-api-service';
import { getUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
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

    // Get video metadata using OAuth-authenticated YouTube API
    const youtubeApi = getYouTubeApiService();
    const videoData = await youtubeApi.getVideoMetadata(videoId);

    return NextResponse.json(videoData);

  } catch (error) {
    console.error('YouTube Data API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle specific authentication errors
    if (errorMessage.includes('User must be authenticated')) {
      return NextResponse.json(
        { error: 'Authentication required to access YouTube API' },
        { status: 401 }
      );
    }
    
    // Handle video not found
    if (errorMessage.includes('Video not found')) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch video data' },
      { status: 500 }
    );
  }
} 