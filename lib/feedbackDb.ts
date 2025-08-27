import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  Timestamp,
  onSnapshot,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Feedback, 
  CreateFeedbackRequest, 
  UpdateFeedbackRequest,
  FeedbackListOptions,
  FeedbackAnalytics,
  FeedbackType,
  FeedbackStatus
} from '@/types/feedback';

// Create a new feedback submission
export async function submitFeedback(
  familyId: string,
  memberId: string,
  memberName: string,
  memberRole: 'parent' | 'child' | 'teen' | 'adult',
  feedbackData: CreateFeedbackRequest
): Promise<string> {
  try {
    console.log('Submitting feedback:', { familyId, memberId, memberName, memberRole, feedbackData });
    const feedbacksRef = collection(db, 'families', familyId, 'feedback');
    
    // Get current URL and device info
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
    const device = getDeviceType(userAgent);
    
    const newFeedback: Omit<Feedback, 'id'> = {
      familyId,
      type: feedbackData.type,
      subject: feedbackData.subject.trim(),
      message: feedbackData.message.trim(),
      rating: feedbackData.rating,
      
      // Submission details
      submittedBy: memberId,
      memberName,
      memberRole,
      timestamp: serverTimestamp() as Timestamp,
      
      // Initial status
      status: 'submitted',
      
      // Technical details
      device: feedbackData.device || device,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      url: feedbackData.url || url
    };
    
    const docRef = await addDoc(feedbacksRef, newFeedback);
    console.log('Feedback submitted successfully:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw new Error('Failed to submit feedback. Please try again.');
  }
}

// Get all feedback for a family with optional filtering
export async function getFamilyFeedback(
  familyId: string,
  options: FeedbackListOptions = {}
): Promise<Feedback[]> {
  try {
    console.log('getFamilyFeedback called with familyId:', familyId, 'options:', options);
    const feedbacksRef = collection(db, 'families', familyId, 'feedback');
    
    // Build query with filters
    let q = query(feedbacksRef);
    
    // Filter by types
    if (options.types && options.types.length > 0) {
      q = query(q, where('type', 'in', options.types));
    }
    
    // Filter by statuses
    if (options.statuses && options.statuses.length > 0) {
      q = query(q, where('status', 'in', options.statuses));
    }
    
    // Filter by member IDs
    if (options.memberIds && options.memberIds.length > 0) {
      q = query(q, where('submittedBy', 'in', options.memberIds));
    }
    
    // Add sorting
    const sortField = options.sortBy || 'timestamp';
    const sortDirection = options.sortOrder || 'desc';
    q = query(q, orderBy(sortField, sortDirection));
    
    // Add limit
    if (options.limit) {
      q = query(q, firestoreLimit(options.limit));
    }
    
    console.log('Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    console.log('Query completed, found', querySnapshot.size, 'documents');
    
    const feedback: Feedback[] = [];
    
    querySnapshot.forEach((doc) => {
      feedback.push({
        id: doc.id,
        ...doc.data()
      } as Feedback);
    });
    
    console.log('Returning', feedback.length, 'feedback items');
    return feedback;
  } catch (error) {
    console.error('Error getting family feedback:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    // If it's a permissions error or collection doesn't exist, return empty array
    if (error.code === 'permission-denied' || error.code === 'not-found') {
      console.log('No feedback collection or no permission, returning empty array');
      return [];
    }
    throw error; // Re-throw to see the full error
  }
}

// Get specific feedback item
export async function getFeedback(
  familyId: string,
  feedbackId: string
): Promise<Feedback | null> {
  try {
    const feedbackRef = doc(db, 'families', familyId, 'feedback', feedbackId);
    const docSnap = await getDoc(feedbackRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Feedback;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting feedback:', error);
    throw new Error('Failed to load feedback');
  }
}

// Update feedback status and notes (parent actions)
export async function updateFeedbackStatus(
  familyId: string,
  feedbackId: string,
  updates: UpdateFeedbackRequest,
  updatedBy: string
): Promise<void> {
  try {
    const feedbackRef = doc(db, 'families', familyId, 'feedback', feedbackId);
    
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    // If marking as read for the first time, set readAt timestamp
    if (updates.status && ['read', 'in_progress', 'resolved'].includes(updates.status)) {
      const currentFeedback = await getFeedback(familyId, feedbackId);
      if (currentFeedback && currentFeedback.status === 'submitted') {
        updateData.readAt = serverTimestamp();
        updateData.readBy = [updatedBy];
      } else if (currentFeedback?.readBy && !currentFeedback.readBy.includes(updatedBy)) {
        updateData.readBy = [...currentFeedback.readBy, updatedBy];
      }
    }
    
    await updateDoc(feedbackRef, updateData);
    console.log('Feedback updated successfully:', feedbackId);
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw new Error('Failed to update feedback');
  }
}

// Mark feedback as read by a specific member
export async function markFeedbackAsRead(
  familyId: string,
  feedbackId: string,
  memberId: string
): Promise<void> {
  try {
    const feedback = await getFeedback(familyId, feedbackId);
    if (!feedback) throw new Error('Feedback not found');
    
    const readBy = feedback.readBy || [];
    if (!readBy.includes(memberId)) {
      const updates: UpdateFeedbackRequest = {
        status: feedback.status === 'submitted' ? 'read' : feedback.status
      };
      
      await updateFeedbackStatus(familyId, feedbackId, updates, memberId);
    }
  } catch (error) {
    console.error('Error marking feedback as read:', error);
    throw new Error('Failed to mark feedback as read');
  }
}

// Subscribe to feedback changes for real-time updates
export function subscribeFamilyFeedback(
  familyId: string,
  callback: (feedback: Feedback[]) => void,
  options: FeedbackListOptions = {}
): () => void {
  const feedbacksRef = collection(db, 'families', familyId, 'feedback');
  
  // Build query (similar to getFamilyFeedback)
  let q = query(feedbacksRef);
  
  if (options.types && options.types.length > 0) {
    q = query(q, where('type', 'in', options.types));
  }
  
  if (options.statuses && options.statuses.length > 0) {
    q = query(q, where('status', 'in', options.statuses));
  }
  
  if (options.memberIds && options.memberIds.length > 0) {
    q = query(q, where('submittedBy', 'in', options.memberIds));
  }
  
  const sortField = options.sortBy || 'timestamp';
  const sortDirection = options.sortOrder || 'desc';
  q = query(q, orderBy(sortField, sortDirection));
  
  if (options.limit) {
    q = query(q, firestoreLimit(options.limit));
  }
  
  return onSnapshot(q, (querySnapshot) => {
    const feedback: Feedback[] = [];
    querySnapshot.forEach((doc) => {
      feedback.push({
        id: doc.id,
        ...doc.data()
      } as Feedback);
    });
    
    callback(feedback);
  }, (error) => {
    console.error('Error in feedback subscription:', error);
  });
}

// Delete feedback (admin/parent only)
export async function deleteFeedback(
  familyId: string,
  feedbackId: string
): Promise<void> {
  try {
    const feedbackRef = doc(db, 'families', familyId, 'feedback', feedbackId);
    await deleteDoc(feedbackRef);
    
    console.log('Feedback deleted successfully:', feedbackId);
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw new Error('Failed to delete feedback');
  }
}

// Get feedback analytics for the family
export async function getFeedbackAnalytics(
  familyId: string,
  period: 'week' | 'month' | 'year' | 'all' = 'month'
): Promise<FeedbackAnalytics> {
  try {
    let startDate: Date | null = null;
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }
    
    const feedbacksRef = collection(db, 'families', familyId, 'feedback');
    let q = query(feedbacksRef);
    
    if (startDate) {
      q = query(q, where('timestamp', '>=', Timestamp.fromDate(startDate)));
    }
    
    const querySnapshot = await getDocs(q);
    const allFeedback: Feedback[] = [];
    
    querySnapshot.forEach((doc) => {
      allFeedback.push({
        id: doc.id,
        ...doc.data()
      } as Feedback);
    });
    
    // Calculate analytics
    const totalFeedback = allFeedback.length;
    const byType: Record<FeedbackType, number> = {
      'Bug Report': 0,
      'Feature Request': 0,
      'Suggestion': 0,
      'Compliment': 0,
      'Other': 0
    };
    const byStatus: Record<FeedbackStatus, number> = {
      'submitted': 0,
      'read': 0,
      'in_progress': 0,
      'resolved': 0
    };
    
    let totalRating = 0;
    const memberFeedbackCount: Record<string, { name: string; count: number }> = {};
    
    allFeedback.forEach(feedback => {
      byType[feedback.type]++;
      byStatus[feedback.status]++;
      totalRating += feedback.rating;
      
      if (!memberFeedbackCount[feedback.submittedBy]) {
        memberFeedbackCount[feedback.submittedBy] = {
          name: feedback.memberName,
          count: 0
        };
      }
      memberFeedbackCount[feedback.submittedBy].count++;
    });
    
    const averageRating = totalFeedback > 0 ? totalRating / totalFeedback : 0;
    
    // Find most active member
    let mostActiveMember = {
      memberId: '',
      memberName: 'None',
      feedbackCount: 0
    };
    
    Object.entries(memberFeedbackCount).forEach(([memberId, data]) => {
      if (data.count > mostActiveMember.feedbackCount) {
        mostActiveMember = {
          memberId,
          memberName: data.name,
          feedbackCount: data.count
        };
      }
    });
    
    // Calculate trends (this month vs last month)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const thisMonthFeedback = allFeedback.filter(f => 
      f.timestamp && f.timestamp.toDate() >= thisMonth
    ).length;
    
    const lastMonthFeedback = allFeedback.filter(f => 
      f.timestamp && f.timestamp.toDate() >= lastMonth && f.timestamp.toDate() <= lastMonthEnd
    ).length;
    
    const percentageChange = lastMonthFeedback > 0 
      ? ((thisMonthFeedback - lastMonthFeedback) / lastMonthFeedback) * 100
      : thisMonthFeedback > 0 ? 100 : 0;
    
    return {
      familyId,
      period,
      totalFeedback,
      byType,
      byStatus,
      averageRating,
      mostActiveMember,
      recentTrends: {
        thisMonth: thisMonthFeedback,
        lastMonth: lastMonthFeedback,
        percentageChange
      }
    };
  } catch (error) {
    console.error('Error getting feedback analytics:', error);
    throw new Error('Failed to load feedback analytics');
  }
}

// Batch update multiple feedback items (useful for bulk actions)
export async function batchUpdateFeedback(
  familyId: string,
  updates: Array<{ feedbackId: string; updates: UpdateFeedbackRequest }>,
  updatedBy: string
): Promise<void> {
  try {
    const batch = writeBatch(db);
    
    updates.forEach(({ feedbackId, updates: feedbackUpdates }) => {
      const feedbackRef = doc(db, 'families', familyId, 'feedback', feedbackId);
      batch.update(feedbackRef, {
        ...feedbackUpdates,
        updatedAt: serverTimestamp(),
        updatedBy
      });
    });
    
    await batch.commit();
    console.log(`Successfully updated ${updates.length} feedback items`);
  } catch (error) {
    console.error('Error batch updating feedback:', error);
    throw new Error('Failed to update feedback items');
  }
}

// Utility function to detect device type
function getDeviceType(userAgent: string): string {
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
}

// Utility function to get unread feedback count for parents
export async function getUnreadFeedbackCount(
  familyId: string,
  parentMemberId?: string
): Promise<number> {
  try {
    const feedbacksRef = collection(db, 'families', familyId, 'feedback');
    const q = query(
      feedbacksRef,
      where('status', '==', 'submitted'),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!parentMemberId) {
      return querySnapshot.size;
    }
    
    // Count feedback not read by this specific parent
    let unreadCount = 0;
    querySnapshot.forEach((doc) => {
      const feedback = doc.data() as Feedback;
      if (!feedback.readBy || !feedback.readBy.includes(parentMemberId)) {
        unreadCount++;
      }
    });
    
    return unreadCount;
  } catch (error) {
    console.error('Error getting unread feedback count:', error);
    return 0;
  }
}