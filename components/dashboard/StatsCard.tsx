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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-text-muted-light dark:text-text-muted-dark" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
          {value}
        </div>
        {description && (
          <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className={`text-xs mt-1 ${
            trend.isPositive 
              ? 'text-success-600 dark:text-success-400' 
              : 'text-error-500 dark:text-error-400'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  );
}