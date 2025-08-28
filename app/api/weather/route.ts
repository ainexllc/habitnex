import { NextRequest, NextResponse } from 'next/server';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  location: string;
  humidity: number;
  windSpeed: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  
  // Use provided coordinates or default to a general location
  const latitude = lat || '40.7128'; // Default to NYC
  const longitude = lon || '-74.0060';
  
  try {
    // Using OpenWeatherMap API (free tier)
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    
    if (!API_KEY) {
      // Return mock data if no API key is configured
      return NextResponse.json({
        temperature: Math.round(Math.random() * 30 + 50), // 50-80°F
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
        icon: '01d',
        location: 'Your Location',
        humidity: Math.round(Math.random() * 40 + 40), // 40-80%
        windSpeed: Math.round(Math.random() * 15 + 5) // 5-20 mph
      } as WeatherData);
    }
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=imperial`,
      { 
        next: { revalidate: 600 } // Cache for 10 minutes
      }
    );
    
    if (!response.ok) {
      throw new Error('Weather API request failed');
    }
    
    const data = await response.json();
    
    const weatherData: WeatherData = {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      icon: data.weather[0].icon,
      location: data.name,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed)
    };
    
    return NextResponse.json(weatherData);
    
  } catch (error) {
    console.error('Weather API error:', error);
    
    // Return mock data on error
    return NextResponse.json({
      temperature: Math.round(Math.random() * 30 + 50),
      condition: 'Partly Cloudy',
      icon: '02d',
      location: 'Your Location',
      humidity: Math.round(Math.random() * 40 + 40),
      windSpeed: Math.round(Math.random() * 15 + 5)
    } as WeatherData);
  }
}