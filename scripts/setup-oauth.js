#!/usr/bin/env node

/**
 * OAuth Setup Script for Podcast Curator
 * 
 * This script helps validate and configure OAuth settings for both
 * local development and production environments.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Podcast Curator OAuth Setup Script\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ .env.local file not found');
  console.log('📝 Creating .env.local template...\n');
  
  const envTemplate = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Site URL (for OAuth redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# YouTube API (fallback)
YOUTUBE_API_KEY=your_youtube_api_key_here
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local template');
  console.log('📝 Please update the values in .env.local with your actual credentials\n');
} else {
  console.log('✅ .env.local file found');
}

// Check required files exist
const requiredFiles = [
  'src/app/auth/callback/route.ts',
  'src/app/auth/auth-code-error/page.tsx',
  'src/lib/auth.ts',
  'src/lib/google-auth.ts',
  'src/lib/supabase.ts'
];

console.log('\n🔍 Checking required files...');

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing`);
  }
});

// Configuration checklist
console.log('\n📋 Configuration Checklist:');
console.log('\n1. Supabase Setup:');
console.log('   ☐ Create Supabase project');
console.log('   ☐ Enable Google OAuth provider');
console.log('   ☐ Configure redirect URLs');
console.log('   ☐ Set Site URL');

console.log('\n2. Google Cloud Console:');
console.log('   ☐ Create OAuth 2.0 credentials');
console.log('   ☐ Enable YouTube Data API v3');
console.log('   ☐ Add redirect URIs:');
console.log('      - http://localhost:3000/auth/callback (development)');
console.log('      - https://your-domain.vercel.app/auth/callback (production)');

console.log('\n3. Environment Variables:');
console.log('   ☐ NEXT_PUBLIC_SUPABASE_URL');
console.log('   ☐ NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('   ☐ SUPABASE_SERVICE_ROLE_KEY');
console.log('   ☐ GOOGLE_CLIENT_ID');
console.log('   ☐ GOOGLE_CLIENT_SECRET');
console.log('   ☐ NEXT_PUBLIC_SITE_URL');

console.log('\n4. Production Setup:');
console.log('   ☐ Deploy to Vercel');
console.log('   ☐ Set environment variables in Vercel');
console.log('   ☐ Update Google OAuth redirect URLs');
console.log('   ☐ Update Supabase redirect URLs');

console.log('\n5. Testing:');
console.log('   ☐ Test local OAuth flow');
console.log('   ☐ Test production OAuth flow');
console.log('   ☐ Verify authentication works');

console.log('\n📚 For detailed instructions, see:');
console.log('   - SUPABASE_OAUTH_SETUP.md');
console.log('   - GOOGLE_OAUTH_SETUP.md');

console.log('\n🚀 To start development:');
console.log('   npm run dev');

console.log('\n🔗 Useful URLs:');
console.log('   - Local: http://localhost:3000');
console.log('   - Supabase Dashboard: https://supabase.com/dashboard');
console.log('   - Google Cloud Console: https://console.cloud.google.com/');
console.log('   - Vercel Dashboard: https://vercel.com/dashboard'); 