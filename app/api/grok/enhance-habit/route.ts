import { NextRequest, NextResponse } from 'next/server';
import { enhanceHabitDescription } from '@/lib/grokAI';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/grok/enhance-habit
 * Enhance habit descriptions with motivational content using Grok AI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { habitTitle, currentDescription } = body;

    // Validation
    if (!habitTitle || typeof habitTitle !== 'string') {
      return NextResponse.json(
        { error: 'habitTitle is required and must be a string' },
        { status: 400 }
      );
    }

    // Enhance habit using Grok
    const enhanced = await enhanceHabitDescription(
      habitTitle,
      currentDescription
    );

    return NextResponse.json({
      success: true,
      ...enhanced,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Grok habit enhancement error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to enhance habit description',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
