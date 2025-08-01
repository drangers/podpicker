'use client';

import { useState } from 'react';

interface TranscriptService {
  key: string;
  config: {
    name: string;
    description: string;
    features: string[];
  };
  isConfigured: boolean;
  missingVars: string[];
}

interface TranscriptResult {
  transcript: Array<{
    text: string;
    start: number;
    duration: number;
  }>;
  title: string;
  videoData: any;
  videoId: string;
  transcriptCount: number;
  service: string;
}

export default function TranscriptServiceTester() {
  const [videoId, setVideoId] = useState('');
  const [selectedService, setSelectedService] = useState('rapidapi');
  const [services, setServices] = useState<TranscriptService[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranscriptResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadServices = async () => {
    try {
      const response = await fetch('/api/transcript-services');
      const data = await response.json();
      setServices(data.services);
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  };

  const testTranscript = async () => {
    if (!videoId.trim()) {
      setError('Please enter a video ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/transcript-external', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: videoId.trim(),
          service: selectedService,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transcript');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!videoId.trim()) {
      setError('Please enter a video ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/check-transcript-availability-external', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: videoId.trim(),
          service: selectedService,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check availability');
      }

      alert(`Transcript available: ${data.available ? 'Yes' : 'No'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Transcript Service Tester</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube Video ID
            </label>
            <input
              type="text"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="e.g., dQw4w9WgXcQ"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {services.map((service) => (
                <option key={service.key} value={service.key}>
                  {service.config.name} {!service.isConfigured && '(Not Configured)'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={loadServices}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Load Services
            </button>
            <button
              onClick={checkAvailability}
              disabled={loading}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
            >
              Check Availability
            </button>
            <button
              onClick={testTranscript}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Get Transcript'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Transcript Result</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p><strong>Title:</strong> {result.title}</p>
              <p><strong>Video ID:</strong> {result.videoId}</p>
              <p><strong>Service:</strong> {result.service}</p>
              <p><strong>Transcript Segments:</strong> {result.transcriptCount}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
              <h4 className="font-semibold mb-2">Transcript Preview:</h4>
              {result.transcript.slice(0, 10).map((segment, index) => (
                <div key={index} className="mb-2 p-2 bg-white rounded">
                  <span className="text-sm text-gray-500">
                    {Math.floor(segment.start / 60)}:{(segment.start % 60).toFixed(1)}
                  </span>
                  <span className="ml-2">{segment.text}</span>
                </div>
              ))}
              {result.transcript.length > 10 && (
                <p className="text-gray-500 text-sm">
                  ... and {result.transcript.length - 10} more segments
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Available Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.key}
              className={`p-4 border rounded-md ${
                service.isConfigured
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <h4 className="font-semibold">{service.config.name}</h4>
              <p className="text-sm text-gray-600 mb-2">
                {service.config.description}
              </p>
              <div className="text-xs">
                <p className={service.isConfigured ? 'text-green-700' : 'text-red-700'}>
                  Status: {service.isConfigured ? 'Configured' : 'Not Configured'}
                </p>
                {service.missingVars.length > 0 && (
                  <p className="text-red-700">
                    Missing: {service.missingVars.join(', ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 