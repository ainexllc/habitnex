import { NextRequest, NextResponse } from 'next/server';
import { searchUsageRecords } from '@/lib/db/usageOperations';
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

function isAdmin(userId: string): boolean {
  return userId === 'demo-user' || userId.includes('admin');
}

/**
 * GET /api/usage/search
 * Search usage records with flexible criteria
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
    
    // Extract search parameters
    const searchTerm = searchParams.get('search');
    const targetUserId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const endpoint = searchParams.get('endpoint');
    const success = searchParams.get('success');
    const cacheHit = searchParams.get('cacheHit');
    const minCost = searchParams.get('minCost');
    const maxCost = searchParams.get('maxCost');
    const minDuration = searchParams.get('minDuration');
    const maxDuration = searchParams.get('maxDuration');
    const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);
    const lastDocData = searchParams.get('lastDoc');

    // Permission check: users can only search their own data unless admin
    const searchUserId = targetUserId && isAdmin(userId) ? targetUserId : userId;

    // Parse filters
    const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;
    const costRange = minCost || maxCost ? {
      min: minCost ? parseFloat(minCost) : 0,
      max: maxCost ? parseFloat(maxCost) : Infinity
    } : undefined;
    const durationRange = minDuration || maxDuration ? {
      min: minDuration ? parseInt(minDuration, 10) : 0,
      max: maxDuration ? parseInt(maxDuration, 10) : Infinity
    } : undefined;

    // Parse last document for pagination
    let lastDoc = null;
    if (lastDocData) {
      try {
        lastDoc = JSON.parse(lastDocData);
      } catch (error) {
        console.warn('Invalid lastDoc parameter:', error);
      }
    }

    // Search usage records
    const searchResult = await searchUsageRecords({
      searchTerm: searchTerm || undefined,
      userId: searchUserId,
      dateRange,
      costRange,
      durationRange,
      success: success !== null ? success === 'true' : undefined,
      cacheHit: cacheHit !== null ? cacheHit === 'true' : undefined,
      pageSize: Math.min(pageSize, 100), // Max 100 results per page
      lastDoc
    });

    // Format the records for display
    const formattedRecords = searchResult.records.map(record => ({
      ...record,
      timestamp: record.timestamp.toDate().toISOString(),
      cost: formatCost(record.cost),
      formattedDuration: `${record.duration}ms`,
      endpoint: record.endpoint,
      success: record.success,
      cacheHit: record.cacheHit || false,
      errorCode: record.errorCode || null,
      totalTokens: record.totalTokens,
      // Add calculated fields
      costPerToken: record.totalTokens > 0 ? record.cost / record.totalTokens : 0,
      tokensPerSecond: record.duration > 0 ? (record.totalTokens / (record.duration / 1000)) : 0
    }));

    // Calculate search summary
    const summary = {
      totalResults: searchResult.records.length,
      hasMore: searchResult.hasMore,
      avgCost: searchResult.records.length > 0 
        ? searchResult.records.reduce((sum, r) => sum + r.cost, 0) / searchResult.records.length
        : 0,
      avgDuration: searchResult.records.length > 0
        ? searchResult.records.reduce((sum, r) => sum + r.duration, 0) / searchResult.records.length
        : 0,
      successRate: searchResult.records.length > 0
        ? (searchResult.records.filter(r => r.success).length / searchResult.records.length) * 100
        : 0,
      cacheHitRate: searchResult.records.length > 0
        ? (searchResult.records.filter(r => r.cacheHit).length / searchResult.records.length) * 100
        : 0,
      endpointBreakdown: {} as Record<string, number>,
      dateRange: dateRange ? `${dateRange.start} to ${dateRange.end}` : 'All time'
    };

    // Calculate endpoint breakdown
    searchResult.records.forEach(record => {
      summary.endpointBreakdown[record.endpoint] = 
        (summary.endpointBreakdown[record.endpoint] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        records: formattedRecords,
        summary: {
          ...summary,
          avgCost: formatCost(summary.avgCost),
          avgDuration: `${Math.round(summary.avgDuration)}ms`,
          successRate: `${Math.round(summary.successRate * 100) / 100}%`,
          cacheHitRate: `${Math.round(summary.cacheHitRate * 100) / 100}%`
        },
        pagination: {
          hasMore: searchResult.hasMore,
          pageSize,
          lastDoc: searchResult.lastDoc
        },
        filters: {
          searchTerm,
          userId: searchUserId,
          dateRange,
          endpoint,
          success: success !== null ? success === 'true' : null,
          cacheHit: cacheHit !== null ? cacheHit === 'true' : null,
          costRange,
          durationRange
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error searching usage records:', error);
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
 * POST /api/usage/search
 * Advanced search with complex criteria (for future use)
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

    const searchCriteria = await req.json();
    const { 
      query,
      filters,
      sort,
      pagination,
      aggregations 
    } = searchCriteria;

    // This would implement more advanced search functionality
    // For now, redirect to GET method
    return NextResponse.json({
      success: false,
      error: 'Advanced search not yet implemented. Please use GET method with query parameters.',
      availableEndpoint: '/api/usage/search (GET)'
    });

  } catch (error) {
    console.error('Error in advanced search:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      },
      { status: 500 }
    );
  }
}