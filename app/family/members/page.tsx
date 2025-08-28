'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FamilyMembersPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/dashboard/family?tab=members');
  }, [router]);

  return null;
}