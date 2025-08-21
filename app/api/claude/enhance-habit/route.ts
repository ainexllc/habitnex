import { NextRequest, NextResponse } from 'next/server';
import { anthropic, AI_CONFIG, calculateCost } from '@/lib/claude/client';
import { HABIT_ENHANCE_PROMPT } from '@/lib/claude/prompts';
import { 
  getHabitEnhancement, 
  setHabitEnhancement,
  cleanupCache 
} from '@/lib/claude/cache';
import { type HabitEnhancement } from '@/types/claude';

// Rate limiting - simplified for demo (in production, use proper rate limiting)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, limit: number = 10): boolean {
  const now = Date.now();
  const dayStart = new Date().setHours(0, 0, 0, 0);
  
  const userLimit = requestCounts.get(userId);
  
  if (!userLimit || userLimit.resetTime < dayStart) {
    requestCounts.set(userId, { count: 1, resetTime: now });
    return true;
  }
  
  if (userLimit.count >= limit) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

function getUserId(req: NextRequest): string {
  // In production, get from auth token
  // For demo, use IP or session
  return req.headers.get('x-forwarded-for') || req.ip || 'demo-user';
}

export async function POST(req: NextRequest) {
  try {
    const { habitName, category, existingHabits } = await req.json();
    
    if (!habitName || typeof habitName !== 'string') {
      return NextResponse.json(
        { error: 'Habit name is required' },
        { status: 400 }
      );
    }
    
    // Check rate limit
    const userId = getUserId(req);
    if (!checkRateLimit(userId, 10)) {
      return NextResponse.json(
        { 
          error: 'Daily AI enhancement limit reached (10/day). Resets at midnight.',
          resetTime: new Date().setHours(24, 0, 0, 0)
        },
        { status: 429 }
      );
    }
    
    // Clean up expired cache entries occasionally
    if (Math.random() < 0.1) {
      cleanupCache();
    }
    
    // Check cache first
    const cached = getHabitEnhancement(habitName);
    if (cached) {
      console.log(`[API] Returning cached enhancement for: ${habitName}`);
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
        cost: 0
      });
    }
    
    // Call Claude API
    console.log(`[API] Calling Claude for habit enhancement: ${habitName}`);
    
    const prompt = HABIT_ENHANCE_PROMPT(habitName, category, existingHabits);
    const startTime = Date.now();
    
    const message = await anthropic.messages.create({
      model: AI_CONFIG.model,
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    const responseTime = Date.now() - startTime;
    
    // Extract the response text
    const responseText = message.content[0]?.type === 'text' 
      ? message.content[0].text 
      : '';
    
    if (!responseText) {
      throw new Error('No response text received from Claude');
    }
    
    // Parse JSON response
    let enhancement: HabitEnhancement;
    try {
      // Clean up the response in case there's any extra text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : responseText;
      enhancement = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      throw new Error('Invalid response format from AI');
    }
    
    // Calculate cost
    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    const cost = calculateCost(inputTokens, outputTokens);
    
    // Cache the result
    setHabitEnhancement(habitName, enhancement, cost);
    
    // Log the interaction
    console.log(`[API] Claude enhancement completed for "${habitName}":`, {
      responseTime: `${responseTime}ms`,
      inputTokens,
      outputTokens,
      cost: `$${cost.toFixed(4)}`,
      cached: false
    });
    
    return NextResponse.json({
      success: true,
      data: enhancement,
      cached: false,
      cost,
      responseTime,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens
      }
    });
    
  } catch (error) {
    console.error('[API] Error in enhance-habit:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return API info and cache statistics
  const { getCacheStats, getCacheSize } = await import('@/lib/claude/cache');
  
  const stats = getCacheStats();
  const cacheSize = getCacheSize();
  
  return NextResponse.json({
    api: 'Claude Habit Enhancement',
    model: AI_CONFIG.model,
    maxTokens: AI_CONFIG.maxTokens,
    temperature: AI_CONFIG.temperature,
    cache: {
      size: cacheSize,
      stats
    },
    rateLimit: {
      dailyLimit: 10,
      resetTime: new Date().setHours(24, 0, 0, 0)
    }
  });
}