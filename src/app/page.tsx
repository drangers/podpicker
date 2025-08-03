'use client'

import { useState, useEffect } from 'react'
import { Play, ArrowRight, Scissors, Heart, Clock, Youtube, Sparkles, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import AuthModal from '@/components/auth/AuthModal'
import AuthNav from '@/components/auth/AuthNav'
import { getUser, onAuthStateChange } from '@/lib/auth'
import type { User } from '@supabase/supabase-js'

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check initial auth state
    const checkUser = async () => {
      const currentUser = await getUser()
      setUser(currentUser)
      setIsLoading(false)
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignInClick = () => {
    setShowAuthModal(true)
  }

  const handleAuthModalClose = () => {
    setShowAuthModal(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PodPicker</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Home</a>
              <Link href="/collection" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">My Collection</Link>
              <Link href="/test-external-transcript" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Test Transcript API</Link>
              <Link href="/youtube-transcript-test" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">YouTube Transcript Test</Link>
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Pricing</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              {!isLoading && (
                user ? (
                  <Link 
                    href="/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <button
                    onClick={handleSignInClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Get Started
                  </button>
                )
              )}
              <AuthNav onSignInClick={handleSignInClick} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Cherry-Pick the Gold from<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Favorite Podcasts
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Paste any podcast link. Get a complete topic breakdown. Pick only the parts you want to hear. That&apos;s it.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link 
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center"
            >
              Start Picking
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all inline-flex items-center">
              See How It Works
              <Play className="ml-2 w-5 h-5" />
            </button>
          </div>
          
          {/* Hero Visual */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-gray-200 shadow-2xl">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Youtube className="w-6 h-6 text-red-500" />
                  <span className="text-gray-600">youtube.com/watch?v=podcast-episode</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-700">0:00-15:30 • Introduction & Market Overview</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Heart className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-gray-700">15:30-28:45 • AI Impact on Startups</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">28:45-42:10 • Investment Strategies</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Waste Time on Filler Content?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Extract maximum value from every podcast with AI-powered segmentation and curation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Scissors className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Segmentation</h3>
              <p className="text-gray-600">
                AI breaks down long podcasts into digestible topics with timestamps, so you know exactly what each segment covers.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Curation</h3>
              <p className="text-gray-600">
                Save only the segments that interest you most. Build a personalized library of podcast gold.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Easy Playback</h3>
              <p className="text-gray-600">
                Jump directly to your saved moments across all podcasts. No more scrubbing through hours of content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              From Podcast Overload to Curated Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Turn any YouTube podcast into a searchable, organized library in minutes.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Paste YouTube podcast link</h3>
                    <p className="text-gray-600">Simply copy and paste any YouTube podcast URL. We support all major podcast channels.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">2</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">AI analyzes and segments content</h3>
                    <p className="text-gray-600">Our AI processes the audio and creates topic-based segments with precise timestamps.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">3</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select topics you want to save</h3>
                    <p className="text-gray-600">Browse the topic breakdown and cherry-pick only the segments that interest you.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-semibold">4</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Build your personalized collection</h3>
                    <p className="text-gray-600">Access your curated segments anytime, organized by topic, podcast, or custom tags.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <Youtube className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-500">Processing...</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="bg-white rounded-lg p-3 shadow-sm flex items-center justify-between">
                      <span className="text-sm text-gray-700">Market Analysis</span>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm flex items-center justify-between">
                      <span className="text-sm text-gray-700">AI Discussion</span>
                      <button className="text-purple-600 hover:text-purple-700">
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm flex items-center justify-between">
                      <span className="text-sm text-gray-700">Q&A Session</span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to take control of your podcast listening?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of podcast listeners who save hours every week with PodPicker.
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none"
                />
              </div>
              <Link 
                href="/dashboard"
                className="bg-white hover:bg-gray-100 text-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
              >
                Get Started Free
              </Link>
            </div>
            <p className="text-blue-200 text-sm mt-3">No credit card required • Start curating in minutes</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">PodPicker</span>
              </div>
              <p className="text-gray-400">
                Extract the gold from your favorite podcasts with AI-powered curation.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How it works</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 PodPicker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {showAuthModal && <AuthModal isOpen={showAuthModal} onClose={handleAuthModalClose} />}
    </div>
  );
}