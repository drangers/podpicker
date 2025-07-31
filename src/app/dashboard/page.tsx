'use client'

import { useState } from 'react';
import { Youtube, Play, ArrowLeft, Sparkles, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [savedTopics, setSavedTopics] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      setShowTranscript(true);
      
      // Show topics after transcript
      setTimeout(() => {
        setShowTopics(true);
      }, 2000);
    }, 3000);
  };

  const fakeTranscript = `
Welcome to the AI Revolution Podcast. I'm your host, Sarah Chen, and today we're diving deep into how artificial intelligence is transforming the startup ecosystem.

Before we begin, I want to thank our sponsor, CloudScale Solutions, for making this episode possible. CloudScale helps startups scale their infrastructure without the complexity.

So let's jump right into it. Today, we have three incredible guests joining us: Marcus Rodriguez, CEO of TechFlow AI, Jennifer Liu, VP of Product at DataStream, and Alex Thompson, founder of the $50 million AI fund, FutureVentures.

Let me start with you, Marcus. TechFlow AI has grown from a team of three to over 100 employees in just 18 months. That's incredible growth. What role has AI played in your internal operations?

Marcus: Thanks for having me, Sarah. You know, it's fascinating because we're not just building AI products - we're using AI to build better. Our engineering team uses AI-powered code review tools that catch bugs before they reach production. Our customer success team uses AI to predict which customers might churn. It's AI all the way down.

Sarah: That's amazing. Jennifer, you're coming from the product perspective at DataStream. How are you seeing AI change the way products are designed and developed?

Jennifer: It's completely revolutionizing our approach. We're now able to personalize user experiences at a scale that was impossible before. Our AI algorithms analyze user behavior patterns and automatically adjust the interface. We've seen a 40% increase in user engagement since implementing these features.

Sarah: Wow, 40% is significant. Alex, from an investment perspective, what trends are you seeing in the AI startup space?

Alex: The landscape has shifted dramatically. Two years ago, we were looking for startups that had AI as a feature. Now, we're looking for startups where AI is foundational to their business model. The companies that are succeeding aren't just adding AI as a nice-to-have - they're rethinking their entire value proposition around what AI makes possible.

Sarah: That's a great point. Let's dive deeper into the funding landscape. Alex, what are the key metrics investors like yourself are looking for in AI startups?

Alex: Great question. Traditional SaaS metrics still matter, but we're also looking at AI-specific indicators. How much training data do they have? What's their model performance improvement over time? Are they building defensible data moats? And critically - can they explain their AI decisions? Explainability is becoming crucial, especially in regulated industries.

Marcus: If I can add to that - we've found that investors are also very interested in our AI infrastructure costs. Unlike traditional software, AI has this interesting cost structure where your compute costs can scale dramatically with usage. We've had to be very thoughtful about optimizing our models for cost efficiency.

Sarah: That's a crucial point, Marcus. Jennifer, how do you balance performance with cost in your product decisions?

Jennifer: It's an ongoing challenge. We've implemented a tiered AI system where simpler queries use lightweight models, and only complex requests get routed to our most powerful - and expensive - models. We've also invested heavily in model optimization. Sometimes a model that's 90% as accurate but 10x cheaper is the right choice for your product.

Sarah: Let's talk about the future. Where do you all see AI heading in the next five years? Marcus, let's start with you.

Marcus: I think we're going to see AI become invisible. Right now, companies are proud to say "we use AI." In five years, that'll be like saying "we use databases" - it'll just be assumed. The differentiation will be in how well you use AI, not whether you use it.

Jennifer: I agree with Marcus. I also think we'll see much more sophisticated human-AI collaboration. Instead of AI replacing human work, we'll see AI augmenting human capabilities in ways we can't even imagine yet. The interface between humans and AI will become much more natural and intuitive.

Alex: From an investment perspective, I think we'll see consolidation. There are thousands of AI startups right now, but the ones that will survive and thrive will be those that solve real problems with sustainable business models. The AI winter might come for some, but for others, it'll be an AI spring.

Sarah: Those are fascinating perspectives. Before we wrap up, let's do a quick lightning round. One piece of advice for entrepreneurs building AI companies. Marcus?

Marcus: Focus on the problem, not the technology. AI should be the means, not the end.

Jennifer: Invest in your data strategy early. Good data beats fancy algorithms every time.

Alex: Build for explainability from day one. You'll thank yourself later.

Sarah: Excellent advice from all of you. That's all the time we have for today's episode. Thank you to Marcus Rodriguez from TechFlow AI, Jennifer Liu from DataStream, and Alex Thompson from FutureVentures for joining us.

Don't forget to subscribe to the AI Revolution Podcast, and if you enjoyed this episode, please leave us a review. It really helps other listeners discover the show.

Next week, we'll be talking about AI ethics with Dr. Maya Patel from the Stanford AI Ethics Lab. You won't want to miss it.

Until next time, keep innovating!
  `;

  const aiTopics = [
    {
      id: 1,
      title: "Introduction & Sponsor Message",
      timeRange: "0:00-2:30",
      summary: "Host introduction and sponsor acknowledgment",
      color: "bg-gray-50",
      iconColor: "text-gray-600"
    },
    {
      id: 2,
      title: "AI in Internal Operations",
      timeRange: "2:30-8:15",
      summary: "Marcus discusses how TechFlow AI uses AI internally for code review, customer success, and operations",
      color: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      id: 3,
      title: "AI-Driven Product Development",
      timeRange: "8:15-13:45",
      summary: "Jennifer explains how AI is revolutionizing product design with personalized user experiences and 40% engagement increase",
      color: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      id: 4,
      title: "Investment Trends & Metrics",
      timeRange: "13:45-21:30",
      summary: "Alex shares insights on AI startup funding landscape, key metrics investors look for, and the shift to AI-foundational business models",
      color: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      id: 5,
      title: "AI Infrastructure & Cost Management",
      timeRange: "21:30-27:20",
      summary: "Discussion on balancing AI performance with costs, tiered AI systems, and model optimization strategies",
      color: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    {
      id: 6,
      title: "Future of AI (5-Year Outlook)",
      timeRange: "27:20-34:10",
      summary: "Predictions about AI becoming invisible, human-AI collaboration, and industry consolidation",
      color: "bg-indigo-50",
      iconColor: "text-indigo-600"
    },
    {
      id: 7,
      title: "Lightning Round: Startup Advice",
      timeRange: "34:10-36:45",
      summary: "Quick advice from each guest: focus on problems not technology, invest in data strategy, build for explainability",
      color: "bg-pink-50",
      iconColor: "text-pink-600"
    },
    {
      id: 8,
      title: "Closing & Next Episode Preview",
      timeRange: "36:45-38:00",
      summary: "Show wrap-up, guest thanks, and preview of next week's AI ethics episode",
      color: "bg-gray-50",
      iconColor: "text-gray-600"
    }
  ];

  const handleTopicSelection = (topicId: number) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSaveSelectedTopics = () => {
    const topicsToSave = aiTopics.filter(topic => selectedTopics.includes(topic.id));
    const savedTopicsData = topicsToSave.map(topic => ({
      id: `${Date.now()}-${topic.id}`,
      title: topic.title,
      timeRange: topic.timeRange,
      summary: topic.summary,
      podcastTitle: "AI Revolution Podcast",
      podcastUrl: youtubeUrl,
      color: topic.color,
      iconColor: topic.iconColor,
      savedAt: new Date()
    }));

    // Get existing saved topics from localStorage
    const existingSaved = localStorage.getItem('savedTopics');
    const existingTopics = existingSaved ? JSON.parse(existingSaved) : [];
    
    // Add new topics
    const updatedTopics = [...existingTopics, ...savedTopicsData];
    localStorage.setItem('savedTopics', JSON.stringify(updatedTopics));
    
    // Clear selection
    setSelectedTopics([]);
    
    // Show success message (you could add a toast notification here)
    alert(`${topicsToSave.length} topics saved to your collection!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600 hover:text-gray-900">Back to Home</span>
              </Link>
              <Link href="/collection" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                My Collection
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PodPicker</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* YouTube URL Input Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Extract Gold from Any Podcast
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Podcast URL
              </label>
              <div className="relative">
                <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="youtube-url"
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isProcessing || !youtubeUrl.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analyze Podcast</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Youtube className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Your Podcast</h3>
                <p className="text-gray-600 mb-4">Our AI is extracting the transcript and identifying key topics...</p>
                <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transcript Display */}
        {showTranscript && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Transcript Extracted</span>
              </h2>
              <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                {fakeTranscript.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-3 last:mb-0">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Topics */}
        {showTopics && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>AI-Generated Topics</span>
              </h2>
              
              <div className="space-y-4">
                {aiTopics.map((topic) => (
                  <div key={topic.id} className={`${topic.color} rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow ${
                    selectedTopics.includes(topic.id) ? 'ring-2 ring-blue-500' : ''
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Clock className={`w-4 h-4 ${topic.iconColor}`} />
                          <span className="text-sm font-medium text-gray-600">{topic.timeRange}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{topic.title}</h3>
                        <p className="text-gray-700 text-sm">{topic.summary}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <input
                          type="checkbox"
                          checked={selectedTopics.includes(topic.id)}
                          onChange={() => handleTopicSelection(topic.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <button 
                  onClick={handleSaveSelectedTopics}
                  disabled={selectedTopics.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Save Selected Topics to Collection ({selectedTopics.length} selected)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}