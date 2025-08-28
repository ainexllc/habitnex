import { useState, useEffect } from 'react';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  location: string;
  humidity: number;
  windSpeed: number;
}

interface UseWeatherReturn {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (lat?: number, lon?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (lat && lon) {
        params.append('lat', lat.toString());
        params.append('lon', lon.toString());
      }
      
      const response = await fetch(`/api/weather${params.toString() ? '?' + params.toString() : ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Fallback to default location if geolocation fails
          fetchWeather();
        }
      );
    } else {
      fetchWeather();
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const refetch = () => {
    getUserLocation();
  };

  return {
    weather,
    loading,
    error,
    refetch
  };
}