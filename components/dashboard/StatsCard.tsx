'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  className = '' 
}: StatsCardProps) {
  return (
    <Card className={`${className}`}>
      <div className="flex items-center justify-between p-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark truncate">
            {title}
          </p>
          <div className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
            {value}
          </div>
        </div>
        <Icon className="h-3 w-3 text-text-muted-light dark:text-text-muted-dark flex-shrink-0 ml-1" />
      </div>
    </Card>
  );
}