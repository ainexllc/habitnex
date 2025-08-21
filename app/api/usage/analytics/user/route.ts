import { NextRequest, NextResponse } from 'next/server';
import { getUserUsageStats } from '@/lib/usageTracking';
import { getUsageStatistics, getUsageEfficiencyMetrics } from '@/lib/db/usageOperations';
import { formatCost } from '@/lib/costCalculation';

async function getUserId(req: NextRequest): Promise<string | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }
    
    const userId = req.headers.get('x-user-id') || 'demo-user';
    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

/**
 * GET /api/usage/analytics/user
 * Get detailed user usage analytics
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId') || userId;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeEfficiency = searchParams.get('includeEfficiency') === 'true';

    // Only allow accessing other users' data if admin
    if (targetUserId !== userId && !userId.includes('admin')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get basic user stats
    const userStats = await getUserUsageStats(targetUserId);

    if (!userStats) {
      return NextResponse.json({
        success: true,
        data: {
          userStats: null,
          hasData: false,
          message: 'No usage data found for this user'
        }
      });
    }

    // Get detailed statistics if date range provided
    let detailedStats = null;
    if (startDate && endDate) {
      try {
        detailedStats = await getUsageStatistics({
          userId: targetUserId,
          startDate,
          endDate
        });
      } catch (error) {
        console.warn('Failed to get detailed stats:', error);
      }
    }

    // Get efficiency metrics if requested
    let efficiencyMetrics = null;
    if (includeEfficiency) {
      try {
        efficiencyMetrics = await getUsageEfficiencyMetrics(targetUserId);
      } catch (error) {
        console.warn('Failed to get efficiency metrics:', error);
      }
    }

    // Format the response
    const responseData = {
      userStats,
      detailedStats,
      efficiencyMetrics,
      hasData: true,
      summary: {
        totalRequests: userStats.totalRequests,
        totalCost: formatCost(userStats.totalCost),
        dailyUsage: {
          requests: userStats.daily.requests,
          cost: formatCost(userStats.daily.cost),
          limit: userStats.dailyLimit,
          remaining: Math.max(0, userStats.dailyLimit - userStats.daily.requests),
          percentageUsed: userStats.dailyLimit > 0 
            ? (userStats.daily.requests / userStats.dailyLimit) * 100 
            : 0
        },
        weeklyUsage: {
          requests: userStats.weekly.requests,
          cost: formatCost(userStats.weekly.cost),
          avgDailyRequests: userStats.weekly.requests / 7,
          avgDailyCost: userStats.weekly.cost / 7
        },
        monthlyUsage: {
          requests: userStats.monthly.requests,
          cost: formatCost(userStats.monthly.cost),
          avgDailyRequests: userStats.monthly.requests / 30,
          avgDailyCost: userStats.monthly.cost / 30
        },
        isLimitExceeded: userStats.isLimitExceeded,
        nextResetTime: userStats.nextResetTime.toDate().toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting user analytics:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      },
      { status: 500 }
    );
  }
}