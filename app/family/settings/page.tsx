'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FamilySettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to workspace dashboard with settings tab
    router.replace('/?tab=settings');
  }, [router]);

  return null;
}
