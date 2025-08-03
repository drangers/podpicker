const { YoutubeTranscript } = require('youtube-transcript');

async function testSimple() {
  const videoId = 'UF8uR6Z6KLc';
  
  console.log('Testing simple transcript extraction for:', videoId);
  
  try {
    console.log('Fetching transcript...');
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
    console.log(`Found ${transcriptData.length} segments`);
    
    if (transcriptData.length > 0) {
      console.log('First segment:', transcriptData[0]);
      console.log('Last segment:', transcriptData[transcriptData.length - 1]);
      
      const fullText = transcriptData.map(item => item.text).join(' ');
      console.log(`Full text length: ${fullText.length} characters`);
      
      return {
        videoId,
        title: `YouTube Video ${videoId}`,
        segments: transcriptData.map(item => ({
          text: item.text,
          start: parseFloat(String(item.offset || 0)) / 1000,
          duration: parseFloat(String(item.duration || 0)) / 1000
        })),
        fullText
      };
    } else {
      throw new Error('No transcript segments found');
    }
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

testSimple().then(result => {
  console.log('\n✅ SUCCESS!');
  console.log('Video ID:', result.videoId);
  console.log('Title:', result.title);
  console.log('Segments:', result.segments.length);
  console.log('Full text length:', result.fullText.length);
}).catch(error => {
  console.error('❌ FAILED:', error.message);
}); 