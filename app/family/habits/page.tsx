'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FamilyHabitsPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/dashboard/family?tab=habits');
  }, [router]);

  return null;
}