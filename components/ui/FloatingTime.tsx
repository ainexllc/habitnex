'use client';

import { useEffect, useState } from 'react';

export function FloatingTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-full px-6 py-3 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
            {formatTime(time)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatDate(time)}
          </div>
        </div>
      </div>
    </div>
  );
}