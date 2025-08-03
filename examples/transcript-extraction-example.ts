#!/usr/bin/env tsx

import { scrapeYouTubeTranscriptReverseEngineered } from '../src/lib/youtube-transcript-reverse-engineered';

async function example() {
  const videoUrls = [
    'https://www.youtube.com/watch?v=UF8uR6Z6KLc', // Steve Jobs Stanford Commencement
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up
  ];

  console.log('🎬 YouTube Transcript Extraction Examples');
  console.log('========================================\n');

  for (const videoUrl of videoUrls) {
    try {
      console.log(`📹 Processing: ${videoUrl}`);
      
      const startTime = Date.now();
      const transcript = await scrapeYouTubeTranscriptReverseEngineered(videoUrl);
      const endTime = Date.now();

      console.log(`✅ Success! (${endTime - startTime}ms)`);
      console.log(`📺 Title: ${transcript.title}`);
      console.log(`🆔 Video ID: ${transcript.videoId}`);
      console.log(`📝 Segments: ${transcript.segments.length}`);
      console.log(`📄 Characters: ${transcript.fullText.length}`);
      console.log(`📋 Preview: ${transcript.fullText.substring(0, 200)}...`);
      console.log('---\n');

    } catch (error) {
      console.error(`❌ Error processing ${videoUrl}:`, error instanceof Error ? error.message : 'Unknown error');
      console.log('---\n');
    }
  }
}

// Run the example
example().catch(console.error); 