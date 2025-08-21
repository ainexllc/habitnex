import { NextRequest, NextResponse } from 'next/server';
import { getSystemUsageStats } from '@/lib/usageTracking';
import { getSystemUsageTrends, getTopUsers } from '@/lib/db/usageOperations';
import { formatCost, DEFAULT_BUDGET_CONFIG, checkBudgetThresholds } from '@/lib/costCalculation';

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

function isAdmin(userId: string): boolean {
  // In production, implement proper admin role checking
  return userId === 'demo-user' || userId.includes('admin');
}

/**
 * GET /api/usage/analytics/system
 * Get system-wide usage analytics (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId || !isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const includeTrends = searchParams.get('includeTrends') === 'true';
    const includeTopUsers = searchParams.get('includeTopUsers') === 'true';

    // Get system stats for specific date or today
    const targetDate = date || new Date().toISOString().split('T')[0];
    const systemStats = await getSystemUsageStats(targetDate);

    if (!systemStats) {
      return NextResponse.json({
        success: true,
        data: {
          systemStats: null,
          hasData: false,
          message: `No system usage data found for ${targetDate}`
        }
      });
    }

    let trends = null;
    if (includeTrends) {
      try {
        const trendsData = await getSystemUsageTrends(30); // Last 30 days
        trends = trendsData;
      } catch (error) {
        console.warn('Failed to get system trends:', error);
      }
    }

    let topUsers = null;
    if (includeTopUsers) {
      try {
        const [topByRequests, topByCost] = await Promise.all([
          getTopUsers({ metric: 'requests', timeframe: 'daily', limit: 10 }),
          getTopUsers({ metric: 'cost', timeframe: 'daily', limit: 10 })
        ]);
        topUsers = { byRequests: topByRequests, byCost: topByCost };
      } catch (error) {
        console.warn('Failed to get top users:', error);
      }
    }

    // Calculate budget status
    const budgetCheck = checkBudgetThresholds(
      systemStats.totalCost,
      DEFAULT_BUDGET_CONFIG.dailyBudget,
      DEFAULT_BUDGET_CONFIG
    );

    // Format the response
    const responseData = {
      systemStats,
      trends,
      topUsers,
      hasData: true,
      summary: {
        date: systemStats.date,
        totalUsers: systemStats.totalUsers,
        totalRequests: systemStats.totalRequests,
        totalCost: formatCost(systemStats.totalCost),
        avgCostPerRequest: formatCost(systemStats.avgCostPerRequest),
        avgTokensPerRequest: Math.round(systemStats.avgTokensPerRequest),
        successRate: Math.round(systemStats.successRate * 100) / 100,
        avgResponseTime: Math.round(systemStats.avgResponseTime),
        budgetStatus: {
          dailyBudget: formatCost(DEFAULT_BUDGET_CONFIG.dailyBudget),
          spent: formatCost(systemStats.totalCost),
          percentage: Math.round(budgetCheck.percentage * 100) / 100,
          remaining: formatCost(DEFAULT_BUDGET_CONFIG.dailyBudget - systemStats.totalCost),
          isWarning: budgetCheck.isWarning,
          isCritical: budgetCheck.isCritical,
          isEmergency: budgetCheck.isEmergency
        },
        topEndpoints: systemStats.topEndpoints.slice(0, 5).map(endpoint => ({
          ...endpoint,
          cost: formatCost(endpoint.cost),
          avgResponseTime: Math.round(endpoint.avgResponseTime)
        })),
        peakHour: systemStats.hourlyDistribution.reduce((max, current) => 
          current.requests > max.requests ? current : max
        )
      }
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting system analytics:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      },
      { status: 500 }
    );
  }
}