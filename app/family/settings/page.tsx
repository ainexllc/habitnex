'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FamilySettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to family dashboard with settings tab
    router.replace('/dashboard/family?tab=settings');
  }, [router]);

  return null;
}