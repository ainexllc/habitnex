'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestAvatarBuilderPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new unified avatar test page
    router.replace('/test-unified-avatar');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          Redirecting to the new Unified Avatar Creator...
        </p>
      </div>
    </div>
  );
}