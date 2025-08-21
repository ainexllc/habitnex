'use client';

interface ConfidenceIntervalProps {
  habitId: string;
  color: string;
  opacity?: number;
}

export function ConfidenceInterval({
  habitId,
  color,
  opacity = 0.2
}: ConfidenceIntervalProps) {
  // This component is integrated into the main TimelineChart as an Area component
  // It renders the confidence interval area around the main probability curve
  return null;
}