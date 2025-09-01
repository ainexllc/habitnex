import { NextRequest, NextResponse } from 'next/server';
import { anthropic, AI_CONFIG, calculateCost, isAIEnabled } from '@/lib/claude/client';
import { HABIT_ENHANCE_PROMPT } from '@/lib/claude/prompts';
import { 
  getHabitEnhancement, 
  setHabitEnhancement,
  cleanupCache 
} from '@/lib/claude/cache';
import { getUserId } from '@/lib/claude/auth';
import { type HabitEnhancement } from '@/types/claude';
import { trackAPIUsage, checkUsageLimits } from '@/lib/usageTracking';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let userId: string | null = null;
  let requestId: string | null = null;

  try {
    // Check if AI is enabled
    if (!isAIEnabled()) {
      return NextResponse.json(
        { 
          error: 'AI features are not available. Please configure ANTHROPIC_API_KEY.',
          success: false 
        },
        { status: 503 }
      );
    }

    // Get user ID for tracking
    userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    requestId = `enhance-habit-${userId}-${Date.now()}`;
    const { habitName, category, existingHabits } = await req.json();
    
    if (!habitName || typeof habitName !== 'string') {
      const duration = Date.now() - startTime;
      
      // Track failed usage
      await trackAPIUsage(
        userId,
        'enhance-habit',
        0, 0, duration,
        false,
        'Invalid input: habit name required',
        false,
        req.headers.get('user-agent'),
        req.headers.get('x-forwarded-for'),
        requestId
      ).catch(err => console.warn('Failed to track usage:', err));
      
      return NextResponse.json(
        { error: 'Habit name is required' },
        { status: 400 }
      );
    }

    // Check usage limits (but don't fail if tracking doesn't work)
    let limitCheck;
    try {
      limitCheck = await checkUsageLimits(userId);
      if (!limitCheck.canProceed) {
        const duration = Date.now() - startTime;
        // Track rate limited usage
        await trackAPIUsage(
          userId,
          'enhance-habit',
          0, 0, duration,
          false,
          'Rate limited',
          false,
          req.headers.get('user-agent'),
          req.headers.get('x-forwarded-for'),
          requestId
        ).catch(err => console.warn('Failed to track usage:', err));

        return NextResponse.json(
          { 
            error: limitCheck.reason,
            resetTime: limitCheck.resetTime,
            remainingRequests: limitCheck.remainingRequests
          },
          { status: 429 }
        );
      }
    } catch (limitError) {
      console.warn('Error checking usage limits:', limitError);
      // Continue with default limits if tracking fails
      limitCheck = {
        canProceed: true,
        remainingRequests: 10
      };
    }
    
    // Clean up expired cache entries occasionally
    if (Math.random() < 0.1) {
      cleanupCache();
    }
    
    // Check cache first  
    const cached = getHabitEnhancement(habitName);
    if (cached) {
      console.log(`[API] Returning cached enhancement for: ${habitName}`);
      const duration = Date.now() - startTime;
      
      // Track cache hit
      await trackAPIUsage(
        userId,
        'enhance-habit',
        0, 0, duration,
        true,
        undefined,
        true, // cache hit
        req.headers.get('user-agent'),
        req.headers.get('x-forwarded-for'),
        requestId
      ).catch(err => console.warn('Failed to track usage:', err));

      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
        cost: 0,
        usage: {
          remainingRequests: limitCheck.remainingRequests
        }
      });
    }
    
    // Call Claude API
    console.log(`[API] Calling Claude for habit enhancement: ${habitName}`);
    
    const prompt = HABIT_ENHANCE_PROMPT(habitName, category, existingHabits);
    const aiStartTime = Date.now();
    
    const message = await anthropic!.messages.create({
      model: AI_CONFIG.model,
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    const responseTime = Date.now() - aiStartTime;
    
    // Extract the response text
    const responseText = message.content[0]?.type === 'text' 
      ? message.content[0].text 
      : '';
    
    if (!responseText) {
      throw new Error('No response text received from Claude');
    }
    
    // Parse JSON response with better error handling
    let enhancement: HabitEnhancement;
    try {
      // Clean up the response in case there's any extra text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      let jsonText = jsonMatch ? jsonMatch[0] : responseText;
      
      // Clean up common JSON issues
      jsonText = jsonText
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/\n/g, '\\n') // Escape newlines in strings
        .replace(/\r/g, '\\r') // Escape carriage returns
        .replace(/\t/g, '\\t') // Escape tabs
        .trim();

      // Check if JSON appears to be truncated
      if (!jsonText.endsWith('}')) {
        console.error('Response appears to be truncated:', jsonText);
        throw new Error('AI response was truncated. Please try again.');
      }

      // Try to fix common JSON formatting issues
      if (jsonText.includes('",\n}')) {
        jsonText = jsonText.replace(/",\n}/g, '"}');
      }
      if (jsonText.includes(',\n  }')) {
        jsonText = jsonText.replace(/,\n  }/g, '\n}');
      }
      
      enhancement = JSON.parse(jsonText);
      
      // Validate required fields
      if (!enhancement.title || !enhancement.description || !enhancement.enhancedDescription) {
        console.error('Missing required fields in response:', enhancement);
        throw new Error('AI response missing required fields. Please try again.');
      }
      
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      console.error('Parse error:', parseError);
      
      // Try to extract a simpler response if JSON parsing fails
      try {
        // Fallback: create a basic enhancement from the response text
        const lines = responseText.split('\n').filter(line => line.trim());
        enhancement = {
          title: habitName,
          description: `Build the habit of ${habitName.toLowerCase()}`,
          enhancedDescription: lines.find(line => line.length > 50)?.substring(0, 200) || `Develop a consistent ${habitName.toLowerCase()} routine`,
          healthBenefits: 'Contributes to overall wellness and health improvement',
          mentalBenefits: 'Helps build discipline and positive mindset',
          longTermBenefits: 'Creates lasting positive changes in your lifestyle',
          difficulty: 'medium' as const,
          tip: `Start small and be consistent with your ${habitName.toLowerCase()} practice`,
          complementary: ['Stay consistent', 'Track your progress', 'Celebrate small wins']
        };
        
        console.log('Using fallback enhancement due to JSON parse error');
      } catch (fallbackError) {
        throw new Error('Invalid response format from AI. Please try again.');
      }
    }
    
    // Calculate cost
    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    const cost = calculateCost(inputTokens, outputTokens);
    
    // Cache the result
    setHabitEnhancement(habitName, enhancement, cost);
    
    const totalDuration = Date.now() - startTime;
    
    // Track successful usage (but don't fail if tracking doesn't work)
    try {
      await trackAPIUsage(
        userId,
        'enhance-habit',
        inputTokens,
        outputTokens,
        responseTime,
        true,
        undefined,
        false, // not cached
        req.headers.get('user-agent'),
        req.headers.get('x-forwarded-for'),
        requestId
      );
    } catch (trackingError) {
      console.warn('Failed to track usage (continuing anyway):', trackingError);
    }
    
    // Log the interaction
    console.log(`[API] Claude enhancement completed for "${habitName}":`, {
      responseTime: `${responseTime}ms`,
      inputTokens,
      outputTokens,
      cost: `$${cost.toFixed(4)}`,
      cached: false,
      userId,
      requestId
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
        totalTokens: inputTokens + outputTokens,
        remainingRequests: (limitCheck.remainingRequests || 0) - 1
      }
    });
  
  } catch (error) {
    console.error('[API] Error in enhance-habit:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const duration = Date.now() - startTime;
    
    // Track failed usage
    if (userId && requestId) {
      await trackAPIUsage(
        userId,
        'enhance-habit',
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
        error: errorMessage,
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