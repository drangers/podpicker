import { NextRequest, NextResponse } from 'next/server';

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

interface Topic {
  id: string;
  title: string;
  summary: string;
  timeRange: {
    start: number;
    end: number;
  };
  segments: TranscriptSegment[];
  keyPoints: string[];
  relevanceScore: number;
}

// Mock AI analysis functions
function generateTopics(segments: TranscriptSegment[]): Topic[] {
  // For business/AI podcast
  if (segments.some(s => s.text.toLowerCase().includes('artificial intelligence') || s.text.toLowerCase().includes('business'))) {
    return [
      {
        id: 'intro-market-overview',
        title: 'Introduction & Market Overview',
        summary: 'Welcome segment and overview of the current AI business landscape, setting the stage for the discussion.',
        timeRange: { start: 0, end: 22 },
        segments: segments.slice(0, 3),
        keyPoints: [
          'Introduction to the show and guest',
          'Current state of AI in business',
          'Setting context for the conversation'
        ],
        relevanceScore: 7
      },
      {
        id: 'ai-implementation-strategies',
        title: 'AI Implementation Strategies',
        summary: 'Deep dive into how companies are strategically implementing AI solutions with real-world examples and ROI metrics.',
        timeRange: { start: 22, end: 76 },
        segments: segments.slice(3, 8),
        keyPoints: [
          'Strategic vs random AI implementation',
          'Retail inventory optimization case study',
          '35% overstock reduction, 18% sales increase',
          'Importance of measurable ROI'
        ],
        relevanceScore: 9
      },
      {
        id: 'implementation-challenges',
        title: 'Implementation Challenges',
        summary: 'Discussion of the biggest obstacles companies face when adopting AI, including cultural resistance and data quality issues.',
        timeRange: { start: 76, end: 122 },
        segments: segments.slice(8, 12),
        keyPoints: [
          'Cultural change management as #1 challenge',
          'Employee concerns about job displacement',
          'Data quality and consistency issues',
          'Skills gap in AI talent'
        ],
        relevanceScore: 8
      },
      {
        id: 'career-advice',
        title: 'Career Advice for AI Era',
        summary: 'Practical advice for professionals to stay relevant and thrive in an AI-driven economy.',
        timeRange: { start: 122, end: 160 },
        segments: segments.slice(12, 16),
        keyPoints: [
          'Focus on AI-complementary skills',
          'Develop emotional intelligence',
          'Become AI-literate without being technical',
          'Embrace continuous learning'
        ],
        relevanceScore: 8
      },
      {
        id: 'future-predictions',
        title: 'Future of AI in Business',
        summary: 'Predictions about how AI will evolve in business over the next five years, including AI-first companies and democratization.',
        timeRange: { start: 160, end: 214 },
        segments: segments.slice(16, 21),
        keyPoints: [
          'AI integration into core operations',
          'Rise of AI-first companies',
          'Democratization through no-code platforms',
          'AI ethics as business requirement'
        ],
        relevanceScore: 9
      },
      {
        id: 'actionable-advice',
        title: 'Actionable Business Advice',
        summary: 'Concrete recommendations for business leaders starting their AI journey, emphasizing starting small and treating AI as transformation.',
        timeRange: { start: 214, end: 244 },
        segments: segments.slice(21, 24),
        keyPoints: [
          'Start small but start now',
          'Focus on specific problems',
          'Measure results and learn',
          'Treat as business transformation, not just tech'
        ],
        relevanceScore: 10
      }
    ];
  }

  // For health/wellness podcast
  if (segments.some(s => s.text.toLowerCase().includes('sleep') || s.text.toLowerCase().includes('health'))) {
    return [
      {
        id: 'sleep-fundamentals',
        title: 'Sleep Science Fundamentals',
        summary: 'Introduction to sleep science and why sleep is crucial for health, including brain maintenance and immune function.',
        timeRange: { start: 0, end: 46 },
        segments: segments.slice(0, 6),
        keyPoints: [
          'Sleep as brain and body maintenance',
          'Toxin clearance and memory consolidation',
          'Immune system repair during sleep',
          '3x higher illness risk with <7 hours sleep'
        ],
        relevanceScore: 9
      },
      {
        id: 'sleep-stages',
        title: 'Understanding Sleep Stages',
        summary: 'Detailed explanation of different sleep stages and their specific functions, from light sleep to REM.',
        timeRange: { start: 46, end: 73 },
        segments: segments.slice(6, 8),
        keyPoints: [
          'Light sleep for basic restoration',
          'Deep sleep for growth hormone release',
          'REM sleep for emotional processing',
          'Creative insights during REM'
        ],
        relevanceScore: 8
      },
      {
        id: 'sleep-disruptors',
        title: 'Common Sleep Disruptors',
        summary: 'Identification of the most common factors that negatively impact sleep quality and how they work.',
        timeRange: { start: 73, end: 113 },
        segments: segments.slice(8, 13),
        keyPoints: [
          'Blue light suppressing melatonin',
          'Irregular sleep schedules confusing circadian rhythms',
          'Caffeine half-life of 6 hours',
          'Stress and anxiety preventing sleep mode'
        ],
        relevanceScore: 10
      },
      {
        id: 'sleep-optimization',
        title: 'Natural Sleep Optimization',
        summary: 'Evidence-based strategies for improving sleep quality naturally through schedule, environment, and habits.',
        timeRange: { start: 113, end: 157 },
        segments: segments.slice(13, 17),
        keyPoints: [
          'Consistent sleep schedule importance',
          'Wind-down routine with dim lights',
          'Cool bedroom temperature (65-68°F)',
          'Quality sleep environment setup'
        ],
        relevanceScore: 10
      },
      {
        id: 'supplements-sleep-aids',
        title: 'Sleep Supplements & Aids',
        summary: 'Discussion of when and how to use sleep supplements like melatonin and magnesium effectively.',
        timeRange: { start: 157, end: 188 },
        segments: segments.slice(17, 21),
        keyPoints: [
          'Melatonin timing and dosage importance',
          'Behavioral changes before supplements',
          'Magnesium for muscle relaxation',
          'Less is more with melatonin'
        ],
        relevanceScore: 7
      },
      {
        id: 'sleep-tracking',
        title: 'Sleep Tracking Technology',
        summary: 'Balanced perspective on sleep tracking devices and how to use data without becoming obsessed.',
        timeRange: { start: 188, end: 216 },
        segments: segments.slice(21, 24),
        keyPoints: [
          'Valuable insights from tracking',
          'Avoiding orthosomnia (sleep score anxiety)',
          'Focus on patterns, not perfection',
          'Daytime feeling as quality indicator'
        ],
        relevanceScore: 6
      }
    ];
  }

  // Default topics for general technology podcast
  return [
    {
      id: 'ai-industry-impact',
      title: 'AI Impact on Industries',
      summary: 'Overview of how artificial intelligence is transforming healthcare and finance sectors.',
      timeRange: { start: 8, end: 29 },
      segments: segments.slice(1, 4),
      keyPoints: [
        'AI in healthcare diagnostics',
        'Fraud detection in finance',
        'Algorithmic trading applications'
      ],
      relevanceScore: 8
    },
    {
      id: 'renewable-energy',
      title: 'Renewable Energy & Sustainability',
      summary: 'Discussion of solar, wind power, and electric vehicle adoption in the sustainability movement.',
      timeRange: { start: 29, end: 50 },
      segments: segments.slice(4, 7),
      keyPoints: [
        'Cost-effective renewable energy',
        'EV market momentum',
        'Major automaker investments'
      ],
      relevanceScore: 7
    },
    {
      id: 'remote-work-future',
      title: 'Future of Remote Work',
      summary: 'How companies are adapting to distributed teams and the lasting impact of pandemic-driven changes.',
      timeRange: { start: 50, end: 66 },
      segments: segments.slice(7, 9),
      keyPoints: [
        'Distributed team adaptation',
        'Remote work tool adoption',
        'Office culture transformation'
      ],
      relevanceScore: 6
    },
    {
      id: 'cybersecurity-importance',
      title: 'Cybersecurity in Digital Age',
      summary: 'The critical importance of protecting digital assets as our lives become increasingly connected.',
      timeRange: { start: 66, end: 83 },
      segments: segments.slice(9, 11),
      keyPoints: [
        'Growing digital asset exposure',
        'Individual and business concerns',
        'Online security best practices'
      ],
      relevanceScore: 8
    }
  ];
}

function generateOverallSummary(segments: TranscriptSegment[]): string {
  if (segments.some(s => s.text.toLowerCase().includes('artificial intelligence') || s.text.toLowerCase().includes('business'))) {
    return "This episode provides a comprehensive look at AI implementation in business, featuring expert insights on strategic adoption, common challenges, and future trends. Dr. Michael Rodriguez shares real-world case studies and practical advice for business leaders navigating the AI transformation, emphasizing the importance of strategic thinking over random implementation.";
  }
  
  if (segments.some(s => s.text.toLowerCase().includes('sleep') || s.text.toLowerCase().includes('health'))) {
    return "Dr. James Park shares the latest research on sleep optimization, covering everything from the science of sleep stages to practical strategies for better rest. This episode offers evidence-based advice on improving sleep quality naturally, addressing common disruptors, and using technology wisely to track and enhance your sleep.";
  }
  
  return "This technology-focused episode covers the latest trends shaping our digital future, from AI's impact on healthcare and finance to the growth of renewable energy and the evolution of remote work culture.";
}

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript || !Array.isArray(transcript)) {
      return NextResponse.json(
        { error: 'Valid transcript array is required' },
        { status: 400 }
      );
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate topics and analysis
    const topics = generateTopics(transcript);
    const overallSummary = generateOverallSummary(transcript);

    // Calculate total duration
    const totalDuration = transcript[transcript.length - 1]?.start + transcript[transcript.length - 1]?.duration || 0;

    return NextResponse.json({
      topics,
      overallSummary,
      totalDuration,
      totalSegments: transcript.length
    });

  } catch (error: unknown) {
    console.error('AI analysis error:', error);
    
    return NextResponse.json(
      { error: 'Failed to analyze transcript. Please try again.' },
      { status: 500 }
    );
  }
}