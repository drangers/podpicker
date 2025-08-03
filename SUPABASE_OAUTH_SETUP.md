# Supabase OAuth Configuration Guide

This guide provides step-by-step instructions for configuring Supabase OAuth authentication for both local development and production environments.

## Overview

The podcast curator application uses Supabase for authentication with Google OAuth. This setup ensures secure user authentication and proper token management for YouTube API access.

## Prerequisites

1. Supabase project created
2. Google Cloud Console project with OAuth 2.0 credentials
3. YouTube Data API v3 enabled
4. Vercel deployment (for production)

## Step 1: Supabase Project Setup

### 1.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `podcast-curator`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
5. Click "Create new project"

### 1.2 Get Supabase Credentials

1. In your Supabase dashboard, go to "Settings" > "API"
2. Copy the following values:
   - Project URL (e.g., `https://your-project.supabase.co`)
   - Anon public key
   - Service role key (keep this secret)

## Step 2: Google OAuth Setup

### 2.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing for the project

### 2.2 Enable YouTube Data API

1. Go to "APIs & Services" > "Library"
2. Search for "YouTube Data API v3"
3. Click on it and press "Enable"

### 2.3 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized redirect URIs:

#### For Development:
```
http://localhost:3000/auth/callback
```

#### For Production:
```
https://your-vercel-domain.vercel.app/auth/callback
```

5. Note down the Client ID and Client Secret

## Step 3: Supabase OAuth Configuration

### 3.1 Enable Google Provider

1. In your Supabase dashboard, go to "Authentication" > "Providers"
2. Find "Google" in the list and click "Enable"
3. Add your Google OAuth credentials:
   - Client ID: Your Google OAuth Client ID
   - Client Secret: Your Google OAuth Client Secret

### 3.2 Configure Redirect URLs

In the same Google provider settings, add the following redirect URLs:

#### For Development:
```
http://localhost:3000/auth/callback
```

#### For Production:
```
https://your-vercel-domain.vercel.app/auth/callback
```

### 3.3 Configure Site URL

1. Go to "Authentication" > "Settings"
2. Set the Site URL:
   - Development: `http://localhost:3000`
   - Production: `https://your-vercel-domain.vercel.app`

## Step 4: Environment Variables

### 4.1 Local Development (.env.local)

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Site URL (for OAuth redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4.2 Production (Vercel Environment Variables)

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" > "Environment Variables"
4. Add the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Site URL (for OAuth redirects)
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
```

## Step 5: Vercel Deployment Configuration

### 5.1 Get Your Vercel Domain

1. Deploy your project to Vercel
2. Note your production domain (e.g., `https://podcast-curator.vercel.app`)

### 5.2 Update Google OAuth Redirect URLs

1. Go back to Google Cloud Console
2. Update your OAuth 2.0 credentials
3. Add your Vercel production URL to authorized redirect URIs:
   ```
   https://your-vercel-domain.vercel.app/auth/callback
   ```

### 5.3 Update Supabase Redirect URLs

1. Go to your Supabase dashboard
2. Update the Google provider redirect URLs to include your production domain
3. Update the Site URL in Authentication settings

## Step 6: Testing the Configuration

### 6.1 Local Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. Verify you're redirected to the dashboard

### 6.2 Production Testing

1. Deploy to Vercel
2. Visit your production URL
3. Test the OAuth flow
4. Verify authentication works correctly

## Troubleshooting

### Common Issues

#### 1. "Invalid redirect URI" Error

**Cause**: Redirect URI not configured in Google Cloud Console or Supabase

**Solution**:
- Add the exact redirect URI to Google OAuth credentials
- Update Supabase redirect URLs
- Ensure environment variables are correct

#### 2. "Authentication required" Error

**Cause**: User not properly authenticated

**Solution**:
- Check if user completed OAuth flow
- Verify Supabase session is valid
- Check browser console for errors

#### 3. "No OAuth token available" Error

**Cause**: OAuth tokens not properly stored

**Solution**:
- Ensure user signed in with Google OAuth
- Check Supabase session for provider tokens
- Verify OAuth flow completed successfully

#### 4. CORS Errors

**Cause**: Domain not allowed in Supabase settings

**Solution**:
- Add your domain to Supabase allowed origins
- Update Site URL in Supabase settings
- Check environment variables

### Debug Steps

1. **Check Browser Console**: Look for authentication errors
2. **Verify Environment Variables**: Ensure all required variables are set
3. **Test OAuth Flow**: Complete the full authentication flow
4. **Check Supabase Logs**: Look for authentication events
5. **Use Test Endpoint**: Call `/api/test-oauth` to verify configuration

## Security Best Practices

### 1. Environment Variables
- Never commit sensitive credentials to version control
- Use different credentials for development and production
- Regularly rotate API keys and secrets

### 2. OAuth Configuration
- Use HTTPS for all production URLs
- Implement proper error handling
- Monitor authentication events

### 3. Supabase Security
- Enable Row Level Security (RLS) on tables
- Configure proper policies
- Monitor authentication logs

## Monitoring and Maintenance

### 1. Authentication Logs
- Monitor Supabase authentication events
- Set up alerts for failed authentication attempts
- Track OAuth token refresh events

### 2. API Usage
- Monitor YouTube API quota usage
- Track OAuth vs API key usage
- Set up alerts for quota limits

### 3. Error Tracking
- Monitor application errors
- Track authentication failures
- Set up error reporting

## Production Checklist

Before deploying to production, ensure:

- [ ] Google OAuth credentials configured for production domain
- [ ] Supabase redirect URLs updated for production
- [ ] Environment variables set in Vercel
- [ ] HTTPS enabled for all URLs
- [ ] Error handling implemented
- [ ] Monitoring configured
- [ ] Security policies in place
- [ ] Backup authentication method available

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Supabase and Google Cloud Console logs
3. Test with the `/api/test-oauth` endpoint
4. Verify all environment variables are correct
5. Ensure all redirect URLs are properly configured

## Additional Resources

- [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication Guide](https://nextjs.org/docs/authentication)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables) 