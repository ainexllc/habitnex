'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FamilyAnalyticsPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/dashboard/family?tab=analytics');
  }, [router]);

  return null;
}