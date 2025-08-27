'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { 
  getFamilyFeedback, 
  updateFeedbackStatus, 
  deleteFeedback,
  subscribeFamilyFeedback,
  markFeedbackAsRead
} from '@/lib/feedbackDb';
import { 
  Feedback, 
  FeedbackStatus, 
  FeedbackType,
  FEEDBACK_TYPE_CONFIG 
} from '@/types/feedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  MessageSquare, 
  Filter, 
  MoreHorizontal,
  Eye,
  Clock,
  CheckCircle2,
  Archive,
  Trash2,
  Download,
  Star,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface FeedbackDisplayProps {
  className?: string;
}

const STATUS_CONFIG = {
  submitted: { 
    label: 'New', 
    variant: 'info' as const, 
    icon: AlertCircle,
    description: 'Newly submitted feedback awaiting review'
  },
  read: { 
    label: 'Read', 
    variant: 'default' as const, 
    icon: Eye,
    description: 'Feedback has been reviewed'
  },
  in_progress: { 
    label: 'In Progress', 
    variant: 'warning' as const, 
    icon: Clock,
    description: 'Currently being addressed'
  },
  resolved: { 
    label: 'Resolved', 
    variant: 'success' as const, 
    icon: CheckCircle2,
    description: 'Issue has been resolved'
  }
  // Note: archived status exists in types for backward compatibility but not displayed
};

const ITEMS_PER_PAGE = 10;

export function FeedbackDisplay({ className }: FeedbackDisplayProps) {
  const { currentFamily, currentMember, isParent } = useFamily();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  console.log('FeedbackDisplay render - currentFamily:', !!currentFamily, 'currentMember:', !!currentMember, 'isParent:', isParent);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // Filters and pagination
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<FeedbackType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Load feedback data
  const loadFeedback = useCallback(async () => {
    if (!currentFamily || !isParent) {
      console.log('Not loading feedback - family:', !!currentFamily, 'isParent:', isParent);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Loading feedback for family:', currentFamily.id, 'isParent:', isParent);
      console.log('Current member:', currentMember);
      
      // Simple direct query without timeout first
      console.log('About to call getFamilyFeedback...');
      const data = await getFamilyFeedback(currentFamily.id, {
        limit: 5,
        sortBy: 'timestamp',
        sortOrder: 'desc'
      });
      console.log('Feedback loaded successfully:', data.length, 'items');
      setFeedback(data);
      
      // Mark unread feedback as read by this parent
      const unreadItems = data.filter(f => 
        f.status === 'submitted' && 
        (!f.readBy || !f.readBy.includes(currentMember!.id))
      );
      
      for (const item of unreadItems) {
        try {
          await markFeedbackAsRead(currentFamily.id, item.id, currentMember!.id);
        } catch (error) {
          console.error('Failed to mark feedback as read:', error);
        }
      }
      
    } catch (error) {
      console.error('Failed to load feedback:', error);
      setFeedback([]); // Set empty array on error to stop loading
    } finally {
      setLoading(false);
    }
  }, [currentFamily, isParent, currentMember]);

  // Load initial feedback data
  useEffect(() => {
    console.log('useEffect for loading feedback - currentFamily:', !!currentFamily, 'isParent:', isParent);
    loadFeedback();
  }, [loadFeedback]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!currentFamily || !isParent) return;
    
    const unsubscribe = subscribeFamilyFeedback(
      currentFamily.id, 
      (data) => {
        setFeedback(data);
      },
      {
        limit: 50,
        sortBy: 'timestamp',
        sortOrder: 'desc'
      }
    );
    
    return unsubscribe;
  }, [currentFamily, isParent]);

  // Timeout to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.log('Loading timeout reached, setting empty state');
        setLoading(false);
        setFeedback([]);
      }, 8000); // 8 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // Apply filters
  useEffect(() => {
    let filtered = [...feedback];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(f => f.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(f => f.type === typeFilter);
    }
    
    setFilteredFeedback(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [feedback, statusFilter, typeFilter]);

  // Handle status updates
  const handleStatusUpdate = async (feedbackId: string, newStatus: FeedbackStatus) => {
    if (!currentFamily || !currentMember) return;
    
    try {
      setUpdating(feedbackId);
      await updateFeedbackStatus(currentFamily.id, feedbackId, { status: newStatus }, currentMember.id);
      // Real-time subscription will update the UI
    } catch (error) {
      console.error('Failed to update feedback status:', error);
    } finally {
      setUpdating(null);
    }
  };

  // Handle delete feedback
  const handleDelete = async (feedbackId: string, subject: string) => {
    if (!currentFamily) return;
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete this feedback?\n\nSubject: "${subject}"\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      setUpdating(feedbackId);
      await deleteFeedback(currentFamily.id, feedbackId);
      // Real-time subscription will update the UI
    } catch (error) {
      console.error('Failed to delete feedback:', error);
    } finally {
      setUpdating(null);
    }
  };

  // Handle export
  const handleExport = () => {
    const csvData = filteredFeedback.map(f => ({
      Date: format(f.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss'),
      Type: f.type,
      Subject: f.subject,
      Message: f.message,
      Rating: f.rating,
      Member: f.memberName,
      Role: f.memberRole,
      Status: f.status,
      Device: f.device || '',
      URL: f.url || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family-feedback-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Toggle expanded state
  const toggleExpanded = (feedbackId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(feedbackId)) {
        next.delete(feedbackId);
      } else {
        next.add(feedbackId);
      }
      return next;
    });
  };

  // Don't show component for non-parents
  if (!isParent || !currentFamily || !currentMember) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6", className)}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mr-3"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading feedback...</span>
        </div>
      </div>
    );
  }

  // Show empty state
  if (feedback.length === 0) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6", className)}>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Family Feedback</h2>
        </div>
        
        <div className="text-center py-8">
          <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No feedback yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            When family members submit feedback, it will appear here for you to review and manage.
          </p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(filteredFeedback.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFeedback = filteredFeedback.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const unreadCount = feedback.filter(f => 
    f.status === 'submitted' && (!f.readBy || !f.readBy.includes(currentMember.id))
  ).length;

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Family Feedback</h2>
          {unreadCount > 0 && (
            <Badge variant="error" size="sm">
              {unreadCount} new
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          
          {filteredFeedback.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FeedbackStatus | 'all')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <option key={status} value={status}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as FeedbackType | 'all')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {Object.entries(FEEDBACK_TYPE_CONFIG).map(([type, config]) => (
                  <option key={type} value={type}>
                    {config.icon} {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {(statusFilter !== 'all' || typeFilter !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredFeedback.length} of {feedback.length} items
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Feedback List */}
      {filteredFeedback.length === 0 ? (
        <div className="text-center py-8">
          <Filter className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No matching feedback</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters to see more feedback items.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedFeedback.map((item) => {
            // Handle archived status (legacy) by treating it as resolved for display
            const displayStatus = item.status === 'archived' ? 'resolved' : item.status;
            const statusConfig = STATUS_CONFIG[displayStatus];
            const typeConfig = FEEDBACK_TYPE_CONFIG[item.type];
            const isExpanded = expandedItems.has(item.id);
            const StatusIcon = statusConfig.icon;
            
            return (
              <Card key={item.id} className="border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <span className="text-2xl" role="img" aria-label={item.type}>
                            {typeConfig.icon}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg text-gray-900 dark:text-white truncate">
                              {item.subject}
                            </CardTitle>
                            <Badge variant={statusConfig.variant} size="sm">
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {item.memberName} ({item.memberRole})
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(item.timestamp.toDate(), 'MMM dd, yyyy - h:mm a')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              {item.rating}/5
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(item.id)}
                        className="flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            More
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {isExpanded ? item.message : item.message.length > 150 
                        ? `${item.message.substring(0, 150)}...` 
                        : item.message
                      }
                    </p>
                  </div>
                  
                  {isExpanded && (
                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {/* Response Notes */}
                      {item.responseNotes && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Response Notes
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {item.responseNotes}
                          </p>
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Update status:
                          </span>
                          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                            // Skip current status and archived status (archived items can only be deleted)
                            if (status === displayStatus || (item.status === 'archived')) return null;
                            const ActionIcon = config.icon;
                            
                            return (
                              <Button
                                key={status}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(item.id, status as FeedbackStatus)}
                                disabled={updating === item.id}
                                className="flex items-center gap-1"
                                title={config.description}
                              >
                                <ActionIcon className="w-4 h-4" />
                                {config.label}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id, item.subject)}
                          disabled={updating === item.id}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredFeedback.length)} of {filteredFeedback.length} items
          </span>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}