'use client'

import { useState, useEffect } from 'react';
import { Play, ArrowLeft, Heart, Clock, Trash2, ExternalLink, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthNav from '@/components/auth/AuthNav'
import { getUser, onAuthStateChange } from '@/lib/auth'
import type { User } from '@supabase/supabase-js'

interface SavedTopic {
  id: string;
  title: string;
  timeRange: string;
  summary: string;
  podcastTitle: string;
  podcastUrl: string;
  color: string;
  iconColor: string;
  savedAt: Date;
}

export default function Collection() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [savedTopics, setSavedTopics] = useState<SavedTopic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const currentUser = await getUser()
      setUser(currentUser)
      setIsLoading(false)
      
      // Redirect to home if not authenticated
      if (!currentUser) {
        router.push('/')
        return
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user)
      if (!user) {
        router.push('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  // Load saved topics from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('savedTopics');
    if (saved) {
      setSavedTopics(JSON.parse(saved));
    } else {
      // Add some sample data for demonstration
      const sampleTopics = [
        {
          id: 'sample-1',
          title: 'AI Impact on Startup Funding',
          timeRange: '15:30-28:15',
          summary: 'Deep dive into how artificial intelligence is reshaping the venture capital landscape and startup evaluation processes.',
          podcastTitle: 'The Venture Cast',
          podcastUrl: 'https://www.youtube.com/watch?v=sample1',
          color: 'bg-blue-50',
          iconColor: 'text-blue-600',
          savedAt: new Date('2024-01-15')
        },
        {
          id: 'sample-2',
          title: 'Remote Work Culture Evolution',
          timeRange: '05:15-23:35',
          summary: 'Exploring how remote work has fundamentally changed company culture and team dynamics in the post-pandemic era.',
          podcastTitle: 'Future of Work',
          podcastUrl: 'https://www.youtube.com/watch?v=sample2',
          color: 'bg-purple-50',
          iconColor: 'text-purple-600',
          savedAt: new Date('2024-01-10')
        },
        {
          id: 'sample-3',
          title: 'Cryptocurrency Market Analysis',
          timeRange: '22:10-31:40',
          summary: 'Analysis of recent market trends, regulatory changes, and their impact on major cryptocurrencies.',
          podcastTitle: 'Crypto Weekly',
          podcastUrl: 'https://www.youtube.com/watch?v=sample3',
          color: 'bg-green-50',
          iconColor: 'text-green-600',
          savedAt: new Date('2024-01-08')
        }
      ];
      setSavedTopics(sampleTopics);
      localStorage.setItem('savedTopics', JSON.stringify(sampleTopics));
    }
  }, []);

  // Save topics to localStorage whenever savedTopics changes
  useEffect(() => {
    localStorage.setItem('savedTopics', JSON.stringify(savedTopics));
  }, [savedTopics]);

  const handlePlayTopic = (topicId: string) => {
    setIsPlaying(topicId);
    // Simulate playing for 3 seconds
    setTimeout(() => {
      setIsPlaying(null);
    }, 3000);
  };

  const handleDeleteTopic = (topicId: string) => {
    setSavedTopics(prev => prev.filter(topic => topic.id !== topicId));
  };

  const handleDeleteSelected = () => {
    setSavedTopics(prev => prev.filter(topic => !selectedTopics.includes(topic.id)));
    setSelectedTopics([]);
  };

  const handleSelectAll = () => {
    if (selectedTopics.length === savedTopics.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(savedTopics.map(topic => topic.id));
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return null // Will redirect via useEffect
  }

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600 hover:text-gray-900">Back to Home</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">PodPicker</span>
              </div>
              <AuthNav onSignInClick={() => router.push('/')} />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Collection</h1>
              <p className="text-gray-600">
                Your curated podcast segments ({savedTopics.length} saved topics)
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {savedTopics.length > 0 && (
                <>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    {selectedTopics.length === savedTopics.length ? 'Deselect All' : 'Select All'}
                  </button>
                  
                  {selectedTopics.length > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Selected</span>
                    </button>
                  )}
                </>
              )}
              
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add More</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {savedTopics.length === 0 && (
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your collection is empty</h3>
            <p className="text-gray-600 mb-6">
              Start building your personalized podcast library by saving topics from your favorite episodes.
            </p>
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Topic</span>
            </Link>
          </div>
        )}

        {/* Saved Topics Grid */}
        {savedTopics.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {savedTopics.map((topic) => (
                <div
                  key={topic.id}
                  className={`${topic.color} rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 ${
                    selectedTopics.includes(topic.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className={`w-4 h-4 ${topic.iconColor}`} />
                        <span className="text-sm font-medium text-gray-600">{topic.timeRange}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{topic.title}</h3>
                      <p className="text-gray-700 text-sm mb-3">{topic.summary}</p>
                      
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">From podcast:</p>
                        <p className="text-sm font-medium text-gray-900">{topic.podcastTitle}</p>
                        <p className="text-xs text-gray-500">Saved on {formatDate(topic.savedAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <input
                        type="checkbox"
                        checked={selectedTopics.includes(topic.id)}
                        onChange={() => handleSelectTopic(topic.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePlayTopic(topic.id)}
                        disabled={isPlaying === topic.id}
                        className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 disabled:opacity-50"
                      >
                        {isPlaying === topic.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Playing...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>Play</span>
                          </>
                        )}
                      </button>
                      
                      <a
                        href={topic.podcastUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        title="Open original podcast"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteTopic(topic.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete topic"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}