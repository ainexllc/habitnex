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

export function useWeather(zipCode?: string | null): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (options: { lat?: number; lon?: number; zip?: string } = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (options.zip) {
        params.append('zip', options.zip);
      } else if (options.lat && options.lon) {
        params.append('lat', options.lat.toString());
        params.append('lon', options.lon.toString());
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
          fetchWeather({ lat: position.coords.latitude, lon: position.coords.longitude });
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
    if (zipCode && zipCode.replace(/[^0-9]/g, '').length >= 3) {
      fetchWeather({ zip: zipCode.replace(/[^0-9]/g, '').slice(0, 5) });
    } else {
      getUserLocation();
    }
  }, [zipCode]);

  const refetch = () => {
    if (zipCode && zipCode.replace(/[^0-9]/g, '').length >= 3) {
      fetchWeather({ zip: zipCode.replace(/[^0-9]/g, '').slice(0, 5) });
    } else {
      getUserLocation();
    }
  };

  return {
    weather,
    loading,
    error,
    refetch
  };
}
