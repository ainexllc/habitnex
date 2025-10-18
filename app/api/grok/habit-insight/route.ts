import { NextRequest, NextResponse } from 'next/server';
import { generateHabitInsight } from '@/lib/grokAI';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/grok/habit-insight
 * Generate habit insights using Grok AI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { habitName, completionHistory, context } = body;

    // Validation
    if (!habitName || typeof habitName !== 'string') {
      return NextResponse.json(
        { error: 'habitName is required and must be a string' },
        { status: 400 }
      );
    }

    if (!Array.isArray(completionHistory)) {
      return NextResponse.json(
        { error: 'completionHistory must be an array' },
        { status: 400 }
      );
    }

    // Generate insight using Grok
    const insight = await generateHabitInsight(
      habitName,
      completionHistory,
      context
    );

    return NextResponse.json({
      success: true,
      insight,
      habitName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Grok habit insight error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate habit insight',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
