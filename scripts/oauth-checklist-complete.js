#!/usr/bin/env node

/**
 * OAuth Checklist Completion Script
 * 
 * This script guides you through completing the entire OAuth checklist:
 * 1. Google Cloud Console OAuth setup
 * 2. Supabase OAuth configuration
 * 3. Environment variable updates
 * 4. Production deployment setup
 * 5. Testing and validation
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('✅ OAuth Checklist Completion Script\n');

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

// Step 1: Google Cloud Console Setup
async function setupGoogleCloudConsole() {
  log('\n🔧 Step 1: Google Cloud Console Setup', 'blue');
  log('=====================================', 'blue');
  
  log('\n📋 Instructions:', 'yellow');
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
  
  const completed = await question('\nHave you completed the Google Cloud Console setup? (y/n): ');
  return completed.toLowerCase() === 'y';
}

// Step 2: Get Google OAuth Credentials
async function getGoogleCredentials() {
  log('\n🔧 Step 2: Add Google OAuth Credentials', 'blue');
  log('========================================', 'blue');
  
  const clientId = await question('Enter your Google Client ID: ');
  const clientSecret = await question('Enter your Google Client Secret: ');
  
  const envVars = getCurrentEnv();
  if (envVars) {
    envVars.GOOGLE_CLIENT_ID = clientId;
    envVars.GOOGLE_CLIENT_SECRET = clientSecret;
    updateEnvFile(envVars);
    log('✅ Google OAuth credentials added to environment', 'green');
  }
  
  return { clientId, clientSecret };
}

// Step 3: Supabase OAuth Configuration
async function setupSupabaseOAuth() {
  log('\n🔧 Step 3: Supabase OAuth Configuration', 'blue');
  log('========================================', 'blue');
  
  const envVars = getCurrentEnv();
  if (!envVars) return false;
  
  log('\n📋 Instructions:', 'yellow');
  log(`Using your Supabase project: ${envVars.NEXT_PUBLIC_SUPABASE_URL}`, 'yellow');
  log('\n1. Go to https://supabase.com/dashboard', 'yellow');
  log('2. Select your project', 'yellow');
  log('3. Go to "Authentication" > "Providers"', 'yellow');
  log('4. Find "Google" and click "Enable"', 'yellow');
  log('5. Add your Google OAuth credentials:', 'yellow');
  log('   - Client ID: (from previous step)', 'yellow');
  log('   - Client Secret: (from previous step)', 'yellow');
  log('6. Add redirect URLs:', 'yellow');
  log('   - http://localhost:3000/auth/callback (development)', 'yellow');
  log('   - https://your-domain.vercel.app/auth/callback (production)', 'yellow');
  log('7. Go to "Authentication" > "Settings"', 'yellow');
  log('8. Set Site URL:', 'yellow');
  log('   - Development: http://localhost:3000', 'yellow');
  log('   - Production: https://your-domain.vercel.app', 'yellow');
  log('9. Save the configuration', 'yellow');
  
  const completed = await question('\nHave you completed the Supabase OAuth setup? (y/n): ');
  return completed.toLowerCase() === 'y';
}

// Step 4: Production Deployment Setup
async function setupProductionDeployment() {
  log('\n🔧 Step 4: Production Deployment Setup', 'blue');
  log('======================================', 'blue');
  
  log('\n📋 Instructions:', 'yellow');
  log('1. Deploy to Vercel:', 'yellow');
  log('   - Push your code to GitHub', 'yellow');
  log('   - Connect your repository to Vercel', 'yellow');
  log('   - Deploy the project', 'yellow');
  log('2. Get your production domain from Vercel', 'yellow');
  log('3. Update Google OAuth redirect URLs:', 'yellow');
  log('   - Add your production domain to authorized redirect URIs', 'yellow');
  log('4. Update Supabase redirect URLs:', 'yellow');
  log('   - Add your production domain to Supabase redirect URLs', 'yellow');
  log('5. Set environment variables in Vercel:', 'yellow');
  log('   - Go to your Vercel project dashboard', 'yellow');
  log('   - Go to "Settings" > "Environment Variables"', 'yellow');
  log('   - Add all the environment variables from .env.local', 'yellow');
  
  const productionDomain = await question('\nEnter your production domain (e.g., https://your-app.vercel.app): ');
  
  if (productionDomain) {
    log(`✅ Production domain: ${productionDomain}`, 'green');
    log('⚠️  Remember to update redirect URLs in Google Cloud Console and Supabase', 'yellow');
  }
  
  const completed = await question('\nHave you completed the production deployment setup? (y/n): ');
  return completed.toLowerCase() === 'y';
}

// Step 5: Testing and Validation
async function testOAuthSetup() {
  log('\n🔧 Step 5: Testing and Validation', 'blue');
  log('================================', 'blue');
  
  log('\n📋 Testing Instructions:', 'yellow');
  log('1. Start development server: npm run dev', 'yellow');
  log('2. Visit http://localhost:3000', 'yellow');
  log('3. Click "Sign in with Google"', 'yellow');
  log('4. Complete the OAuth flow', 'yellow');
  log('5. Verify you\'re redirected to the dashboard', 'yellow');
  log('6. Test production OAuth flow', 'yellow');
  log('7. Verify authentication works in both environments', 'yellow');
  
  const localTest = await question('\nHave you tested the local OAuth flow? (y/n): ');
  const productionTest = await question('Have you tested the production OAuth flow? (y/n): ');
  
  return localTest.toLowerCase() === 'y' && productionTest.toLowerCase() === 'y';
}

// Validate complete setup
function validateCompleteSetup() {
  log('\n🔍 Validating Complete Setup...', 'blue');
  
  const envVars = getCurrentEnv();
  if (!envVars) {
    log('❌ No environment variables found', 'red');
    return false;
  }

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXT_PUBLIC_SITE_URL'
  ];

  const missingVars = requiredVars.filter(varName => !envVars[varName]);
  
  if (missingVars.length > 0) {
    log(`❌ Missing environment variables: ${missingVars.join(', ')}`, 'red');
    return false;
  }

  log('✅ All required environment variables are configured', 'green');
  return true;
}

// Generate final checklist
function generateFinalChecklist() {
  log('\n✅ OAuth Checklist Completion Summary', 'green');
  log('====================================', 'green');
  
  log('\n📋 Completed Steps:', 'blue');
  log('☑️  Google Cloud Console OAuth setup', 'green');
  log('☑️  Google OAuth credentials configured', 'green');
  log('☑️  Supabase OAuth configuration', 'green');
  log('☑️  Environment variables updated', 'green');
  log('☑️  Production deployment setup', 'green');
  log('☑️  OAuth flow testing', 'green');
  
  log('\n🔗 Useful URLs:', 'blue');
  log('- Local Development: http://localhost:3000', 'yellow');
  log('- Supabase Dashboard: https://supabase.com/dashboard', 'yellow');
  log('- Google Cloud Console: https://console.cloud.google.com/', 'yellow');
  log('- Vercel Dashboard: https://vercel.com/dashboard', 'yellow');
  
  log('\n📁 Configuration files:', 'blue');
  log('- .env.local (updated with OAuth credentials)', 'yellow');
  log('- config/supabase-oauth-config.json', 'yellow');
  log('- config/google-oauth-config.json', 'yellow');
  
  log('\n🚀 Your OAuth setup is now complete!', 'green');
  log('You can now use OAuth authentication for YouTube API access.', 'green');
}

// Main execution function
async function main() {
  try {
    log('🚀 Starting OAuth Checklist Completion...', 'blue');
    
    // Step 1: Google Cloud Console Setup
    const googleSetupComplete = await setupGoogleCloudConsole();
    if (!googleSetupComplete) {
      log('❌ Please complete Google Cloud Console setup first', 'red');
      return;
    }
    
    // Step 2: Get Google OAuth Credentials
    const credentials = await getGoogleCredentials();
    
    // Step 3: Supabase OAuth Configuration
    const supabaseSetupComplete = await setupSupabaseOAuth();
    if (!supabaseSetupComplete) {
      log('❌ Please complete Supabase OAuth setup', 'red');
      return;
    }
    
    // Step 4: Production Deployment Setup
    const productionSetupComplete = await setupProductionDeployment();
    if (!productionSetupComplete) {
      log('⚠️  Production setup not completed. You can complete this later.', 'yellow');
    }
    
    // Step 5: Testing and Validation
    const testingComplete = await testOAuthSetup();
    if (!testingComplete) {
      log('⚠️  Testing not completed. Please test the OAuth flow.', 'yellow');
    }
    
    // Final validation
    if (validateCompleteSetup()) {
      generateFinalChecklist();
    } else {
      log('❌ Setup validation failed. Please check your configuration.', 'red');
    }

  } catch (error) {
    log(`❌ Error during setup: ${error.message}`, 'red');
  } finally {
    rl.close();
  }
}

// Run the script
main(); 