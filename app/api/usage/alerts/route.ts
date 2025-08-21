import { NextRequest, NextResponse } from 'next/server';
import { getActiveAlerts } from '@/lib/db/usageOperations';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UsageAlert } from '@/types';

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
  return userId === 'demo-user' || userId.includes('admin');
}

/**
 * GET /api/usage/alerts
 * Get usage alerts for user or system
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
    const resolved = searchParams.get('resolved');

    let alerts: UsageAlert[] = [];

    if (type === 'user') {
      // Get user-specific alerts
      alerts = await getActiveAlerts(userId);
    } else if (type === 'system' && isAdmin(userId)) {
      // Get system-wide alerts (admin only)
      alerts = await getActiveAlerts();
    } else if (type === 'system' && !isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Admin access required for system alerts' },
        { status: 403 }
      );
    }

    // Filter by resolved status if specified
    if (resolved !== null) {
      const isResolved = resolved === 'true';
      alerts = alerts.filter(alert => alert.resolved === isResolved);
    }

    // Categorize alerts
    const categorizedAlerts = {
      critical: alerts.filter(a => 
        a.type === 'budget_critical' || 
        a.type === 'system_limit'
      ),
      warning: alerts.filter(a => 
        a.type === 'budget_warning' || 
        a.type === 'user_limit'
      ),
      info: alerts.filter(a => 
        a.type === 'unusual_usage'
      )
    };

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        categorized: categorizedAlerts,
        summary: {
          total: alerts.length,
          critical: categorizedAlerts.critical.length,
          warning: categorizedAlerts.warning.length,
          info: categorizedAlerts.info.length,
          unresolved: alerts.filter(a => !a.resolved).length
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting alerts:', error);
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
 * POST /api/usage/alerts
 * Create a new alert
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const alertData = await req.json();
    const { type, message, threshold, currentValue, targetUserId } = alertData;

    // Validate required fields
    if (!type || !message || threshold === undefined || currentValue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: type, message, threshold, currentValue' },
        { status: 400 }
      );
    }

    // Validate alert type
    const validTypes = ['budget_warning', 'budget_critical', 'user_limit', 'system_limit', 'unusual_usage'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid alert type' },
        { status: 400 }
      );
    }

    // Only admins can create system-level alerts
    if ((type === 'system_limit' || type === 'budget_critical') && !isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Admin access required for system alerts' },
        { status: 403 }
      );
    }

    const newAlert: Omit<UsageAlert, 'id'> = {
      type,
      message,
      threshold,
      currentValue,
      timestamp: Timestamp.now(),
      resolved: false,
      userId: targetUserId || (type.includes('user') ? userId : undefined)
    };

    const docRef = await addDoc(collection(db, 'usage_alerts'), newAlert);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...newAlert,
        timestamp: newAlert.timestamp.toDate().toISOString()
      },
      message: 'Alert created successfully'
    });

  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      },
      { status: 500 }
    );
  }
}