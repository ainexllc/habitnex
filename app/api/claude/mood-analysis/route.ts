import { NextRequest, NextResponse } from 'next/server';
import { anthropic, AI_CONFIG, calculateCost, isAIEnabled } from '@/lib/claude/client';
import { MOOD_PATTERN_ANALYSIS_PROMPT } from '@/lib/claude/prompts';
import { 
  performMoodAnalysis,
  calculateMoodTrends,
  identifyMoodPatterns
} from '@/lib/moodAnalysis';
import { getUserId } from '@/lib/claude/auth';
import { trackAPIUsage, checkUsageLimits } from '@/lib/usageTracking';
import type {
  MoodAnalysisResult,
  EnhancedMoodAnalysisResponse
} from '@/types';

// Interface for Claude AI response
interface ClaudeAnalysisResponse {
  insight: string;
  primaryFactor: 'mood' | 'energy' | 'stress' | 'sleep';
  recommendation: string;
  encouragement: string;
}

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

    requestId = `mood-analysis-${userId}-${Date.now()}`;
    const { startDate, endDate, userId: requestUserId } = await req.json();
    
    // Use provided userId or fallback to authenticated user
    const targetUserId = requestUserId || userId;
    
    // Validate required parameters
    if (!startDate || !endDate) {
      const duration = Date.now() - startTime;
      // Track failed usage
      await trackAPIUsage(
        userId,
        'mood-analysis',
        0, 0, duration,
        false,
        'Invalid input: missing date parameters',
        false,
        req.headers.get('user-agent'),
        req.headers.get('x-forwarded-for'),
        requestId
      );

      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      const duration = Date.now() - startTime;
      // Track failed usage
      await trackAPIUsage(
        userId,
        'mood-analysis',
        0, 0, duration,
        false,
        'Invalid input: incorrect date format',
        false,
        req.headers.get('user-agent'),
        req.headers.get('x-forwarded-for'),
        requestId
      );

      return NextResponse.json(
        { error: 'Dates must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (start > end) {
      const duration = Date.now() - startTime;
      await trackAPIUsage(
        userId,
        'mood-analysis',
        0, 0, duration,
        false,
        'Invalid input: start date after end date',
        false,
        req.headers.get('user-agent'),
        req.headers.get('x-forwarded-for'),
        requestId
      );

      return NextResponse.json(
        { error: 'startDate must be before endDate' },
        { status: 400 }
      );
    }

    if (daysDiff > 90) {
      const duration = Date.now() - startTime;
      await trackAPIUsage(
        userId,
        'mood-analysis',
        0, 0, duration,
        false,
        'Invalid input: date range too large',
        false,
        req.headers.get('user-agent'),
        req.headers.get('x-forwarded-for'),
        requestId
      );

      return NextResponse.json(
        { error: 'Date range cannot exceed 90 days' },
        { status: 400 }
      );
    }

    if (daysDiff < 7) {
      const duration = Date.now() - startTime;
      await trackAPIUsage(
        userId,
        'mood-analysis',
        0, 0, duration,
        false,
        'Invalid input: insufficient data range',
        false,
        req.headers.get('user-agent'),
        req.headers.get('x-forwarded-for'),
        requestId
      );

      return NextResponse.json(
        { error: 'Minimum 7 days of data required for meaningful analysis' },
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
        'mood-analysis',
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

    console.log(`[API] Starting mood analysis for user ${targetUserId}: ${startDate} to ${endDate}`);

    // Perform the statistical analysis
    let analysisResult: MoodAnalysisResult;
    try {
      analysisResult = await performMoodAnalysis(targetUserId, startDate, endDate);
    } catch (error) {
      console.error('[API] Error performing mood analysis:', error);
      const duration = Date.now() - startTime;
      
      const isNoDataError = error instanceof Error && error.message.includes('No mood data found');
      const errorCode = isNoDataError ? 'No mood data found' : 'Analysis failed';
      
      await trackAPIUsage(
        userId,
        'mood-analysis',
        0, 0, duration,
        false,
        errorCode,
        false,
        req.headers.get('user-agent'),
        req.headers.get('x-forwarded-for'),
        requestId
      );
      
      if (isNoDataError) {
        return NextResponse.json(
          { 
            error: 'No mood data found for the specified date range. Please track your mood for at least 7 days before requesting analysis.',
            success: false 
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to analyze mood data. Please try again later.',
          success: false 
        },
        { status: 500 }
      );
    }

    // Enhanced response starts with the statistical analysis
    let enhancedResponse: EnhancedMoodAnalysisResponse = {
      ...analysisResult,
      aiInsight: 'Analysis complete. Continue tracking for more personalized insights.',
      primaryFactor: 'mood',
      aiRecommendation: 'Keep maintaining consistent mood and habit tracking.',
      encouragement: 'Great job tracking your patterns! Every data point helps build better habits.'
    };

    let inputTokens = 0;
    let outputTokens = 0;
    let aiCost = 0;
    let aiUsed = false;

    // Generate AI insights if available and we have sufficient data
    if (isAIEnabled() && analysisResult.patterns.length >= 7) {
      try {
        console.log(`[API] Generating AI insights for mood analysis`);
        
        const trends = calculateMoodTrends(analysisResult.patterns);
        const patterns = identifyMoodPatterns(analysisResult.patterns);
        
        const prompt = MOOD_PATTERN_ANALYSIS_PROMPT(
          analysisResult.correlations,
          {
            highPerformanceDays: patterns.highPerformanceDays.length,
            lowPerformanceDays: patterns.lowPerformanceDays.length
          },
          {
            moodTrend: trends.moodTrend,
            habitTrend: trends.habitTrend
          },
          analysisResult.statistics.avgMoodScores,
          analysisResult.statistics.avgCompletionRate
        );

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
        
        // Extract the response text
        const responseText = message.content[0]?.type === 'text' 
          ? message.content[0].text 
          : '';

        inputTokens = message.usage.input_tokens;
        outputTokens = message.usage.output_tokens;
        aiCost = calculateCost(inputTokens, outputTokens);
        aiUsed = true;

        if (responseText) {
          try {
            // Clean up the response in case there's any extra text
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const jsonText = jsonMatch ? jsonMatch[0] : responseText;
            const aiResponse: ClaudeAnalysisResponse = JSON.parse(jsonText);
            
            // Enhance the response with AI insights
            enhancedResponse = {
              ...analysisResult,
              aiInsight: aiResponse.insight,
              primaryFactor: aiResponse.primaryFactor,
              aiRecommendation: aiResponse.recommendation,
              encouragement: aiResponse.encouragement
            };

            console.log(`[API] AI mood analysis completed:`, {
              responseTime: `${aiResponseTime}ms`,
              inputTokens,
              outputTokens,
              cost: `$${aiCost.toFixed(4)}`,
              primaryFactor: aiResponse.primaryFactor,
              userId,
              requestId
            });

          } catch (parseError) {
            console.error('Failed to parse Claude response:', responseText, parseError);
            // Continue with statistical analysis only - but still track usage
          }
        }
      } catch (aiError) {
        console.error('[API] Error generating AI insights:', aiError);
        // Continue with statistical analysis only - don't fail the entire request
        // AI failure will still be tracked as a partial success
      }
    } else if (!isAIEnabled()) {
      console.log('[API] AI not enabled, returning statistical analysis only');
    }

    const totalDuration = Date.now() - startTime;

    // Track successful usage (with AI tokens if AI was used)
    await trackAPIUsage(
      userId,
      'mood-analysis',
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

    return NextResponse.json({
      success: true,
      data: enhancedResponse,
      meta: {
        dateRange: { startDate, endDate },
        daysAnalyzed: analysisResult.statistics.totalDaysAnalyzed,
        hasAiInsights: aiUsed,
        generatedAt: new Date().toISOString(),
        cost: aiCost,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          remainingRequests: (limitCheck.remainingRequests || 0) - 1
        }
      }
    });

  } catch (error) {
    console.error('[API] Error in mood-analysis:', error);
    
    // Track failed usage
    if (userId && requestId) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      
      await trackAPIUsage(
        userId,
        'mood-analysis',
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
    api: 'Claude Mood Pattern Analysis',
    description: 'Analyzes correlations between mood dimensions and habit completion patterns',
    model: AI_CONFIG.model,
    features: [
      'Statistical correlation analysis',
      'Mood pattern identification', 
      'Performance trend analysis',
      'Personalized AI insights',
      'Actionable recommendations',
      'Optimal mood range detection',
      'Comprehensive usage tracking',
      'Cost monitoring'
    ],
    requirements: {
      minimumDays: 7,
      maximumDays: 90,
      dateFormat: 'YYYY-MM-DD'
    },
    rateLimit: {
      dailyLimit: 10, // Updated to match usage tracking system
      resetTime: new Date().setHours(24, 0, 0, 0)
    },
    parameters: {
      required: ['startDate', 'endDate'],
      optional: ['userId']
    },
    analysisTypes: {
      correlations: 'Pearson correlation coefficients between mood dimensions and habit completion',
      patterns: 'High/low performance day identification and mood patterns',
      trends: 'Time-based trend analysis for mood and habit progression',
      insights: 'AI-generated personalized insights and recommendations'
    }
  });
}