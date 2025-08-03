#!/usr/bin/env tsx

import { scrapeYouTubeTranscriptReverseEngineered } from '../src/lib/youtube-transcript-reverse-engineered';

async function main() {
  const videoUrl = process.argv[2];
  
  if (!videoUrl) {
    console.log('Usage: npm run test-reverse-engineered <youtube-url>');
    console.log('Example: npm run test-reverse-engineered "https://www.youtube.com/watch?v=dQw4w9WgXcQ"');
    process.exit(1);
  }

  console.log('🎬 YouTube Transcript Reverse-Engineered Test');
  console.log('============================================');
  console.log(`Video URL: ${videoUrl}`);
  console.log('Starting reverse-engineered extraction...\n');

  try {
    const startTime = Date.now();
    const transcript = await scrapeYouTubeTranscriptReverseEngineered(videoUrl);
    const endTime = Date.now();

    console.log('✅ Reverse-engineered transcript extraction completed!');
    console.log(`⏱️  Time taken: ${endTime - startTime}ms`);
    console.log(`📺 Video Title: ${transcript.title}`);
    console.log(`🆔 Video ID: ${transcript.videoId}`);
    console.log(`📝 Segments: ${transcript.segments.length}`);
    console.log(`📄 Total characters: ${transcript.fullText.length}`);
    
    console.log('\n📋 Full Transcript:');
    console.log('='.repeat(50));
    console.log(transcript.fullText);
    console.log('='.repeat(50));
    
    console.log('\n⏰ Segments with timestamps:');
    transcript.segments.slice(0, 10).forEach((segment, index) => {
      const minutes = Math.floor(segment.start / 60);
      const seconds = (segment.start % 60).toString().padStart(2, '0');
      console.log(`[${minutes}:${seconds}] ${segment.text}`);
    });
    
    if (transcript.segments.length > 10) {
      console.log(`... and ${transcript.segments.length - 10} more segments`);
    }

  } catch (error) {
    console.error('❌ Error during reverse-engineered extraction:', error);
    process.exit(1);
  }
}

main().catch(console.error); 