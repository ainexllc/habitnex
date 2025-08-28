'use client';

import { useFamily } from '@/contexts/FamilyContext';
import { Button } from '@/components/ui/Button';
import { Home, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function FamilyNameBlock({ className }: { className?: string }) {
  const { currentFamily } = useFamily();

  if (!currentFamily) return null;

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentFamily.name}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentFamily.members.filter(m => m.isActive).length} members
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/dashboard/family?tab=overview">
            <Button variant="outline" size="sm">
              <Home className="w-4 h-4 mr-1" />
              Overview
            </Button>
          </Link>
          <Link href="/dashboard/family?tab=members">
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-1" />
              Members
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}