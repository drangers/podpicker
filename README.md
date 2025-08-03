# Podcast Curator

A Next.js application for curating and organizing podcast content using AI-powered segmentation and transcript analysis.

## Features

- **YouTube Transcript Scraping**: Server-side Puppeteer automation to scrape YouTube video transcripts
- **AI-Powered Analysis**: Analyze and segment podcast content using OpenAI
- **User Authentication**: Supabase-based authentication system
- **Content Curation**: Save and organize podcast segments by topic

## YouTube Transcript Scraping

The application includes a robust server-side Puppeteer automation system for scraping YouTube video transcripts:

### How it Works

1. **Navigate to YouTube Video**: Uses Puppeteer to navigate to the provided YouTube URL
2. **Click "Show Transcript" Button**: Automatically finds and clicks the transcript button using multiple selector strategies
3. **Scrape Transcript Text**: Extracts transcript segments with timestamps from the DOM
4. **Return Structured Data**: Returns the transcript as structured data with video metadata

### API Endpoints

- `POST /api/youtube-transcript` - Scrape YouTube video transcript
- `POST /api/transcript` - Legacy transcript endpoint

### Testing

- **Command Line**: `npm run test-scraper <youtube-url>`
- **Web Interface**: Visit `/youtube-transcript-test` for a user-friendly testing interface

### Example Usage

```typescript
import { scrapeYouTubeTranscript } from '@/lib/youtube-transcript-scraper';

const transcript = await scrapeYouTubeTranscript('https://www.youtube.com/watch?v=...');
console.log(transcript.segments); // Array of transcript segments with timestamps
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Testing YouTube Transcript Scraping

```bash
npm run test-scraper "https://www.youtube.com/watch?v=..."
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── youtube-transcript/     # YouTube transcript API
│   │   └── transcript/             # Legacy transcript API
│   ├── youtube-transcript-test/    # Test interface for transcript scraping
│   └── test-scraper/              # Existing test interface
├── lib/
│   └── youtube-transcript-scraper.ts  # Puppeteer-based transcript scraper
└── components/
    └── auth/                      # Authentication components
```

## Technologies Used

- **Next.js 15**: React framework with App Router
- **Puppeteer**: Server-side browser automation for web scraping
- **Supabase**: Authentication and database
- **OpenAI**: AI-powered content analysis
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Styling

## License

MIT
