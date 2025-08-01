import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { google } from 'googleapis';

const youtube = google.youtube('v3');

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Get real transcript from YouTube
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    
    // Format transcript data to match expected structure
    const formattedTranscript = transcriptItems.map((item: { text: string; offset: number; duration: number }) => ({
      text: item.text,
      start: Math.floor(item.offset / 1000), // Convert milliseconds to seconds
      duration: Math.floor(item.duration / 1000) // Convert milliseconds to seconds
    }));

    // Get video metadata from YouTube Data API
    let videoData = null;
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (apiKey) {
        const videoResponse = await youtube.videos.list({
          key: apiKey,
          part: ['snippet', 'contentDetails'],
          id: [videoId],
        });

        if (videoResponse.data.items && videoResponse.data.items.length > 0) {
          const video = videoResponse.data.items[0];
          const snippet = video.snippet;
          const contentDetails = video.contentDetails;

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

          videoData = {
            title: snippet?.title || `YouTube Video - ${videoId}`,
            description: snippet?.description || '',
            channelTitle: snippet?.channelTitle || '',
            duration: durationInSeconds,
            thumbnail: snippet?.thumbnails?.maxres?.url || 
                      snippet?.thumbnails?.high?.url || 
                      snippet?.thumbnails?.medium?.url || 
                      snippet?.thumbnails?.default?.url || '',
          };
        }
      }
    } catch (apiError) {
      console.warn('Failed to fetch video metadata from YouTube API:', apiError);
      // Fallback to basic title if API fails
      videoData = {
        title: `YouTube Video - ${videoId}`,
        description: '',
        channelTitle: '',
        duration: 0,
        thumbnail: '',
      };
    }

    return NextResponse.json({
      transcript: formattedTranscript,
      title: videoData?.title || `YouTube Video - ${videoId}`,
      videoData: videoData
    });

  } catch (error: unknown) {
    console.error('Transcript extraction error:', error);
    
    return NextResponse.json(
      { error: 'Failed to extract transcript. Please check if the video has captions available.' },
      { status: 500 }
    );
  }
}