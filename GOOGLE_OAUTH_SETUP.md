# Google OAuth Setup for YouTube API

This guide explains how to set up Google OAuth authentication for YouTube API access in the podcast curator application.

## Overview

The application now supports using Google OAuth tokens instead of API keys for YouTube API requests. This provides better security and user-specific access to YouTube data.

## Prerequisites

1. A Google Cloud Project
2. YouTube Data API v3 enabled
3. OAuth 2.0 credentials configured

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for the project

### 2. Enable YouTube Data API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "YouTube Data API v3"
3. Click on it and press "Enable"

### 4. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)
5. Note down the Client ID and Client Secret

### 5. Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# Supabase Configuration (for OAuth token storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Site URL (for OAuth redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 6. Configure Supabase for OAuth

1. In your Supabase dashboard, go to "Authentication" > "Providers"
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID: Your Google OAuth Client ID
   - Client Secret: Your Google OAuth Client Secret
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

## Usage

### API Endpoints

The application now provides OAuth-authenticated endpoints:

- `POST /api/transcript-oauth` - Get transcript using OAuth
- `POST /api/check-transcript-oauth` - Check transcript availability using OAuth
- `GET /api/youtube-data` - Get video metadata using OAuth (updated)

### Authentication Flow

1. User signs in with Google OAuth through Supabase
2. Supabase stores the OAuth tokens
3. API calls use the stored tokens to authenticate with YouTube API
4. Tokens are automatically refreshed when needed

### Benefits of OAuth Authentication

1. **User-specific access**: Each user has their own YouTube API quota
2. **Better security**: No need to store API keys in the application
3. **Higher quotas**: OAuth users get higher API quotas than API key users
4. **Access to private content**: Users can access their own private videos

## Troubleshooting

### Common Issues

1. **"Authentication required" error**
   - Ensure user is signed in with Google OAuth
   - Check that Supabase is properly configured

2. **"No OAuth token available" error**
   - User needs to sign in with Google OAuth
   - Check that the OAuth flow completed successfully

3. **"Failed to create authenticated YouTube client" error**
   - Verify Google OAuth credentials are correct
   - Check that YouTube Data API is enabled

4. **"Video not found" error**
   - Video might be private or restricted
   - Check that the video ID is correct

### Debug Steps

1. Check browser console for authentication errors
2. Verify environment variables are set correctly
3. Test OAuth flow in development environment
4. Check Supabase logs for authentication issues

## Migration from API Keys

If you're migrating from API key-based authentication:

1. Keep your existing API key for fallback
2. Update your frontend to use OAuth endpoints
3. Test with a few users before full migration
4. Monitor API usage and quotas

## Security Considerations

1. Never expose OAuth credentials in client-side code
2. Use environment variables for all sensitive configuration
3. Implement proper error handling for authentication failures
4. Consider implementing rate limiting for OAuth endpoints
5. Monitor and log authentication attempts

## API Rate Limits

- OAuth users get higher quotas than API key users
- Monitor usage in Google Cloud Console
- Implement caching for frequently requested data
- Consider implementing request queuing for high-traffic scenarios 