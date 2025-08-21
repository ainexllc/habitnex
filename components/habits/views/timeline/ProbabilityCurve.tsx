'use client';

interface ProbabilityCurveProps {
  habitId: string;
  color: string;
  opacity?: number;
  strokeWidth?: number;
  showDots?: boolean;
}

export function ProbabilityCurve({
  habitId,
  color,
  opacity = 0.8,
  strokeWidth = 2,
  showDots = true
}: ProbabilityCurveProps) {
  // This component is integrated into the main TimelineChart
  // It's used as a configuration object rather than a standalone component
  return null;
}