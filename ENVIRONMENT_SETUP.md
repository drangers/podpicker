# Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

## Required for External Transcript Services

### RapidAPI YouTube Transcript API
```bash
RAPIDAPI_KEY=your_rapidapi_key_here
```

### AssemblyAI (High-quality transcription)
```bash
ASSEMBLYAI_API_KEY=your_assemblyai_key_here
```

### Custom API (Optional)
```bash
CUSTOM_TRANSCRIPT_API_URL=https://your-api-endpoint.com/transcript
CUSTOM_TRANSCRIPT_API_KEY=your_custom_api_key_here
```

## Required for Video Metadata

### YouTube Data API
```bash
YOUTUBE_API_KEY=your_youtube_api_key_here
```

## Optional (for other features)

### Supabase (if using database features)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### OpenAI (for AI analysis features)
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## Getting API Keys

### RapidAPI
1. Sign up at [https://rapidapi.com](https://rapidapi.com)
2. Subscribe to YouTube Transcript API
3. Get your API key from the dashboard

### AssemblyAI
1. Sign up at [https://www.assemblyai.com](https://www.assemblyai.com)
2. Get your API key from the dashboard

### YouTube Data API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API key)

## Testing Configuration

After setting up your environment variables:

1. Restart your development server
2. Visit `/test-external-transcript` to test the services
3. Use "Load Services" to verify configuration

## Security Notes

- Never commit `.env.local` to version control
- Keep your API keys secure
- Use environment-specific keys for production
- Consider using a secrets management service for production 