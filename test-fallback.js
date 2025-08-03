// Import the fallback implementation
const { fetchTranscriptFallback, scrapeYouTubeTranscriptFallback } = require('./src/lib/youtube-transcript-fallback.ts');

async function testFallback() {
  const videoUrl = 'https://www.youtube.com/watch?v=UF8uR6Z6KLc';
  
  console.log('Testing fallback transcript implementation for:', videoUrl);
  
  try {
    // Test the main scraping function
    console.log('Testing scrapeYouTubeTranscriptFallback...');
    const result = await scrapeYouTubeTranscriptFallback(videoUrl);
    
    console.log('✅ Success!');
    console.log('Video ID:', result.videoId);
    console.log('Title:', result.title);
    console.log('Segments:', result.segments.length);
    console.log('Full text length:', result.fullText.length);
    
    if (result.segments.length > 0) {
      console.log('First segment:', result.segments[0]);
      console.log('Last segment:', result.segments[result.segments.length - 1]);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFallback(); 