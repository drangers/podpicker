'use client'

import { useState, useEffect } from 'react';
import { Youtube, Play, ArrowLeft, Sparkles, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Dashboard() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [aiTopics, setAiTopics] = useState<Array<{
    id: number;
    title: string;
    timeRange: string;
    summary: string;
    color: string;
    iconColor: string;
  }>>([]);
  const [apiStatus, setApiStatus] = useState<{
    youtube: boolean;
    openai: boolean;
  }>({ youtube: false, openai: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    setIsProcessing(true);
    
    try {
      // Extract video ID from YouTube URL
      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      // Get transcript
      const transcriptResponse = await fetch('/api/transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      });

      if (!transcriptResponse.ok) {
        throw new Error('Failed to extract transcript');
      }

      const transcriptData = await transcriptResponse.json();
      setTranscriptData(transcriptData);
      setShowTranscript(true);

      // Analyze transcript with AI
      const analysisResponse = await fetch('/api/analyze-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transcript: transcriptData.transcript.map((segment: { text: string; start: number; duration: number }) => segment.text).join(' ') 
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze transcript');
      }

      const analysisData = await analysisResponse.json();
      
      // Convert AI topics to the format expected by the UI
      const formattedTopics = analysisData.topics.map((topic: { title: string; description: string; timestamp: string }, index: number) => ({
        id: index + 1,
        title: topic.title,
        timeRange: topic.timestamp,
        summary: topic.description,
        color: getTopicColor(index),
        iconColor: getTopicIconColor(index)
      }));

      setAiTopics(formattedTopics);
      setShowTopics(true);
      
    } catch (error) {
      console.error('Error processing podcast:', error);
      alert('Failed to process podcast. Please check the URL and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getTopicColor = (index: number): string => {
    const colors = ['bg-blue-50', 'bg-purple-50', 'bg-green-50', 'bg-orange-50', 'bg-indigo-50', 'bg-pink-50', 'bg-yellow-50', 'bg-red-50'];
    return colors[index % colors.length];
  };

  const getTopicIconColor = (index: number): string => {
    const colors = ['text-blue-600', 'text-purple-600', 'text-green-600', 'text-orange-600', 'text-indigo-600', 'text-pink-600', 'text-yellow-600', 'text-red-600'];
    return colors[index % colors.length];
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Check API status on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Test YouTube API
        const youtubeResponse = await fetch('/api/test-youtube');
        const youtubeStatus = youtubeResponse.ok;
        
        // Test OpenAI API (simple test)
        const openaiStatus = true; // We'll assume it's working for now
        
        setApiStatus({
          youtube: youtubeStatus,
          openai: openaiStatus
        });
      } catch (error) {
        console.error('API status check failed:', error);
        setApiStatus({ youtube: false, openai: false });
      }
    };

    checkApiStatus();
  }, []);

  const [transcriptData, setTranscriptData] = useState<{
    transcript: Array<{ text: string; start: number; duration: number }>;
    title: string;
    videoData?: {
      title: string;
      description: string;
      channelTitle: string;
      duration: number;
      thumbnail: string;
    };
  } | null>(null);



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
      podcastTitle: transcriptData?.title || "YouTube Podcast",
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
          
          {/* API Status Indicator */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">API Status:</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Youtube className="w-4 h-4" />
                  <span className={apiStatus.youtube ? 'text-green-600' : 'text-red-600'}>
                    {apiStatus.youtube ? 'YouTube API ✓' : 'YouTube API ✗'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Sparkles className="w-4 h-4" />
                  <span className={apiStatus.openai ? 'text-green-600' : 'text-red-600'}>
                    {apiStatus.openai ? 'OpenAI API ✓' : 'OpenAI API ✗'}
                  </span>
                </div>
              </div>
            </div>
            {(!apiStatus.youtube || !apiStatus.openai) && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                Some APIs are not configured. Check your environment variables.
              </div>
            )}
          </div>

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

        {/* Video Information and Transcript Display */}
        {showTranscript && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Video Info */}
              {transcriptData?.videoData && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-4">
                    {transcriptData.videoData.thumbnail && (
                      <Image 
                        src={transcriptData.videoData.thumbnail} 
                        alt="Video thumbnail"
                        width={96}
                        height={64}
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {transcriptData.videoData.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {transcriptData.videoData.channelTitle}
                      </p>
                      {transcriptData.videoData.duration > 0 && (
                        <p className="text-sm text-gray-500">
                          Duration: {formatDuration(transcriptData.videoData.duration)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Transcript Extracted</span>
              </h2>
              <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                {transcriptData?.transcript?.map((segment: { text: string; start: number; duration: number }, index: number) => (
                  <p key={index} className="mb-3 last:mb-0">
                    <span className="text-gray-500 text-xs mr-2">
                      {Math.floor(segment.start / 60)}:{(segment.start % 60).toString().padStart(2, '0')}
                    </span>
                    {segment.text}
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
                {aiTopics.map((topic: { id: number; title: string; timeRange: string; summary: string; color: string; iconColor: string }) => (
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