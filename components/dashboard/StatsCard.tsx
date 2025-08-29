'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { theme } from '@/lib/theme';
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
          <p className={`text-xs font-medium ${theme.text.secondary} truncate`}>
            {title}
          </p>
          <div className={`text-sm font-bold ${theme.text.primary}`}>
            {value}
          </div>
        </div>
        <Icon className={`h-3 w-3 ${theme.text.muted} flex-shrink-0 ml-1`} />
      </div>
    </Card>
  );
}