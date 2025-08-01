# PodPicker - AI-Powered Podcast Curator

Extract the gold from your favorite podcasts with AI-powered segmentation and curation.

## Features

- **Transcript Availability Check**: Automatically checks if transcript data exists for YouTube videos before processing
- **Real YouTube Transcript Extraction**: Uses the `youtube-transcript` package to extract real transcripts from YouTube videos
- **YouTube Data API Integration**: Fetches real video metadata including title, description, duration, and thumbnails
- **OpenAI-Powered Topic Analysis**: Uses GPT-4 to analyze transcripts and identify key topics with timestamps
- **Smart Segmentation**: AI breaks down long podcasts into digestible topics with precise timestamps
- **Personal Curation**: Save only the segments that interest you most
- **Easy Playback**: Jump directly to your saved moments across all podcasts

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure API Keys**
   - Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Get your YouTube Data API key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a `.env.local` file with your API keys:
     ```
     OPENAI_API_KEY=your_actual_openai_api_key_here
     YOUTUBE_API_KEY=your_actual_youtube_api_key_here
     ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

4. **Open the Application**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Go to the Dashboard to start analyzing podcasts

## How to Use

1. **Paste a YouTube URL**: Enter any YouTube podcast URL in the dashboard
2. **Check Transcript Availability**: The app automatically checks if transcript data is available for the video
3. **Show Transcript**: Click "Show Transcript" to extract and display the transcript
4. **AI Analysis**: OpenAI will analyze the transcript and identify key topics
5. **Select Topics**: Choose which topics you want to save to your collection
6. **Save to Collection**: Build your personalized library of podcast segments

## Technical Details

### API Routes

- `/api/check-transcript-availability` - Checks if transcript data exists for a YouTube video
- `/api/transcript` - Extracts real transcripts from YouTube videos and fetches video metadata
- `/api/youtube-data` - Fetches detailed video information from YouTube Data API
- `/api/analyze-transcript` - Uses OpenAI to analyze transcripts and identify topics
- `/api/ai-analysis` - Additional AI analysis features

### Dependencies

- **Next.js 15** - React framework
- **OpenAI SDK** - For AI-powered transcript analysis
- **youtube-transcript** - For extracting YouTube transcripts
- **googleapis** - For YouTube Data API integration
- **Tailwind CSS** - For styling
- **Lucide React** - For icons

### Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (required for AI analysis)
- `YOUTUBE_API_KEY` - Your YouTube Data API key (required for video metadata)

## Architecture

The application follows a modern Next.js architecture:

- **Frontend**: React components with TypeScript
- **Backend**: Next.js API routes
- **AI Integration**: OpenAI GPT-4 for transcript analysis
- **Data Storage**: Local storage for saved topics

## Troubleshooting

- **Transcript Extraction Fails**: Ensure the YouTube video has captions/transcripts available
- **Video Metadata Fails**: Check that your YouTube Data API key is correctly set in `.env.local`
- **AI Analysis Fails**: Check that your OpenAI API key is correctly set in `.env.local`
- **Build Errors**: Run `npm run build` to check for TypeScript errors

## Development

- **TypeScript**: All code is written in TypeScript for better type safety
- **ESLint**: Code linting is configured for consistency
- **Hot Reload**: Development server supports hot reloading

## License

This project is open source and available under the MIT License.
