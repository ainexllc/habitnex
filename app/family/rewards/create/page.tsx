'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateRewardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/family?tab=rewards');
  }, [router]);

  return null;
}