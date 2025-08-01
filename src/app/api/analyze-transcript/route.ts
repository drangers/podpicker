import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface Topic {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  duration: string;
  keyPoints: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const prompt = `
Analyze the following podcast transcript and break it down into 3-4 main topics. For each topic, provide:
1. A clear, engaging title
2. A brief description (1-2 sentences)
3. Estimated timestamp (format: "00:00")
4. Estimated duration (format: "15 min")
5. 2-3 key points discussed in that topic

Format your response as a JSON array with this structure:
[
  {
    "title": "Topic Title",
    "description": "Brief description of what this topic covers",
    "timestamp": "00:00",
    "duration": "15 min",
    "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
  }
]

Transcript:
${transcript}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a podcast content analyzer. Extract main topics from transcripts and format them as JSON. Be precise and engaging in your topic titles and descriptions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response from OpenAI
    let topics;
    try {
      topics = JSON.parse(responseText);
    } catch {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        topics = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse OpenAI response as JSON');
      }
    }

    // Add unique IDs to each topic
    const topicsWithIds = topics.map((topic: Omit<Topic, 'id'>, index: number) => ({
      ...topic,
      id: `topic-${index + 1}`,
    }));

    return NextResponse.json({ topics: topicsWithIds });
    
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    return NextResponse.json(
      { error: 'Failed to analyze transcript' },
      { status: 500 }
    );
  }
}