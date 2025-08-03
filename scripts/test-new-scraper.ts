import { scrapeYouTubeTranscriptUnified } from '../src/lib/youtube-transcript-unified';

async function testScraper() {
  console.log('🧪 Testing new YouTube transcript scraper...');
  
  // Test with a YouTube video that definitely has transcripts (TED Talk)
  const testUrl = 'https://www.youtube.com/watch?v=8jPQjjsBbIc'; // TED Talk - has transcripts
  
  try {
    console.log(`📹 Testing with URL: ${testUrl}`);
    
    const startTime = Date.now();
    const transcript = await scrapeYouTubeTranscriptUnified(testUrl);
    const endTime = Date.now();
    
    console.log('✅ Test completed successfully!');
    console.log(`⏱️ Time taken: ${endTime - startTime}ms`);
    console.log(`📊 Results:`);
    console.log(`  - Video ID: ${transcript.videoId}`);
    console.log(`  - Title: ${transcript.title}`);
    console.log(`  - Segments: ${transcript.segments.length}`);
    console.log(`  - Full text length: ${transcript.fullText.length} characters`);
    
    if (transcript.segments.length > 0) {
      console.log(`📝 First segment: "${transcript.segments[0].text.substring(0, 100)}..."`);
      console.log(`📝 Last segment: "${transcript.segments[transcript.segments.length - 1].text.substring(0, 100)}..."`);
    }
    
    console.log('🎉 Test passed! The new scraper is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testScraper(); 