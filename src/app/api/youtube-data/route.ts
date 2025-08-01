import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const youtube = google.youtube('v3');

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

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API key not configured' },
        { status: 500 }
      );
    }

    // Get video details
    const videoResponse = await youtube.videos.list({
      key: apiKey,
      part: ['snippet', 'contentDetails', 'statistics'],
      id: [videoId],
    });

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const video = videoResponse.data.items[0];
    const snippet = video.snippet;
    const contentDetails = video.contentDetails;
    const statistics = video.statistics;

    // Parse duration (ISO 8601 format)
    const duration = contentDetails?.duration;
    let durationInSeconds = 0;
    if (duration) {
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (match) {
        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        const seconds = parseInt(match[3] || '0');
        durationInSeconds = hours * 3600 + minutes * 60 + seconds;
      }
    }

    const videoData = {
      id: videoId,
      title: snippet?.title || '',
      description: snippet?.description || '',
      channelTitle: snippet?.channelTitle || '',
      publishedAt: snippet?.publishedAt || '',
      duration: durationInSeconds,
      viewCount: statistics?.viewCount ? parseInt(statistics.viewCount) : 0,
      likeCount: statistics?.likeCount ? parseInt(statistics.likeCount) : 0,
      thumbnail: snippet?.thumbnails?.maxres?.url || 
                snippet?.thumbnails?.high?.url || 
                snippet?.thumbnails?.medium?.url || 
                snippet?.thumbnails?.default?.url || '',
      tags: snippet?.tags || [],
    };

    return NextResponse.json(videoData);

  } catch (error) {
    console.error('YouTube Data API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video data' },
      { status: 500 }
    );
  }
} 