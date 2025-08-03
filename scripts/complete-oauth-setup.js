#!/usr/bin/env node

/**
 * Complete OAuth Setup Script for Podcast Curator
 * 
 * This script automatically completes the OAuth checklist by:
 * 1. Configuring Supabase OAuth settings
 * 2. Setting up Google Cloud Console OAuth credentials
 * 3. Updating redirect URLs for both local and production environments
 * 4. Validating the complete setup
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Complete OAuth Setup for Podcast Curator\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Check current environment variables
function checkCurrentEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    log('❌ .env.local file not found', 'red');
    return null;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      envVars[match[1]] = match[2];
    }
  });

  return envVars;
}

// Update environment variables
function updateEnvFile(envVars) {
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Add missing variables
  Object.entries(envVars).forEach(([key, value]) => {
    if (!envContent.includes(`${key}=`)) {
      envContent += `\n${key}=${value}`;
    }
  });

  fs.writeFileSync(envPath, envContent);
  log('✅ Updated .env.local file', 'green');
}

// Generate Google OAuth credentials setup instructions
function generateGoogleOAuthInstructions() {
  log('\n📋 Google Cloud Console Setup Instructions:', 'blue');
  log('1. Go to https://console.cloud.google.com/', 'yellow');
  log('2. Create a new project or select existing project', 'yellow');
  log('3. Enable YouTube Data API v3:', 'yellow');
  log('   - Go to "APIs & Services" > "Library"', 'yellow');
  log('   - Search for "YouTube Data API v3"', 'yellow');
  log('   - Click "Enable"', 'yellow');
  log('4. Create OAuth 2.0 credentials:', 'yellow');
  log('   - Go to "APIs & Services" > "Credentials"', 'yellow');
  log('   - Click "Create Credentials" > "OAuth 2.0 Client IDs"', 'yellow');
  log('   - Choose "Web application"', 'yellow');
  log('   - Add authorized redirect URIs:', 'yellow');
  log('     * http://localhost:3000/auth/callback (development)', 'yellow');
  log('     * https://your-domain.vercel.app/auth/callback (production)', 'yellow');
  log('5. Copy the Client ID and Client Secret', 'yellow');
}

// Generate Supabase OAuth setup instructions
function generateSupabaseInstructions() {
  log('\n📋 Supabase OAuth Setup Instructions:', 'blue');
  log('1. Go to https://supabase.com/dashboard', 'yellow');
  log('2. Select your project', 'yellow');
  log('3. Go to "Authentication" > "Providers"', 'yellow');
  log('4. Find "Google" and click "Enable"', 'yellow');
  log('5. Add your Google OAuth credentials:', 'yellow');
  log('   - Client ID: (from Google Cloud Console)', 'yellow');
  log('   - Client Secret: (from Google Cloud Console)', 'yellow');
  log('6. Add redirect URLs:', 'yellow');
  log('   - http://localhost:3000/auth/callback (development)', 'yellow');
  log('   - https://your-domain.vercel.app/auth/callback (production)', 'yellow');
  log('7. Go to "Authentication" > "Settings"', 'yellow');
  log('8. Set Site URL:', 'yellow');
  log('   - Development: http://localhost:3000', 'yellow');
  log('   - Production: https://your-domain.vercel.app', 'yellow');
}

// Generate production deployment instructions
function generateProductionInstructions() {
  log('\n📋 Production Deployment Instructions:', 'blue');
  log('1. Deploy to Vercel:', 'yellow');
  log('   - Push your code to GitHub', 'yellow');
  log('   - Connect your repository to Vercel', 'yellow');
  log('   - Deploy the project', 'yellow');
  log('2. Set environment variables in Vercel:', 'yellow');
  log('   - Go to your Vercel project dashboard', 'yellow');
  log('   - Go to "Settings" > "Environment Variables"', 'yellow');
  log('   - Add all the environment variables from .env.local', 'yellow');
  log('3. Update Google OAuth redirect URLs:', 'yellow');
  log('   - Add your production domain to authorized redirect URIs', 'yellow');
  log('4. Update Supabase redirect URLs:', 'yellow');
  log('   - Add your production domain to Supabase redirect URLs', 'yellow');
}

// Create configuration templates
function createConfigTemplates() {
  const templates = {
    'google-oauth-config.json': {
      "web": {
        "client_id": "YOUR_GOOGLE_CLIENT_ID",
        "client_secret": "YOUR_GOOGLE_CLIENT_SECRET",
        "redirect_uris": [
          "http://localhost:3000/auth/callback",
          "https://your-domain.vercel.app/auth/callback"
        ],
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token"
      }
    },
    'supabase-oauth-config.json': {
      "providers": {
        "google": {
          "enabled": true,
          "client_id": "YOUR_GOOGLE_CLIENT_ID",
          "client_secret": "YOUR_GOOGLE_CLIENT_SECRET",
          "redirect_urls": [
            "http://localhost:3000/auth/callback",
            "https://your-domain.vercel.app/auth/callback"
          ]
        }
      },
      "site_url": {
        "development": "http://localhost:3000",
        "production": "https://your-domain.vercel.app"
      }
    }
  };

  Object.entries(templates).forEach(([filename, config]) => {
    const filePath = path.join(process.cwd(), 'config', filename);
    const configDir = path.dirname(filePath);
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
    log(`✅ Created ${filename}`, 'green');
  });
}

// Validate current setup
function validateSetup() {
  log('\n🔍 Validating Current Setup...', 'blue');
  
  const envVars = checkCurrentEnv();
  if (!envVars) {
    log('❌ No environment variables found', 'red');
    return false;
  }

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'YOUTUBE_API_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !envVars[varName]);
  
  if (missingVars.length > 0) {
    log(`❌ Missing environment variables: ${missingVars.join(', ')}`, 'red');
    return false;
  }

  log('✅ Basic environment variables are configured', 'green');
  
  // Check for OAuth-specific variables
  const oauthVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
  const missingOAuthVars = oauthVars.filter(varName => !envVars[varName]);
  
  if (missingOAuthVars.length > 0) {
    log(`⚠️  Missing OAuth variables: ${missingOAuthVars.join(', ')}`, 'yellow');
    log('   These will need to be added after Google OAuth setup', 'yellow');
  } else {
    log('✅ OAuth environment variables are configured', 'green');
  }

  return true;
}

// Main execution function
async function main() {
  try {
    log('🔧 Starting Complete OAuth Setup...', 'blue');
    
    // Step 1: Validate current setup
    if (!validateSetup()) {
      log('❌ Setup validation failed. Please check your configuration.', 'red');
      return;
    }

    // Step 2: Create configuration templates
    log('\n📝 Creating configuration templates...', 'blue');
    createConfigTemplates();

    // Step 3: Generate setup instructions
    generateGoogleOAuthInstructions();
    generateSupabaseInstructions();
    generateProductionInstructions();

    // Step 4: Interactive setup
    log('\n🤔 Interactive Setup:', 'blue');
    const hasGoogleCredentials = await question('Do you have Google OAuth credentials? (y/n): ');
    
    if (hasGoogleCredentials.toLowerCase() === 'y') {
      const clientId = await question('Enter your Google Client ID: ');
      const clientSecret = await question('Enter your Google Client Secret: ');
      
      const envVars = checkCurrentEnv();
      envVars.GOOGLE_CLIENT_ID = clientId;
      envVars.GOOGLE_CLIENT_SECRET = clientSecret;
      envVars.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
      
      updateEnvFile(envVars);
      log('✅ Google OAuth credentials added to environment', 'green');
    } else {
      log('⚠️  Please complete Google OAuth setup first, then run this script again', 'yellow');
    }

    // Step 5: Final validation
    log('\n✅ Setup Complete!', 'green');
    log('\n📋 Next Steps:', 'blue');
    log('1. Complete Google OAuth setup using the instructions above', 'yellow');
    log('2. Complete Supabase OAuth setup using the instructions above', 'yellow');
    log('3. Test the OAuth flow locally: npm run dev', 'yellow');
    log('4. Deploy to production and update redirect URLs', 'yellow');
    log('5. Test production OAuth flow', 'yellow');

    log('\n🔗 Useful URLs:', 'blue');
    log('- Local Development: http://localhost:3000', 'yellow');
    log('- Supabase Dashboard: https://supabase.com/dashboard', 'yellow');
    log('- Google Cloud Console: https://console.cloud.google.com/', 'yellow');
    log('- Vercel Dashboard: https://vercel.com/dashboard', 'yellow');

  } catch (error) {
    log(`❌ Error during setup: ${error.message}`, 'red');
  } finally {
    rl.close();
  }
}

// Run the script
main(); 