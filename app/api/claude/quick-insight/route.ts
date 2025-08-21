import { NextRequest, NextResponse } from 'next/server';
import { anthropic, AI_CONFIG, calculateCost, isAIEnabled } from '@/lib/claude/client';
import { QUICK_INSIGHT_PROMPT } from '@/lib/claude/prompts';
import { getCachedInsight, setCachedInsight } from '@/lib/claude/cache';
import { getUserId } from '@/lib/claude/auth';
import { trackAPIUsage, checkUsageLimits } from '@/lib/usageTracking';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let userId: string | null = null;
  let requestId: string | null = null;

  try {
    // Get user ID for tracking
    userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    requestId = `quick-insight-${userId}-${Date.now()}`;
    const { habitName, streak, completionRate } = await req.json();
    
    if (!habitName || streak === undefined || completionRate === undefined) {
      const duration = Date.now() - startTime;
      // Track failed usage
      await trackAPIUsage(
        userId,
        'quick-insight',
        0, 0, duration,
        false,
        'Invalid input: missing required fields',
        false,
        req.headers.get('user-agent'),
        req.headers.get('x-forwarded-for'),
        requestId
      );

      return NextResponse.json(
        { error: 'habitName, streak, and completionRate are required' },
        { status: 400 }
      );
    }
    
    // Check usage limits using our new system
    const limitCheck = await checkUsageLimits(userId);
    if (!limitCheck.canProceed) {
      const duration = Date.now() - startTime;
      // Track rate limited usage
      await trackAPIUsage(
        userId,
        'quick-insight',
        0, 0, duration,
        false,
        'Rate limited',
        false,
        req.headers.get('user-agent'),
        req.headers.get('x-forwarded-for'),
        requestId
      );

      return NextResponse.json(
        { 
          error: limitCheck.reason,
          resetTime: limitCheck.resetTime,
          remainingRequests: limitCheck.remainingRequests
        },
        { status: 429 }
      );
    }
    
    // Check cache first
    const cached = getCachedInsight(habitName, streak, completionRate);
    if (cached) {
      console.log(`[API] Returning cached insight for: ${habitName}`);
      const duration = Date.now() - startTime;
      
      // Track cache hit
      await trackAPIUsage(
        userId,
        'quick-insight',
        0, 0, duration,
        true,
        undefined,
        true, // cache hit
        req.headers.get('user-agent'),
        req.headers.get('x-forwarded-for'),
        requestId
      );

      return NextResponse.json({
        success: true,
        insight: cached,
        cached: true,
        cost: 0,
        usage: {
          remainingRequests: limitCheck.remainingRequests
        }
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
      const duration = Date.now() - startTime;
      setCachedInsight(habitName, streak, completionRate, quickInsight, 0);
      
      // Track template-based insight (no tokens used)
      await trackAPIUsage(
        userId,
        'quick-insight',
        0, 0, duration,
        true,
        undefined,
        false,
        req.headers.get('user-agent'),
        req.headers.get('x-forwarded-for'),
        requestId
      );

      return NextResponse.json({
        success: true,
        insight: quickInsight,
        cached: false,
        cost: 0,
        method: 'template',
        usage: {
          remainingRequests: (limitCheck.remainingRequests || 0) - 1
        }
      });
    }
    
    // Call Claude for more personalized insight (only if AI is enabled)
    if (!isAIEnabled()) {
      // Fallback to generic motivational message when AI is not available
      const duration = Date.now() - startTime;
      const fallbackInsight = `Keep going with ${habitName}! Every step counts toward building lasting habits. 💪`;
      setCachedInsight(habitName, streak, completionRate, fallbackInsight, 0);
      
      // Track fallback insight (no tokens used)
      await trackAPIUsage(
        userId,
        'quick-insight',
        0, 0, duration,
        true,
        undefined,
        false,
        req.headers.get('user-agent'),
        req.headers.get('x-forwarded-for'),
        requestId
      );

      return NextResponse.json({
        success: true,
        insight: fallbackInsight,
        cached: false,
        cost: 0,
        method: 'fallback',
        usage: {
          remainingRequests: (limitCheck.remainingRequests || 0) - 1
        }
      });
    }
    
    console.log(`[API] Generating AI insight for: ${habitName} (${streak} days, ${completionRate}%)`);
    
    const prompt = QUICK_INSIGHT_PROMPT(habitName, streak, completionRate);
    const aiStartTime = Date.now();
    
    const message = await anthropic!.messages.create({
      model: AI_CONFIG.model,
      max_tokens: 100, // Very short responses for insights
      temperature: 0.7, // Bit more creative for motivational messages
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    const aiResponseTime = Date.now() - aiStartTime;
    const totalDuration = Date.now() - startTime;
    
    const insight = message.content[0]?.type === 'text' 
      ? message.content[0].text.trim() 
      : '';
    
    if (!insight) {
      // Track failed AI call
      await trackAPIUsage(
        userId,
        'quick-insight',
        message.usage?.input_tokens || 0,
        0,
        totalDuration,
        false,
        'No insight received from Claude',
        false,
        req.headers.get('user-agent'),
        req.headers.get('x-forwarded-for'),
        requestId
      );
      throw new Error('No insight received from Claude');
    }
    
    // Calculate cost
    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    const cost = calculateCost(inputTokens, outputTokens);
    
    // Cache the result
    setCachedInsight(habitName, streak, completionRate, insight, cost);
    
    // Track successful AI usage
    await trackAPIUsage(
      userId,
      'quick-insight',
      inputTokens,
      outputTokens,
      totalDuration,
      true,
      undefined,
      false,
      req.headers.get('user-agent'),
      req.headers.get('x-forwarded-for'),
      requestId
    );
    
    console.log(`[API] AI insight generated for "${habitName}":`, {
      responseTime: `${aiResponseTime}ms`,
      cost: `$${cost.toFixed(5)}`,
      tokens: `${inputTokens}+${outputTokens}`,
      userId,
      requestId
    });
    
    return NextResponse.json({
      success: true,
      insight,
      cached: false,
      cost,
      responseTime: aiResponseTime,
      method: 'ai',
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        remainingRequests: (limitCheck.remainingRequests || 0) - 1
      }
    });
    
  } catch (error) {
    console.error('[API] Error in quick-insight:', error);
    
    // Track failed usage
    if (userId && requestId) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      
      await trackAPIUsage(
        userId,
        'quick-insight',
        0, 0, duration,
        false,
        errorMessage,
        false,
        req.headers.get('user-agent'),
        req.headers.get('x-forwarded-for'),
        requestId
      ).catch(trackingError => {
        console.error('Failed to track error usage:', trackingError);
      });
    }
    
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
      dailyLimit: 10, // Updated to match usage tracking system
      resetTime: new Date().setHours(24, 0, 0, 0)
    },
    features: [
      'Personalized habit motivation',
      'Streak celebration messages', 
      'Encouragement for struggles',
      'Achievement recognition',
      'Comprehensive usage tracking',
      'Cost monitoring'
    ]
  });
}