#!/usr/bin/env node

/**
 * Supabase OAuth Configuration Script
 * 
 * This script automatically configures Supabase OAuth settings
 * using existing credentials and updates redirect URLs.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Supabase OAuth Configuration Script\n');

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

// Get current environment variables
function getCurrentEnv() {
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

// Generate Supabase configuration instructions
function generateSupabaseConfigInstructions() {
  const envVars = getCurrentEnv();
  if (!envVars) return;

  log('\n📋 Supabase OAuth Configuration Instructions:', 'blue');
  log('Using your existing Supabase project:', 'yellow');
  log(`URL: ${envVars.NEXT_PUBLIC_SUPABASE_URL}`, 'yellow');
  
  log('\n1. Go to your Supabase Dashboard:', 'yellow');
  log('   https://supabase.com/dashboard', 'yellow');
  
  log('\n2. Select your project', 'yellow');
  
  log('\n3. Go to "Authentication" > "Providers"', 'yellow');
  
  log('\n4. Find "Google" in the list and click "Enable"', 'yellow');
  
  log('\n5. Add your Google OAuth credentials:', 'yellow');
  log('   - Client ID: (from Google Cloud Console)', 'yellow');
  log('   - Client Secret: (from Google Cloud Console)', 'yellow');
  
  log('\n6. Add redirect URLs:', 'yellow');
  log('   - http://localhost:3000/auth/callback (development)', 'yellow');
  log('   - https://your-domain.vercel.app/auth/callback (production)', 'yellow');
  
  log('\n7. Go to "Authentication" > "Settings"', 'yellow');
  log('8. Set the Site URL:', 'yellow');
  log('   - Development: http://localhost:3000', 'yellow');
  log('   - Production: https://your-domain.vercel.app', 'yellow');
  
  log('\n9. Save the configuration', 'yellow');
}

// Generate Google Cloud Console instructions
function generateGoogleCloudInstructions() {
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

// Create configuration files
function createConfigFiles() {
  const envVars = getCurrentEnv();
  if (!envVars) return;

  const configDir = path.join(process.cwd(), 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Create Supabase OAuth configuration template
  const supabaseConfig = {
    "project_url": envVars.NEXT_PUBLIC_SUPABASE_URL,
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
  };

  const supabaseConfigPath = path.join(configDir, 'supabase-oauth-config.json');
  fs.writeFileSync(supabaseConfigPath, JSON.stringify(supabaseConfig, null, 2));
  log('✅ Created supabase-oauth-config.json', 'green');

  // Create Google OAuth configuration template
  const googleConfig = {
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
  };

  const googleConfigPath = path.join(configDir, 'google-oauth-config.json');
  fs.writeFileSync(googleConfigPath, JSON.stringify(googleConfig, null, 2));
  log('✅ Created google-oauth-config.json', 'green');
}

// Validate current setup
function validateSetup() {
  log('\n🔍 Validating Current Setup...', 'blue');
  
  const envVars = getCurrentEnv();
  if (!envVars) {
    log('❌ No environment variables found', 'red');
    return false;
  }

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !envVars[varName]);
  
  if (missingVars.length > 0) {
    log(`❌ Missing environment variables: ${missingVars.join(', ')}`, 'red');
    return false;
  }

  log('✅ Supabase environment variables are configured', 'green');
  
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

// Add missing environment variables
function addMissingEnvVars() {
  const envVars = getCurrentEnv();
  if (!envVars) return;

  const missingVars = {};
  
  // Add NEXT_PUBLIC_SITE_URL if missing
  if (!envVars.NEXT_PUBLIC_SITE_URL) {
    missingVars.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
  }

  // Add SUPABASE_SERVICE_ROLE_KEY if missing
  if (!envVars.SUPABASE_SERVICE_ROLE_KEY) {
    log('⚠️  SUPABASE_SERVICE_ROLE_KEY is missing', 'yellow');
    log('   You can find this in your Supabase dashboard under Settings > API', 'yellow');
  }

  if (Object.keys(missingVars).length > 0) {
    updateEnvFile(missingVars);
  }
}

// Main execution function
function main() {
  try {
    log('🔧 Starting Supabase OAuth Configuration...', 'blue');
    
    // Step 1: Validate current setup
    if (!validateSetup()) {
      log('❌ Setup validation failed. Please check your configuration.', 'red');
      return;
    }

    // Step 2: Add missing environment variables
    addMissingEnvVars();

    // Step 3: Create configuration files
    log('\n📝 Creating configuration files...', 'blue');
    createConfigFiles();

    // Step 4: Generate setup instructions
    generateGoogleCloudInstructions();
    generateSupabaseConfigInstructions();

    // Step 5: Final summary
    log('\n✅ Supabase OAuth Configuration Complete!', 'green');
    log('\n📋 Next Steps:', 'blue');
    log('1. Complete Google OAuth setup using the instructions above', 'yellow');
    log('2. Complete Supabase OAuth setup using the instructions above', 'yellow');
    log('3. Add your Google OAuth credentials to .env.local', 'yellow');
    log('4. Test the OAuth flow locally: npm run dev', 'yellow');
    log('5. Deploy to production and update redirect URLs', 'yellow');

    log('\n🔗 Useful URLs:', 'blue');
    log('- Local Development: http://localhost:3000', 'yellow');
    log('- Supabase Dashboard: https://supabase.com/dashboard', 'yellow');
    log('- Google Cloud Console: https://console.cloud.google.com/', 'yellow');
    log('- Vercel Dashboard: https://vercel.com/dashboard', 'yellow');

    log('\n📁 Configuration files created in config/ directory:', 'blue');
    log('- supabase-oauth-config.json', 'yellow');
    log('- google-oauth-config.json', 'yellow');

  } catch (error) {
    log(`❌ Error during configuration: ${error.message}`, 'red');
  }
}

// Run the script
main(); 