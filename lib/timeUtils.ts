export interface TimeFormatOptions {
  hour12: boolean;
  timeStyle: 'short' | 'medium' | 'long';
}

export function getTimeFormatOptions(is24Hour: boolean): TimeFormatOptions {
  return {
    hour12: !is24Hour,
    timeStyle: 'short'
  };
}

export function getTimePlaceholder(is24Hour: boolean): string {
  return is24Hour ? '14:30' : '2:30 PM';
}

export function formatTime(date: Date, is24Hour: boolean): string {
  return date.toLocaleTimeString(undefined, getTimeFormatOptions(is24Hour));
}

export function parseTimeString(timeString: string): { hours: number; minutes: number } | null {
  const match = timeString.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return { hours, minutes };
}