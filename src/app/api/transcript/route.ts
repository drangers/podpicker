import { NextRequest, NextResponse } from 'next/server';

// Fake transcript data for testing AI features
const FAKE_TRANSCRIPTS = {
  'business-podcast': {
    title: 'The Future of AI in Business - Tech Talk Podcast Episode 127',
    segments: [
      { text: "Welcome back to Tech Talk Podcast. I'm your host Sarah Chen and today we're diving deep into how artificial intelligence is reshaping the business landscape.", start: 0, duration: 8 },
      { text: "Joining me today is Dr. Michael Rodriguez, who's been leading AI initiatives at Fortune 500 companies for over a decade.", start: 8, duration: 6 },
      { text: "Michael, let's start with the elephant in the room. Everyone's talking about AI, but what are businesses actually doing with it right now?", start: 14, duration: 8 },
      { text: "Great question, Sarah. What I'm seeing is that most companies are still in the experimentation phase. They're running pilot projects in areas like customer service automation, predictive analytics, and content generation.", start: 22, duration: 12 },
      { text: "But here's the thing - the companies that are succeeding aren't just throwing AI at random problems. They're being very strategic about identifying specific use cases where AI can deliver measurable ROI.", start: 34, duration: 12 },
      { text: "That's fascinating. Can you give us some concrete examples of these strategic implementations?", start: 46, duration: 6 },
      { text: "Absolutely. One retail client I worked with implemented AI for inventory optimization. Instead of relying on historical sales data alone, they now factor in weather patterns, social media trends, and local events to predict demand.", start: 52, duration: 14 },
      { text: "The result? They reduced overstock by 35% and increased sales by 18% in just six months. That's the kind of impact you get when AI is applied thoughtfully.", start: 66, duration: 10 },
      { text: "Now, let's talk about the challenges. What are the biggest obstacles companies face when implementing AI solutions?", start: 76, duration: 8 },
      { text: "The number one challenge isn't technical - it's cultural. Many organizations struggle with change management. Employees worry about job displacement, and middle management often resists processes that might reduce their decision-making authority.", start: 84, duration: 16 },
      { text: "Data quality is another huge issue. AI is only as good as the data you feed it. Many companies discover their data is scattered across different systems, inconsistent, or simply not clean enough for AI applications.", start: 100, duration: 14 },
      { text: "And then there's the skills gap. Finding talent that understands both AI technology and business strategy is incredibly difficult right now.", start: 114, duration: 8 },
      { text: "Speaking of talent, what advice would you give to professionals who want to stay relevant in an AI-driven economy?", start: 122, duration: 8 },
      { text: "First, don't panic. AI is a tool, not a replacement for human judgment. Focus on developing skills that complement AI - creative problem solving, emotional intelligence, strategic thinking.", start: 130, duration: 12 },
      { text: "Second, become AI-literate. You don't need to be a data scientist, but understanding how AI works and where it can be applied in your field will make you invaluable.", start: 142, duration: 10 },
      { text: "Finally, embrace continuous learning. The AI landscape is evolving rapidly. What's cutting-edge today might be standard practice tomorrow.", start: 152, duration: 8 },
      { text: "Let's shift gears and talk about the future. Where do you see AI taking businesses in the next five years?", start: 160, duration: 8 },
      { text: "I predict we'll see AI become truly integrated into business operations rather than being a separate initiative. Decision-making processes will be augmented by AI insights in real-time.", start: 168, duration: 12 },
      { text: "We'll also see the rise of AI-first companies - businesses built from the ground up with AI at their core. These companies will have significant competitive advantages over traditional businesses trying to retrofit AI.", start: 180, duration: 14 },
      { text: "Another trend I'm excited about is democratization of AI. No-code and low-code platforms will make AI accessible to smaller businesses and non-technical users.", start: 194, duration: 10 },
      { text: "But perhaps most importantly, we'll see AI ethics and responsible AI practices become non-negotiable business requirements, not just nice-to-haves.", start: 204, duration: 10 },
      { text: "Before we wrap up, what's your number one piece of advice for business leaders who are just starting their AI journey?", start: 214, duration: 8 },
      { text: "Start small, but start now. Pick one specific problem that AI can solve, run a focused pilot project, measure the results, and learn from the experience. Don't try to boil the ocean.", start: 222, duration: 12 },
      { text: "Most importantly, treat AI as a business transformation, not just a technology implementation. Success requires changes in processes, culture, and mindset.", start: 234, duration: 10 },
      { text: "Dr. Michael Rodriguez, thank you so much for sharing your insights with us today. For our listeners, you can find more of Michael's work at aistrategyconsulting.com.", start: 244, duration: 10 },
      { text: "That's all for today's episode of Tech Talk Podcast. If you enjoyed this conversation, please subscribe and leave us a review. Until next time, keep innovating!", start: 254, duration: 10 }
    ]
  },
  'health-wellness': {
    title: 'The Science of Sleep Optimization - Wellness Weekly Podcast',
    segments: [
      { text: "Hello and welcome to Wellness Weekly. I'm Dr. Emma Thompson, and today we're exploring one of the most fundamental aspects of health that many of us take for granted - sleep.", start: 0, duration: 10 },
      { text: "Joining me is Dr. James Park, a sleep researcher and neurologist who's been studying sleep patterns and optimization for over 15 years.", start: 10, duration: 8 },
      { text: "James, let's start with the basics. Why is sleep so crucial for our overall health and wellbeing?", start: 18, duration: 6 },
      { text: "Emma, sleep isn't just rest - it's when our bodies and brains perform critical maintenance. During sleep, our brains clear out toxins, consolidate memories, and reset neural pathways.", start: 24, duration: 12 },
      { text: "Our immune system also does most of its repair work during sleep. People who consistently get less than 7 hours of sleep are three times more likely to get sick when exposed to viruses.", start: 36, duration: 10 },
      { text: "That's remarkable. What happens in our brains during different sleep stages?", start: 46, duration: 5 },
      { text: "We cycle through different stages throughout the night. Light sleep helps with basic restoration, while deep sleep is when growth hormone is released and physical repair happens.", start: 51, duration: 10 },
      { text: "REM sleep is fascinating - that's when we dream and when our brains process emotions and consolidate creative insights. Many breakthrough ideas actually come during or after REM sleep.", start: 61, duration: 12 },
      { text: "Now, many of our listeners struggle with sleep quality. What are the most common sleep disruptors you see in your practice?", start: 73, duration: 8 },
      { text: "Screen time before bed is probably the biggest culprit. Blue light suppresses melatonin production, making it harder to fall asleep naturally.", start: 81, duration: 8 },
      { text: "Irregular sleep schedules are another major issue. Our circadian rhythms thrive on consistency. Going to bed and waking up at different times each day confuses our internal clock.", start: 89, duration: 10 },
      { text: "Caffeine consumption, especially after 2 PM, can significantly impact sleep quality even if people don't realize it. Caffeine has a half-life of 6 hours.", start: 99, duration: 8 },
      { text: "And stress, of course. Racing thoughts and anxiety make it nearly impossible to transition into sleep mode.", start: 107, duration: 6 },
      { text: "Let's talk solutions. What are your top recommendations for optimizing sleep naturally?", start: 113, duration: 6 },
      { text: "First, create a consistent sleep schedule. Go to bed and wake up at the same time every day, even on weekends. This helps regulate your circadian rhythm.", start: 119, duration: 10 },
      { text: "Second, develop a wind-down routine. Start dimming lights and avoiding screens at least an hour before bed. Instead, try reading, gentle stretching, or meditation.", start: 129, duration: 10 },
      { text: "Temperature control is crucial. Your bedroom should be cool, around 65 to 68 degrees Fahrenheit. Our body temperature naturally drops as we prepare for sleep.", start: 139, duration: 10 },
      { text: "And invest in your sleep environment. A comfortable mattress, blackout curtains, and white noise can make a huge difference in sleep quality.", start: 149, duration: 8 },
      { text: "What about supplements? Many people turn to melatonin or other sleep aids.", start: 157, duration: 5 },
      { text: "Melatonin can be helpful for jet lag or shift work, but it's not a magic bullet for chronic insomnia. The key is timing and dosage - less is often more with melatonin.", start: 162, duration: 10 },
      { text: "I generally recommend trying behavioral changes first. If those don't work after 4-6 weeks, then we can discuss supplements or other interventions.", start: 172, duration: 8 },
      { text: "Magnesium is another supplement that many people find helpful. It promotes muscle relaxation and can ease anxiety that interferes with sleep.", start: 180, duration: 8 },
      { text: "Let's discuss sleep tracking. With all these wearable devices, should people be monitoring their sleep?", start: 188, duration: 6 },
      { text: "Sleep tracking can provide valuable insights, but I caution against becoming obsessed with the data. Sometimes people develop 'orthosomnia' - anxiety about their sleep scores that actually worsens their sleep.", start: 194, duration: 12 },
      { text: "Use the data to identify patterns and trends, but don't let it stress you out. How you feel during the day is often a better indicator of sleep quality than any device.", start: 206, duration: 10 },
      { text: "Finally, what would you say to someone who's tried everything but still struggles with sleep?", start: 216, duration: 6 },
      { text: "Don't give up, and consider seeing a sleep specialist. Sometimes underlying conditions like sleep apnea or restless leg syndrome need professional treatment.", start: 222, duration: 10 },
      { text: "Remember, good sleep is not a luxury - it's a necessity for optimal health. Prioritize it just like you would exercise or good nutrition.", start: 232, duration: 8 },
      { text: "Dr. James Park, thank you for sharing your expertise with us today. Listeners can find more sleep resources at sleepoptimizationcenter.org.", start: 240, duration: 8 },
      { text: "That wraps up today's episode of Wellness Weekly. Sweet dreams, everyone, and we'll see you next week for another journey into health and wellness.", start: 248, duration: 8 }
    ]
  },
  'default': {
    title: 'Sample Podcast Episode - Technology and Innovation',
    segments: [
      { text: "Welcome to today's podcast. We're discussing the latest trends in technology and how they're shaping our future.", start: 0, duration: 8 },
      { text: "Our first topic today is artificial intelligence and its impact on various industries.", start: 8, duration: 6 },
      { text: "AI has been making significant strides in healthcare, helping doctors diagnose diseases more accurately and quickly.", start: 14, duration: 8 },
      { text: "In the finance sector, AI algorithms are being used for fraud detection and algorithmic trading.", start: 22, duration: 7 },
      { text: "Moving on to our next segment, let's talk about renewable energy and sustainability.", start: 29, duration: 6 },
      { text: "Solar and wind power have become increasingly cost-effective, making them viable alternatives to fossil fuels.", start: 35, duration: 8 },
      { text: "Electric vehicles are also gaining momentum, with major automakers investing heavily in EV technology.", start: 43, duration: 7 },
      { text: "Now, let's discuss the future of remote work and how companies are adapting to distributed teams.", start: 50, duration: 8 },
      { text: "The pandemic accelerated the adoption of remote work tools and changed how we think about office culture.", start: 58, duration: 8 },
      { text: "Finally, we'll wrap up with a discussion on cybersecurity and the importance of protecting digital assets.", start: 66, duration: 8 },
      { text: "With more of our lives moving online, cybersecurity has become a critical concern for individuals and businesses alike.", start: 74, duration: 9 },
      { text: "Thank you for listening to today's episode. Don't forget to subscribe and leave us a review!", start: 83, duration: 6 }
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Determine which fake transcript to return based on videoId
    let transcriptKey = 'default';
    if (videoId.includes('business') || videoId.includes('ai') || videoId.includes('tech')) {
      transcriptKey = 'business-podcast';
    } else if (videoId.includes('health') || videoId.includes('sleep') || videoId.includes('wellness')) {
      transcriptKey = 'health-wellness';
    }

    const selectedTranscript = FAKE_TRANSCRIPTS[transcriptKey as keyof typeof FAKE_TRANSCRIPTS];

    // Format transcript data to match expected structure
    const formattedTranscript = selectedTranscript.segments.map(segment => ({
      text: segment.text,
      start: segment.start,
      duration: segment.duration
    }));

    return NextResponse.json({
      transcript: formattedTranscript,
      title: selectedTranscript.title
    });

  } catch (error: any) {
    console.error('Transcript extraction error:', error);
    
    return NextResponse.json(
      { error: 'Failed to extract transcript. Please try again.' },
      { status: 500 }
    );
  }
}