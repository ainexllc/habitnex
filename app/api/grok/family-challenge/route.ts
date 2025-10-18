import { NextRequest, NextResponse } from 'next/server';
import { generateFamilyChallenge } from '@/lib/grokAI';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/grok/family-challenge
 * Generate family challenge ideas using Grok AI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { familyHabits, familySize } = body;

    // Validation
    if (!Array.isArray(familyHabits)) {
      return NextResponse.json(
        { error: 'familyHabits must be an array' },
        { status: 400 }
      );
    }

    if (typeof familySize !== 'number' || familySize < 1) {
      return NextResponse.json(
        { error: 'familySize must be a number greater than 0' },
        { status: 400 }
      );
    }

    // Generate challenge using Grok
    const challenge = await generateFamilyChallenge(
      familyHabits,
      familySize
    );

    return NextResponse.json({
      success: true,
      ...challenge,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Grok family challenge error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate family challenge',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
