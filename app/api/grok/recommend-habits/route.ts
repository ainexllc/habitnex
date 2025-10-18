import { NextRequest, NextResponse } from 'next/server';
import { generateHabitRecommendations } from '@/lib/grokAI';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/grok/recommend-habits
 * Generate personalized habit recommendations using Grok AI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { existingHabits, userGoals } = body;

    // Validation
    if (!Array.isArray(existingHabits)) {
      return NextResponse.json(
        { error: 'existingHabits must be an array' },
        { status: 400 }
      );
    }

    // Generate recommendations using Grok
    const recommendations = await generateHabitRecommendations(
      existingHabits,
      userGoals
    );

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Grok habit recommendations error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate habit recommendations',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
