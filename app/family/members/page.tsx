'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FamilyMembersPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/workspace?tab=members');
  }, [router]);

  return null;
}
