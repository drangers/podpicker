'use client';

import { useState } from 'react';
import { TranscriptResult, TranscriptSegment } from '@/lib/youtube-transcript-unified';
import { Play, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function YouTubeTranscriptTestPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [transcript, setTranscript] = useState<TranscriptResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTranscript(null);

    try {
      const response = await fetch('/api/youtube-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape transcript');
      }

      setTranscript(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            YouTube Transcript Scraper
          </h1>
          <p className="text-gray-600">
            Test the server-side Puppeteer automation for scraping YouTube video transcripts
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Video URL
              </label>
              <input
                type="url"
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scraping Transcript...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Scrape Transcript
                </>
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {transcript && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Transcript Results
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Video Title</h3>
                <p className="text-gray-600">{transcript.title}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Video ID</h3>
                <p className="text-gray-600 font-mono">{transcript.videoId}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Full Transcript ({transcript.segments.length} segments)
                </h3>
                <div className="mt-2 max-h-96 overflow-y-auto border border-gray-200 rounded-md p-4 bg-gray-50">
                  <p className="text-gray-700 whitespace-pre-wrap">{transcript.fullText}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Segments with Timestamps</h3>
                <div className="mt-2 max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                  <div className="divide-y divide-gray-200">
                    {transcript.segments.map((segment: TranscriptSegment, index: number) => (
                      <div key={index} className="p-3 hover:bg-gray-50">
                        <div className="flex items-start space-x-3">
                          <span className="text-sm text-gray-500 font-mono min-w-[60px]">
                            {Math.floor(segment.start / 60)}:{(segment.start % 60).toString().padStart(2, '0')}
                          </span>
                          <span className="text-gray-700 flex-1">{segment.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 