import { NextRequest, NextResponse } from 'next/server';
import { 
  TRANSCRIPT_SERVICES, 
  getAvailableServices, 
  getServiceConfig, 
  validateServiceConfig 
} from '@/lib/transcript-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');

    if (service) {
      // Return specific service configuration
      const config = getServiceConfig(service);
      if (!config) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }

      const validation = validateServiceConfig(service);
      
      return NextResponse.json({
        service,
        config,
        isConfigured: validation.valid,
        missingVars: validation.missingVars
      });
    }

    // Return all available services
    const availableServices = getAvailableServices();
    const services = Object.entries(TRANSCRIPT_SERVICES).map(([key, config]) => {
      const validation = validateServiceConfig(key);
      return {
        key,
        config,
        isConfigured: validation.valid,
        missingVars: validation.missingVars
      };
    });

    return NextResponse.json({
      availableServices,
      services,
      totalServices: Object.keys(TRANSCRIPT_SERVICES).length,
      configuredServices: availableServices.length
    });

  } catch (error: unknown) {
    console.error('Transcript services API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get transcript services information.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 