'use client';

import { useWeather } from '@/hooks/useWeather';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherWidgetProps {
  className?: string;
  compact?: boolean;
}

const getWeatherIcon = (condition: string, iconCode: string) => {
  const isDay = iconCode.includes('d');
  
  switch (condition.toLowerCase()) {
    case 'clear':
      return <Sun className="w-5 h-5 text-yellow-300" />;
    case 'clouds':
      return <Cloud className="w-5 h-5 text-gray-300" />;
    case 'rain':
    case 'drizzle':
      return <CloudRain className="w-5 h-5 text-blue-300" />;
    case 'snow':
      return <CloudSnow className="w-5 h-5 text-gray-100" />;
    case 'thunderstorm':
      return <CloudLightning className="w-5 h-5 text-purple-300" />;
    default:
      return isDay ? <Sun className="w-5 h-5 text-yellow-300" /> : <Cloud className="w-5 h-5 text-gray-300" />;
  }
};

export function WeatherWidget({ className, compact = false }: WeatherWidgetProps) {
  const { weather, loading, error, refetch } = useWeather();

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 text-white/80", className)}>
        <div className="animate-spin">
          <RotateCw className="w-4 h-4" />
        </div>
        <span className="text-sm">Loading weather...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center gap-2 text-white/60", className)}>
        <Cloud className="w-4 h-4" />
        <span className="text-sm">Weather unavailable</span>
      </div>
    );
  }

  if (!weather) return null;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3 text-white", className)}>
        {getWeatherIcon(weather.condition, weather.icon)}
        <div className="flex items-center gap-1">
          <span className="text-lg font-semibold">{weather.temperature}°F</span>
          <span className="text-sm text-white/80">in {weather.location}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-4 text-white", className)}>
      <div className="flex items-center gap-2">
        {getWeatherIcon(weather.condition, weather.icon)}
        <div>
          <div className="text-lg font-semibold">{weather.temperature}°F</div>
          <div className="text-xs text-white/70">{weather.condition}</div>
        </div>
      </div>
      
      <div className="hidden sm:flex items-center gap-4 text-sm text-white/80">
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3" />
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="w-3 h-3" />
          <span>{weather.windSpeed} mph</span>
        </div>
      </div>
      
      <div className="text-xs text-white/60">
        {weather.location}
      </div>
      
      <button
        onClick={refetch}
        className="opacity-50 hover:opacity-80 transition-opacity"
        title="Refresh weather"
      >
        <RotateCw className="w-3 h-3" />
      </button>
    </div>
  );
}