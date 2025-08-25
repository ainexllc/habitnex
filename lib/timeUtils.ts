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

export function detectSystemTimeFormat(): '12h' | '24h' {
  // Try to detect system time format by creating a test date
  const testDate = new Date();
  const timeString = testDate.toLocaleTimeString();
  
  // Check if the time string contains AM/PM indicators
  if (timeString.toLowerCase().includes('am') || timeString.toLowerCase().includes('pm')) {
    return '12h';
  } else {
    return '24h';
  }
}

export function getTimeOptions(is24Hour: boolean): Array<{value: string; label: string}> {
  const options = [];
  
  if (is24Hour) {
    // 24-hour format
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push({
          value: timeStr,
          label: timeStr
        });
      }
    }
  } else {
    // 12-hour format
    for (let hour = 6; hour <= 11; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour}:${minute.toString().padStart(2, '0')}`;
        options.push({
          value: timeStr,
          label: `${timeStr} AM`
        });
      }
    }
    for (let hour = 12; hour <= 11; hour++) {
      if (hour > 12) break;
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour}:${minute.toString().padStart(2, '0')}`;
        options.push({
          value: timeStr,
          label: `${timeStr} PM`
        });
      }
    }
    for (let hour = 1; hour <= 11; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour}:${minute.toString().padStart(2, '0')}`;
        options.push({
          value: timeStr,
          label: `${timeStr} PM`
        });
      }
    }
  }
  
  return options;
}