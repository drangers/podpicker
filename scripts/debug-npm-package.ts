import { YoutubeTranscript } from 'youtube-transcript';

async function debugNpmPackage() {
  console.log('🔍 Debugging npm package...');
  
  const testUrls = [
    'https://www.youtube.com/watch?v=8jPQjjsBbIc', // TED Talk
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll
    'https://www.youtube.com/watch?v=9bZkp7q19f0'  // Gangnam Style
  ];
  
  for (const url of testUrls) {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    console.log(`\n📹 Testing video ID: ${videoId}`);
    
    if (!videoId) {
      console.log('❌ Could not extract video ID from URL');
      continue;
    }
    
    try {
      console.log('📖 Fetching transcript...');
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      console.log(`✅ Success! Raw transcript:`, transcript);
      console.log(`📊 Length: ${transcript.length}`);
      
      if (transcript.length > 0) {
        console.log(`📝 First item:`, transcript[0]);
      }
      
    } catch (error) {
      console.log(`❌ Error:`, error);
    }
  }
}

debugNpmPackage(); 