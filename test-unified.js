const { execSync } = require('child_process');

async function testUnified() {
  try {
    console.log('🧪 Testing unified youtube-transcript implementation...');
    
    // Use tsx to run the TypeScript file directly
    const result = execSync('npx tsx -e "import { scrapeYouTubeTranscriptUnified } from \'./src/lib/youtube-transcript-unified.ts\'; scrapeYouTubeTranscriptUnified(\'https://www.youtube.com/watch?v=dQw4w9WgXcQ\').then(console.log).catch(console.error)"', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('✅ Test completed successfully');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUnified(); 