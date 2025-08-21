import { NextRequest, NextResponse } from 'next/server';
import { getUserUsageStats, getSystemUsageStats } from '@/lib/usageTracking';
import { getActiveAlerts } from '@/lib/db/usageOperations';
import { DEFAULT_BUDGET_CONFIG, checkBudgetThresholds } from '@/lib/costCalculation';

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
 * GET /api/usage/analytics
 * Get comprehensive usage analytics
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
    const type = searchParams.get('type') || 'user';
    const date = searchParams.get('date');

    if (type === 'system' && !isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    let responseData: any = {};

    if (type === 'user') {
      // Get user-specific analytics
      const userStats = await getUserUsageStats(userId);
      const userAlerts = await getActiveAlerts(userId);

      responseData = {
        userStats,
        alerts: userAlerts,
        budgetStatus: null
      };

      // Add budget status if user has stats
      if (userStats) {
        const today = new Date().toISOString().split('T')[0];
        const isToday = userStats.daily.date === today;
        
        const dailyBudget = DEFAULT_BUDGET_CONFIG.dailyBudget;
        const dailyCost = isToday ? userStats.daily.cost : 0;
        
        const budgetCheck = checkBudgetThresholds(dailyCost, dailyBudget, DEFAULT_BUDGET_CONFIG);
        
        responseData.budgetStatus = {
          current: DEFAULT_BUDGET_CONFIG,
          usage: {
            daily: {
              spent: dailyCost,
              percentage: budgetCheck.percentage
            },
            weekly: {
              spent: userStats.weekly.cost,
              percentage: (userStats.weekly.cost / DEFAULT_BUDGET_CONFIG.weeklyBudget) * 100
            },
            monthly: {
              spent: userStats.monthly.cost,
              percentage: (userStats.monthly.cost / DEFAULT_BUDGET_CONFIG.monthlyBudget) * 100
            }
          }
        };
      }

    } else if (type === 'system') {
      // Get system-wide analytics (admin only)
      const systemStats = await getSystemUsageStats(date);
      const systemAlerts = await getActiveAlerts();

      responseData = {
        systemStats,
        alerts: systemAlerts
      };
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting usage analytics:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/usage/analytics
 * Trigger analytics calculations or updates (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId || !isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { action, parameters } = await req.json();

    switch (action) {
      case 'refresh_system_stats':
        // Trigger system stats refresh
        // In a real implementation, this might trigger a background job
        return NextResponse.json({
          success: true,
          message: 'System stats refresh triggered'
        });

      case 'recalculate_user_summaries':
        // Trigger user summary recalculation
        return NextResponse.json({
          success: true,
          message: 'User summary recalculation triggered'
        });

      case 'cleanup_old_records':
        const days = parameters?.days || 30;
        // Trigger cleanup of old usage records
        return NextResponse.json({
          success: true,
          message: `Cleanup triggered for records older than ${days} days`
        });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error processing analytics action:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      },
      { status: 500 }
    );
  }
}