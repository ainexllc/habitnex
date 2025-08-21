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
import { auth } from '@/lib/firebase';
import { tracing } from '@/lib/telemetry/tracing';
import { getMetrics } from '@/lib/telemetry/metrics';
import { instrumentationHelpers } from '@/lib/telemetry/instrumentation';
import { SpanStatusCode } from '@opentelemetry/api';

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


export async function POST(req: NextRequest) {
  // Start API tracing
  return await tracing.withApi('enhance-habit', 'POST', async (span) => {
    const startTime = Date.now();
    let userId: string | null = null;
    let requestId: string | null = null;
    const metrics = getMetrics();

    // Add initial span attributes
    span.setAttributes({
      'api.endpoint': '/api/claude/enhance-habit',
      'api.method': 'POST',
      'api.version': '1.0',
      'service.name': 'nextvibe',
    });

    try {
      // Check if AI is enabled
      if (!isAIEnabled()) {
        span.setAttributes({
          'error.type': 'service_unavailable',
          'error.message': 'AI features not available',
          'ai.enabled': false,
        });
        
        if (metrics) {
          metrics.recordError('ai_service_unavailable', 'enhance-habit', {
            'api.endpoint': '/api/claude/enhance-habit',
          });
        }
        
        return NextResponse.json(
          { 
            error: 'AI features are not available. Please configure ANTHROPIC_API_KEY.',
            success: false 
          },
          { status: 503 }
        );
      }

      span.setAttributes({ 'ai.enabled': true });

      // Get user ID for tracking
      userId = await getUserId(req);
      if (!userId) {
        span.setAttributes({
          'error.type': 'authentication_required',
          'user.authenticated': false,
        });
        
        if (metrics) {
          metrics.recordError('authentication_required', 'enhance-habit', {
            'api.endpoint': '/api/claude/enhance-habit',
          });
        }
        
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Add user context to span
      span.setAttributes({
        'user.id': userId,
        'user.authenticated': true,
      });

      requestId = `enhance-habit-${userId}-${Date.now()}`;
      const { habitName, category, existingHabits } = await req.json();
      
      // Add request details to span
      span.setAttributes({
        'api.request_id': requestId,
        'habit.name': habitName,
        'habit.category': category,
        'request.has_existing_habits': !!existingHabits,
      });
      
      if (!habitName || typeof habitName !== 'string') {
        const duration = Date.now() - startTime;
        
        span.setAttributes({
          'error.type': 'invalid_input',
          'error.message': 'Habit name required',
          'api.duration_ms': duration,
        });
        
        if (metrics) {
          metrics.recordError('invalid_input', 'enhance-habit', {
            'api.endpoint': '/api/claude/enhance-habit',
            'user.id': userId,
          });
          
          metrics.recordApiRequest(
            '/api/claude/enhance-habit',
            'POST',
            400,
            duration,
            { 'user.id': userId }
          );
        }
        
        // Track failed usage
        if (userId) {
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
          );
        }
        
        return NextResponse.json(
          { error: 'Habit name is required' },
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
        'enhance-habit',
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
    
    // Clean up expired cache entries occasionally
    if (Math.random() < 0.1) {
      cleanupCache();
    }
    
      // Check cache first  
      const cached = await tracing.withSpan('cache.check', async (cacheSpan) => {
        cacheSpan.setAttributes({
          'cache.operation': 'get',
          'cache.key': habitName,
          'component.type': 'cache',
        });
        
        const result = getHabitEnhancement(habitName);
        cacheSpan.setAttributes({
          'cache.hit': !!result,
        });
        
        if (metrics) {
          metrics.recordCacheOperation(!!result, 'get');
        }
        
        return result;
      });
      
      if (cached) {
        console.log(`[API] Returning cached enhancement for: ${habitName}`);
        const duration = Date.now() - startTime;
        
        span.setAttributes({
          'cache.hit': true,
          'api.duration_ms': duration,
          'api.status_code': 200,
        });
        
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
        );
        
        if (metrics) {
          metrics.recordApiRequest(
            '/api/claude/enhance-habit',
            'POST',
            200,
            duration,
            { 'user.id': userId, 'cache.hit': true }
          );
        }

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
      
      span.setAttributes({ 'cache.hit': false });
    
      // Call Claude API
      console.log(`[API] Calling Claude for habit enhancement: ${habitName}`);
      
      const { message, responseTime } = await instrumentationHelpers.instrumentAIOperation(
        'enhance-habit',
        async () => {
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
          
          const aiResponseTime = Date.now() - aiStartTime;
          
          // Add AI-specific attributes to current span
          tracing.addAttributes({
            'ai.model': AI_CONFIG.model,
            'ai.max_tokens': AI_CONFIG.maxTokens,
            'ai.temperature': AI_CONFIG.temperature,
            'ai.tokens.input': message.usage.input_tokens,
            'ai.tokens.output': message.usage.output_tokens,
            'ai.response_time_ms': aiResponseTime,
            // 'ai.provider': 'anthropic', // Removed due to TypeScript type mismatch
          });
          
          return { message, responseTime: aiResponseTime };
        },
        {
          'ai.feature': 'enhance-habit',
          'ai.model': AI_CONFIG.model,
          'habit.name': habitName,
          'user.id': userId,
        }
      );
    
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
      
      // Cache the result with tracing
      await tracing.withSpan('cache.set', async (cacheSpan) => {
        cacheSpan.setAttributes({
          'cache.operation': 'set',
          'cache.key': habitName,
          'component.type': 'cache',
        });
        
        setHabitEnhancement(habitName, enhancement, cost);
        
        if (metrics) {
          metrics.recordCacheOperation(false, 'set'); // false = miss, we're setting
        }
      });
      
      const totalDuration = Date.now() - startTime;
      
      // Update span with final attributes
      span.setAttributes({
        'api.status_code': 200,
        'api.duration_ms': totalDuration,
        'ai.cost': cost,
        'api.success': true,
      });
      
      // Track successful usage
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
      
      // Record metrics
      if (metrics) {
        metrics.recordApiRequest(
          '/api/claude/enhance-habit',
          'POST',
          200,
          totalDuration,
          { 'user.id': userId, 'cache.hit': false }
        );
        
        metrics.recordClaudeApiUsage(
          inputTokens,
          outputTokens,
          cost,
          {
            'ai.feature': 'enhance-habit',
            'user.id': userId,
            'habit.name': habitName,
          }
        );
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
      
      // Update span with error information
      span.setAttributes({
        'error.type': 'internal_server_error',
        'error.message': errorMessage,
        'api.status_code': 500,
        'api.duration_ms': duration,
        'api.success': false,
      });
      
      // Record the exception in the span
      if (error instanceof Error) {
        tracing.recordException(error, {
          'api.endpoint': '/api/claude/enhance-habit',
          'user.id': userId || 'unknown',
        });
      }
      
      // Record error metrics
      if (metrics) {
        metrics.recordError('api_error', 'enhance-habit', {
          'api.endpoint': '/api/claude/enhance-habit',
          'user.id': userId || 'unknown',
          'error.message': errorMessage,
        });
        
        metrics.recordApiRequest(
          '/api/claude/enhance-habit',
          'POST',
          500,
          duration,
          { 'user.id': userId || 'unknown' }
        );
      }
      
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
  }); // End of tracing.withApi wrapper
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