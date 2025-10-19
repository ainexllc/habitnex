'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FamilyChallengesPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/?tab=challenges');
  }, [router]);

  return null;
}
