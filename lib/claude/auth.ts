import { NextRequest } from 'next/server';

/**
 * Get user ID from request headers with fallback for local development
 */
export async function getUserId(req: NextRequest): Promise<string | null> {
  try {
    // Get the Authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // For development, we'll trust the x-user-id header if present
      // In production, you would verify the JWT token here
      const userIdHeader = req.headers.get('x-user-id');
      if (userIdHeader) {
        return userIdHeader;
      }
    }

    // Check for x-user-id header
    const userIdHeader = req.headers.get('x-user-id');
    if (userIdHeader) {
      return userIdHeader;
    }

    // For local development, allow demo user
    if (process.env.NODE_ENV === 'development') {
      return 'local-dev-user';
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}