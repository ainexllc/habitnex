import { NextRequest, NextResponse } from 'next/server';
import { anthropic, AI_CONFIG, calculateCost, isAIEnabled } from '@/lib/claude/client';
import { QUICK_INSIGHT_PROMPT } from '@/lib/claude/prompts';
import { getCachedInsight, setCachedInsight } from '@/lib/claude/cache';

function getUserId(req: NextRequest): string {
  return req.headers.get('x-forwarded-for') || req.ip || 'demo-user';
}

// Simple rate limiting for insights (more generous since they're cheaper)
const insightRequests = new Map<string, { count: number; resetTime: number }>();

function checkInsightRateLimit(userId: string, limit: number = 25): boolean {
  const now = Date.now();
  const dayStart = new Date().setHours(0, 0, 0, 0);
  
  const userLimit = insightRequests.get(userId);
  
  if (!userLimit || userLimit.resetTime < dayStart) {
    insightRequests.set(userId, { count: 1, resetTime: now });
    return true;
  }
  
  if (userLimit.count >= limit) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const { habitName, streak, completionRate } = await req.json();
    
    if (!habitName || streak === undefined || completionRate === undefined) {
      return NextResponse.json(
        { error: 'habitName, streak, and completionRate are required' },
        { status: 400 }
      );
    }
    
    // Check rate limit
    const userId = getUserId(req);
    if (!checkInsightRateLimit(userId, 25)) {
      return NextResponse.json(
        { 
          error: 'Daily insight limit reached (25/day). Resets at midnight.',
          resetTime: new Date().setHours(24, 0, 0, 0)
        },
        { status: 429 }
      );
    }
    
    // Check cache first
    const cached = getCachedInsight(habitName, streak, completionRate);
    if (cached) {
      console.log(`[API] Returning cached insight for: ${habitName}`);
      return NextResponse.json({
        success: true,
        insight: cached,
        cached: true,
        cost: 0
      });
    }
    
    // Generate personalized motivational messages for common scenarios
    const generateQuickInsight = (name: string, streak: number, rate: number): string | null => {
      if (streak === 0) {
        return `Every journey starts with a single step - let's make today day 1 of your ${name} habit! 🌟`;
      }
      
      if (streak === 1) {
        return `Great start with ${name}! Day 1 is done - momentum is building. Keep it going! 🚀`;
      }
      
      if (streak >= 7 && streak < 14) {
        return `One week of ${name} completed! You're forming a real habit now. The hardest part is behind you. 💪`;
      }
      
      if (streak >= 21) {
        return `${streak} days of ${name}! This is becoming part of who you are. Your consistency is inspiring! ✨`;
      }
      
      if (rate >= 80) {
        return `${rate}% completion with ${name} is excellent! You're mastering this habit. What's your secret? 🎯`;
      }
      
      if (rate < 50) {
        return `${name} can be challenging - what if you tried a smaller version tomorrow? Progress over perfection! 🌱`;
      }
      
      return null; // Use AI for more complex scenarios
    };
    
    // Try quick template-based insight first
    const quickInsight = generateQuickInsight(habitName, streak, completionRate);
    if (quickInsight) {
      setCachedInsight(habitName, streak, completionRate, quickInsight, 0);
      return NextResponse.json({
        success: true,
        insight: quickInsight,
        cached: false,
        cost: 0,
        method: 'template'
      });
    }
    
    // Call Claude for more personalized insight (only if AI is enabled)
    if (!isAIEnabled()) {
      // Fallback to generic motivational message when AI is not available
      const fallbackInsight = `Keep going with ${habitName}! Every step counts toward building lasting habits. 💪`;
      setCachedInsight(habitName, streak, completionRate, fallbackInsight, 0);
      return NextResponse.json({
        success: true,
        insight: fallbackInsight,
        cached: false,
        cost: 0,
        method: 'fallback'
      });
    }
    
    console.log(`[API] Generating AI insight for: ${habitName} (${streak} days, ${completionRate}%)`);
    
    const prompt = QUICK_INSIGHT_PROMPT(habitName, streak, completionRate);
    const startTime = Date.now();
    
    const message = await anthropic!.messages.create({
      model: AI_CONFIG.model,
      max_tokens: 100, // Very short responses for insights
      temperature: 0.7, // Bit more creative for motivational messages
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    const responseTime = Date.now() - startTime;
    
    const insight = message.content[0]?.type === 'text' 
      ? message.content[0].text.trim() 
      : '';
    
    if (!insight) {
      throw new Error('No insight received from Claude');
    }
    
    // Calculate cost
    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    const cost = calculateCost(inputTokens, outputTokens);
    
    // Cache the result
    setCachedInsight(habitName, streak, completionRate, insight, cost);
    
    console.log(`[API] AI insight generated for "${habitName}":`, {
      responseTime: `${responseTime}ms`,
      cost: `$${cost.toFixed(5)}`,
      tokens: `${inputTokens}+${outputTokens}`
    });
    
    return NextResponse.json({
      success: true,
      insight,
      cached: false,
      cost,
      responseTime,
      method: 'ai',
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens
      }
    });
    
  } catch (error) {
    console.error('[API] Error in quick-insight:', error);
    
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
  return NextResponse.json({
    api: 'Claude Quick Insights',
    model: AI_CONFIG.model,
    rateLimit: {
      dailyLimit: 25,
      resetTime: new Date().setHours(24, 0, 0, 0)
    },
    features: [
      'Personalized habit motivation',
      'Streak celebration messages', 
      'Encouragement for struggles',
      'Achievement recognition'
    ]
  });
}