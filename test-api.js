async function testTranscriptAPI() {
  const videoUrl = 'https://www.youtube.com/watch?v=UF8uR6Z6KLc';
  
  console.log('Testing YouTube transcript API with URL:', videoUrl);
  
  try {
    const response = await fetch('http://localhost:3000/api/youtube-transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoUrl }),
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Success!');
      console.log('Video ID:', data.data.videoId);
      console.log('Title:', data.data.title);
      console.log('Segments:', data.data.segments.length);
      console.log('Full text length:', data.data.fullText.length);
      
      if (data.data.segments.length > 0) {
        console.log('First segment:', data.data.segments[0]);
      }
    } else {
      console.log('❌ Failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTranscriptAPI(); 