import { NextRequest, NextResponse } from 'next/server';
import { runOAuthTests } from '@/lib/test-oauth';

export async function GET(request: NextRequest) {
  try {
    const success = await runOAuthTests();
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'OAuth tests passed',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'OAuth tests failed',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error) {
    console.error('OAuth test endpoint error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 