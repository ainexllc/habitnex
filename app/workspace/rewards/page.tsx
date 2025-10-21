'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FamilyRewardsPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/workspace?tab=rewards');
  }, [router]);

  return null;
}
