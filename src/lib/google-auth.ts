import { google } from 'googleapis';
import { supabase } from './supabase';

export interface GoogleAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class GoogleAuthService {
  private config: GoogleAuthConfig;

  constructor(config: GoogleAuthConfig) {
    this.config = config;
  }

  /**
   * Get the current user's Google OAuth tokens
   */
  async getUserTokens() {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.provider_token) {
        throw new Error('No Google OAuth token available');
      }

      return {
        accessToken: session.provider_token,
        refreshToken: session.provider_refresh_token,
      };
    } catch (error) {
      console.error('Error getting user tokens:', error);
      throw new Error('Failed to get Google OAuth tokens');
    }
  }

  /**
   * Create an authenticated YouTube API client
   */
  async createYouTubeClient() {
    try {
      const tokens = await this.getUserTokens();
      
      const oauth2Client = new google.auth.OAuth2(
        this.config.clientId,
        this.config.clientSecret,
        this.config.redirectUri
      );

      oauth2Client.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      return google.youtube({
        version: 'v3',
        auth: oauth2Client,
      });
    } catch (error) {
      console.error('Error creating YouTube client:', error);
      throw new Error('Failed to create authenticated YouTube client');
    }
  }

  /**
   * Check if user has valid Google OAuth tokens
   */
  async hasValidTokens(): Promise<boolean> {
    try {
      await this.getUserTokens();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Refresh the user's access token if needed
   */
  async refreshTokens() {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.provider_refresh_token) {
        throw new Error('No refresh token available');
      }

      const oauth2Client = new google.auth.OAuth2(
        this.config.clientId,
        this.config.clientSecret,
        this.config.redirectUri
      );

      oauth2Client.setCredentials({
        refresh_token: session.provider_refresh_token,
      });

      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Update the session with new tokens
      await supabase.auth.updateUser({
        data: {
          provider_token: credentials.access_token,
          provider_refresh_token: credentials.refresh_token || session.provider_refresh_token,
        }
      });

      return credentials;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      throw new Error('Failed to refresh OAuth tokens');
    }
  }
}

// Singleton instance
let googleAuthInstance: GoogleAuthService | null = null;

export function getGoogleAuthService(): GoogleAuthService {
  if (!googleAuthInstance) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    // Determine the correct redirect URI based on environment
    const isProduction = process.env.NODE_ENV === 'production'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const redirectUri = isProduction 
      ? `${siteUrl}/auth/callback`
      : 'http://localhost:3000/auth/callback'

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    googleAuthInstance = new GoogleAuthService({
      clientId,
      clientSecret,
      redirectUri,
    });
  }
  return googleAuthInstance;
}

export async function cleanupGoogleAuthService(): Promise<void> {
  googleAuthInstance = null;
} 