import TranscriptServiceTester from '@/components/TranscriptServiceTester';

export default function TestExternalTranscriptPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            External Transcript Service Tester
          </h1>
          <p className="text-gray-600">
            Test and compare different third-party transcript services for YouTube videos
          </p>
        </div>
        
        <TranscriptServiceTester />
        
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">How to Use</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-medium">1. Configure Services</h3>
              <p>Add the required environment variables to your <code className="bg-gray-100 px-1 rounded">.env.local</code> file:</p>
              <ul className="list-disc list-inside mt-2 ml-4">
                <li><code>RAPIDAPI_KEY</code> - For RapidAPI YouTube Transcript API</li>
                <li><code>ASSEMBLYAI_API_KEY</code> - For AssemblyAI transcription</li>
                <li><code>CUSTOM_TRANSCRIPT_API_URL</code> - For custom API endpoint</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium">2. Load Services</h3>
              <p>Click "Load Services" to see which services are properly configured.</p>
            </div>
            
            <div>
              <h3 className="font-medium">3. Test Transcript Extraction</h3>
              <p>Enter a YouTube video ID and select a service to test transcript extraction.</p>
            </div>
            
            <div>
              <h3 className="font-medium">4. Check Availability</h3>
              <p>Use "Check Availability" to see if a video has transcripts available before extracting.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">API Endpoints</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium">Get Transcript</h3>
              <code className="block bg-gray-100 p-2 rounded mt-1">
                POST /api/transcript-external
              </code>
            </div>
            
            <div>
              <h3 className="font-medium">Check Availability</h3>
              <code className="block bg-gray-100 p-2 rounded mt-1">
                POST /api/check-transcript-availability-external
              </code>
            </div>
            
            <div>
              <h3 className="font-medium">Get Services</h3>
              <code className="block bg-gray-100 p-2 rounded mt-1">
                GET /api/transcript-services
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 