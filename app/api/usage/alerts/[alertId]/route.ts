import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
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
 * PATCH /api/usage/alerts/[alertId]
 * Update an alert (e.g., mark as resolved)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { alertId: string } }
) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { alertId } = params;
    const updates = await req.json();

    // Get the alert to check permissions
    const alertRef = doc(db, 'usage_alerts', alertId);
    const alertDoc = await getDoc(alertRef);

    if (!alertDoc.exists()) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    const alert = alertDoc.data() as UsageAlert;

    // Check if user can modify this alert
    const canModify = isAdmin(userId) || 
                     alert.userId === userId || 
                     !alert.userId; // System alerts can be modified by any authenticated user

    if (!canModify) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update the alert
    await updateDoc(alertRef, updates);

    // Get the updated alert
    const updatedDoc = await getDoc(alertRef);
    const updatedAlert = { id: alertId, ...updatedDoc.data() } as UsageAlert;

    return NextResponse.json({
      success: true,
      data: {
        ...updatedAlert,
        timestamp: updatedAlert.timestamp.toDate?.()?.toISOString() || updatedAlert.timestamp
      },
      message: 'Alert updated successfully'
    });

  } catch (error) {
    console.error('Error updating alert:', error);
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
 * GET /api/usage/alerts/[alertId]
 * Get a specific alert
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { alertId: string } }
) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { alertId } = params;

    const alertRef = doc(db, 'usage_alerts', alertId);
    const alertDoc = await getDoc(alertRef);

    if (!alertDoc.exists()) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    const alert = { id: alertId, ...alertDoc.data() } as UsageAlert;

    // Check if user can view this alert
    const canView = isAdmin(userId) || 
                   alert.userId === userId || 
                   !alert.userId;

    if (!canView) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...alert,
        timestamp: alert.timestamp.toDate?.()?.toISOString() || alert.timestamp
      }
    });

  } catch (error) {
    console.error('Error getting alert:', error);
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
 * DELETE /api/usage/alerts/[alertId]
 * Delete an alert (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { alertId: string } }
) {
  try {
    const userId = await getUserId(req);
    if (!userId || !isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { alertId } = params;

    const alertRef = doc(db, 'usage_alerts', alertId);
    const alertDoc = await getDoc(alertRef);

    if (!alertDoc.exists()) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    // In Firestore, we don't actually delete, we mark as resolved and add a deletion flag
    await updateDoc(alertRef, {
      resolved: true,
      deleted: true,
      deletedAt: new Date(),
      deletedBy: userId
    });

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      },
      { status: 500 }
    );
  }
}