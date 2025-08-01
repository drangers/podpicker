# Third-Party Transcript Services Setup

This guide explains how to configure and use external transcript services for YouTube video transcript extraction.

## Available Services

### 1. RapidAPI YouTube Transcript API

**Description**: Fast and reliable YouTube transcript extraction via RapidAPI

**Setup**:
1. Sign up for a RapidAPI account at [https://rapidapi.com](https://rapidapi.com)
2. Subscribe to the YouTube Transcript API at [https://rapidapi.com/ytdl/api/youtube-transcript-api](https://rapidapi.com/ytdl/api/youtube-transcript-api)
3. Get your API key from the RapidAPI dashboard
4. Add to your `.env.local` file:
   ```
   RAPIDAPI_KEY=your_rapidapi_key_here
   ```

**Features**:
- Fast transcript extraction
- Multiple language support
- Automatic subtitle detection
- JSON response format
- Free tier available

### 2. AssemblyAI

**Description**: High-quality speech-to-text transcription with AI-powered accuracy

**Setup**:
1. Sign up for an AssemblyAI account at [https://www.assemblyai.com](https://www.assemblyai.com)
2. Get your API key from the AssemblyAI dashboard
3. Add to your `.env.local` file:
   ```
   ASSEMBLYAI_API_KEY=your_assemblyai_key_here
   ```

**Features**:
- AI-powered transcription
- High accuracy
- Speaker diarization
- Custom vocabulary support
- Multiple language support
- Pay-per-minute pricing

### 3. Custom API

**Description**: Use your own transcript extraction service

**Setup**:
1. Set up your own transcript extraction service
2. Add to your `.env.local` file:
   ```
   CUSTOM_TRANSCRIPT_API_URL=https://your-api-endpoint.com/transcript
   CUSTOM_TRANSCRIPT_API_KEY=your_api_key_here  # Optional
   ```

**Expected API Response Format**:
```json
{
  "transcript": [
    {
      "text": "Hello world",
      "start": 0,
      "duration": 2.5
    }
  ],
  "title": "Video Title",
  "description": "Video Description",
  "channelTitle": "Channel Name",
  "duration": 300,
  "thumbnail": "https://example.com/thumbnail.jpg"
}
```

## API Endpoints

### Get Transcript (External Service)
```
POST /api/transcript-external
```

**Request Body**:
```json
{
  "videoId": "dQw4w9WgXcQ",
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "service": "rapidapi"
}
```

**Response**:
```json
{
  "transcript": [...],
  "title": "Video Title",
  "videoData": {...},
  "videoId": "dQw4w9WgXcQ",
  "transcriptCount": 150,
  "service": "rapidapi"
}
```

### Check Transcript Availability (External Service)
```
POST /api/check-transcript-availability-external
```

**Request Body**:
```json
{
  "videoId": "dQw4w9WgXcQ",
  "service": "rapidapi"
}
```

**Response**:
```json
{
  "videoId": "dQw4w9WgXcQ",
  "available": true,
  "service": "rapidapi",
  "error": null
}
```

### Get Available Services
```
GET /api/transcript-services
```

**Response**:
```json
{
  "availableServices": ["rapidapi", "assemblyai"],
  "services": [...],
  "totalServices": 3,
  "configuredServices": 2
}
```

## Environment Variables

Add these to your `.env.local` file:

```bash
# RapidAPI
RAPIDAPI_KEY=your_rapidapi_key_here

# AssemblyAI
ASSEMBLYAI_API_KEY=your_assemblyai_key_here

# Custom API
CUSTOM_TRANSCRIPT_API_URL=https://your-api-endpoint.com/transcript
CUSTOM_TRANSCRIPT_API_KEY=your_api_key_here

# YouTube Data API (for video metadata)
YOUTUBE_API_KEY=your_youtube_api_key_here
```

## Usage Examples

### Using RapidAPI
```javascript
const response = await fetch('/api/transcript-external', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoId: 'dQw4w9WgXcQ',
    service: 'rapidapi'
  })
});
```

### Using AssemblyAI
```javascript
const response = await fetch('/api/transcript-external', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoId: 'dQw4w9WgXcQ',
    service: 'assemblyai'
  })
});
```

### Using Custom API
```javascript
const response = await fetch('/api/transcript-external', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoId: 'dQw4w9WgXcQ',
    service: 'custom'
  })
});
```

## Error Handling

The API returns appropriate error messages for different scenarios:

- **400**: Invalid video ID or service parameter
- **404**: Transcript not available or service not configured
- **500**: Server error or API service failure

## Service Comparison

| Feature | RapidAPI | AssemblyAI | Custom |
|---------|----------|------------|--------|
| Setup Difficulty | Easy | Medium | Hard |
| Accuracy | Good | Excellent | Depends |
| Speed | Fast | Medium | Depends |
| Cost | Free tier + paid | Pay-per-minute | Depends |
| Customization | Limited | High | Full |
| Language Support | Multiple | Multiple | Depends |

## Troubleshooting

### Common Issues

1. **"RAPIDAPI_KEY environment variable is required"**
   - Make sure you've added the RAPIDAPI_KEY to your .env.local file
   - Restart your development server after adding environment variables

2. **"API request failed: 401"**
   - Check that your API key is correct
   - Verify your RapidAPI subscription is active

3. **"AssemblyAI transcription timed out"**
   - AssemblyAI can take several minutes for longer videos
   - Check your AssemblyAI account for usage limits

4. **"Custom API request failed"**
   - Verify your custom API endpoint is accessible
   - Check that your API returns the expected JSON format

### Testing

You can test the services using the API endpoints:

```bash
# Test RapidAPI
curl -X POST http://localhost:3000/api/transcript-external \
  -H "Content-Type: application/json" \
  -d '{"videoId":"dQw4w9WgXcQ","service":"rapidapi"}'

# Check available services
curl http://localhost:3000/api/transcript-services
```

## Migration from Local Transcript Extraction

If you're currently using the local `youtube-transcript-plus` library, you can migrate to external services by:

1. Setting up one or more external services
2. Updating your frontend to use `/api/transcript-external` instead of `/api/transcript`
3. Adding the `service` parameter to specify which service to use

The external services provide better reliability and often higher accuracy than local extraction methods. 