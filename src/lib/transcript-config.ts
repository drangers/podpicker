export interface TranscriptServiceConfig {
  name: string;
  description: string;
  envVars: string[];
  apiUrl?: string;
  pricing?: string;
  features: string[];
}

export const TRANSCRIPT_SERVICES: Record<string, TranscriptServiceConfig> = {
  rapidapi: {
    name: 'RapidAPI YouTube Transcript API',
    description: 'Fast and reliable YouTube transcript extraction via RapidAPI',
    envVars: ['RAPIDAPI_KEY'],
    apiUrl: 'https://rapidapi.com/ytdl/api/youtube-transcript-api',
    pricing: 'Free tier available, paid plans for higher usage',
    features: [
      'Fast transcript extraction',
      'Multiple language support',
      'Automatic subtitle detection',
      'JSON response format'
    ]
  },
  assemblyai: {
    name: 'AssemblyAI',
    description: 'High-quality speech-to-text transcription with AI-powered accuracy',
    envVars: ['ASSEMBLYAI_API_KEY'],
    apiUrl: 'https://www.assemblyai.com/',
    pricing: 'Pay-per-minute transcription',
    features: [
      'AI-powered transcription',
      'High accuracy',
      'Speaker diarization',
      'Custom vocabulary support',
      'Multiple language support'
    ]
  },
  custom: {
    name: 'Custom API',
    description: 'Use your own transcript extraction service',
    envVars: ['CUSTOM_TRANSCRIPT_API_URL', 'CUSTOM_TRANSCRIPT_API_KEY'],
    pricing: 'Depends on your service',
    features: [
      'Full control over the service',
      'Custom response format',
      'Flexible integration'
    ]
  }
};

export function getAvailableServices(): string[] {
  const available: string[] = [];
  
  for (const [key, config] of Object.entries(TRANSCRIPT_SERVICES)) {
    const hasRequiredEnvVars = config.envVars.every(envVar => 
      process.env[envVar] !== undefined
    );
    
    if (hasRequiredEnvVars) {
      available.push(key);
    }
  }
  
  return available;
}

export function getServiceConfig(service: string): TranscriptServiceConfig | null {
  return TRANSCRIPT_SERVICES[service] || null;
}

export function validateServiceConfig(service: string): { valid: boolean; missingVars: string[] } {
  const config = getServiceConfig(service);
  if (!config) {
    return { valid: false, missingVars: [] };
  }
  
  const missingVars = config.envVars.filter(envVar => 
    process.env[envVar] === undefined
  );
  
  return {
    valid: missingVars.length === 0,
    missingVars
  };
}

export function getDefaultService(): string {
  const available = getAvailableServices();
  return available.length > 0 ? available[0] : 'rapidapi';
} 