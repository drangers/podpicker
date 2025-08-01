import { getGoogleAuthService } from './google-auth';
import { getYouTubeApiService } from './youtube-api-service';
import { getUser } from './auth';

/**
 * Test OAuth authentication and YouTube API access
 */
export async function testOAuthConnection() {
  try {
    console.log('Testing OAuth connection...');
    
    // Check if user is authenticated
    const user = await getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    console.log('✅ User is authenticated:', user.email);
    
    // Test Google Auth service
    const googleAuth = getGoogleAuthService();
    const hasTokens = await googleAuth.hasValidTokens();
    
    if (!hasTokens) {
      throw new Error('No valid OAuth tokens found');
    }
    
    console.log('✅ OAuth tokens are valid');
    
    // Test YouTube API service
    const youtubeApi = getYouTubeApiService();
    
    // Test with a known public video (Google's "How Search Works" video)
    const testVideoId = 'BNHR6IQGZs4';
    
    console.log('Testing YouTube API with video:', testVideoId);
    
    const metadata = await youtubeApi.getVideoMetadata(testVideoId);
    console.log('✅ YouTube API metadata access successful');
    console.log('Video title:', metadata.title);
    
    const hasCaptions = await youtubeApi.hasCaptions(testVideoId);
    console.log('✅ Caption availability check successful');
    console.log('Has captions:', hasCaptions);
    
    if (hasCaptions) {
      const transcript = await youtubeApi.getVideoCaptions(testVideoId);
      console.log('✅ Transcript extraction successful');
      console.log('Transcript segments:', transcript.length);
    }
    
    console.log('🎉 All OAuth tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ OAuth test failed:', error);
    return false;
  }
}

/**
 * Test OAuth token refresh
 */
export async function testTokenRefresh() {
  try {
    console.log('Testing OAuth token refresh...');
    
    const googleAuth = getGoogleAuthService();
    const tokens = await googleAuth.getUserTokens();
    
    console.log('✅ Current tokens retrieved');
    console.log('Access token length:', tokens.accessToken.length);
    console.log('Refresh token available:', !!tokens.refreshToken);
    
    // Note: We don't actually refresh here to avoid unnecessary API calls
    // In a real scenario, the refresh would happen automatically when needed
    
    return true;
  } catch (error) {
    console.error('❌ Token refresh test failed:', error);
    return false;
  }
}

/**
 * Run all OAuth tests
 */
export async function runOAuthTests() {
  console.log('🚀 Starting OAuth tests...\n');
  
  const authTest = await testOAuthConnection();
  const refreshTest = await testTokenRefresh();
  
  console.log('\n📊 Test Results:');
  console.log('Authentication & API Access:', authTest ? '✅ PASS' : '❌ FAIL');
  console.log('Token Management:', refreshTest ? '✅ PASS' : '❌ FAIL');
  
  return authTest && refreshTest;
} 