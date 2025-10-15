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
  const zipParamRaw = searchParams.get('zip');

  const parseZipQuery = (rawValue: string | null) => {
    if (!rawValue) return { query: null, postal: null, country: null as string | null };

    const parts = rawValue.split(',').map((section) => section.trim()).filter(Boolean);
    if (parts.length === 0) {
      return { query: null, postal: null, country: null as string | null };
    }

    const postalPart = parts[0];
    const countryPart = parts.length > 1 ? parts[1].toUpperCase() : 'US';

    return {
      query: `${postalPart}${countryPart ? `,${countryPart}` : ''}`,
      postal: postalPart,
      country: countryPart,
    };
  };

  const { query: zipQuery, postal: providedPostal, country: providedCountry } = parseZipQuery(zipParamRaw);

  const resolveCityFromPostal = async (postalCode: string | null, countryCode: string | null) => {
    if (!postalCode) return null;
    const countrySegment = (countryCode ?? 'US').toLowerCase();

    try {
      const geoResponse = await fetch(`https://api.zippopotam.us/${countrySegment}/${postalCode}`, {
        next: { revalidate: 86400 }, // cache lookup for a day
      });

      if (!geoResponse.ok) {
        return null;
      }

      const geoData = await geoResponse.json();
      if (geoData?.places?.length > 0) {
        const place = geoData.places[0];
        const city = place?.['place name'];
        const state = place?.['state abbreviation'];
        const parts: string[] = [];
        if (city) parts.push(city);
        if (state) parts.push(state);
        if (parts.length > 0) {
          return parts.join(', ');
        }
      }
    } catch (lookupError) {
      console.warn('Postal lookup failed:', lookupError);
    }

    return null;
  };
  
  // Use provided coordinates or default to a general location
  const latitude = lat || '40.7128'; // Default to NYC
  const longitude = lon || '-74.0060';
  
  try {
    // Using OpenWeatherMap API (free tier)
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    
    if (!API_KEY) {
      const cityFromPostal = await resolveCityFromPostal(providedPostal, providedCountry);
      const fallbackLocation = cityFromPostal
        ? `${cityFromPostal}${providedPostal ? `, ${providedPostal}` : ''}`
        : providedPostal
          ? `ZIP ${providedPostal}`
          : 'Your Location';

      // Return mock data if no API key is configured
      return NextResponse.json({
        temperature: Math.round(Math.random() * 30 + 50), // 50-80°F
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
        icon: '01d',
        location: fallbackLocation,
        humidity: Math.round(Math.random() * 40 + 40), // 40-80%
        windSpeed: Math.round(Math.random() * 15 + 5) // 5-20 mph
      } as WeatherData);
    }

    const weatherEndpoint = zipQuery
      ? `https://api.openweathermap.org/data/2.5/weather?zip=${zipQuery}&appid=${API_KEY}&units=imperial`
      : `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=imperial`;

    const response = await fetch(weatherEndpoint, {
      next: { revalidate: 600 }, // Cache for 10 minutes
    });
    
    if (!response.ok) {
      throw new Error('Weather API request failed');
    }
    
    const data = await response.json();

    let locationName: string | null = data?.name ?? null;
    let postalCode: string | null = providedPostal ?? null;

    if (!postalCode && data?.zip) {
      postalCode = data.zip.toString();
    }

    const latForLookup = data?.coord?.lat ?? parseFloat(latitude);
    const lonForLookup = data?.coord?.lon ?? parseFloat(longitude);

    if ((!locationName || !postalCode) && Number.isFinite(latForLookup) && Number.isFinite(lonForLookup)) {
      try {
        const reverseGeoRes = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${latForLookup}&lon=${lonForLookup}&limit=1&appid=${API_KEY}`,
          { next: { revalidate: 3600 } }
        );

        if (reverseGeoRes.ok) {
          const reverseData = await reverseGeoRes.json();
          if (Array.isArray(reverseData) && reverseData.length > 0) {
            const record = reverseData[0];
            if (!locationName && record?.name) {
              locationName = record.name;
            }
            if (!postalCode && record?.zip) {
              postalCode = record.zip.toString();
            }
          }
        }
      } catch (geoError) {
        console.warn('Weather reverse geocoding failed:', geoError);
      }
    }

    const postalLookupValue = postalCode ?? providedPostal;
    const derivedCountry = providedCountry ?? data?.sys?.country ?? null;
    const enrichedLocation = await resolveCityFromPostal(postalLookupValue, derivedCountry);

    if (enrichedLocation) {
      locationName = enrichedLocation;
    }

    const locationParts: string[] = [];
    if (locationName) {
      locationParts.push(locationName);
    }
    if (postalLookupValue) {
      locationParts.push(postalLookupValue);
    } else if (zipQuery) {
      // If API didn't return a postal code, fall back to the provided value
      const fallbackPostal = providedPostal ?? zipQuery.split(',')[0];
      if (fallbackPostal) {
        locationParts.push(fallbackPostal);
      }
    }

    const locationLabel = locationParts.length > 0 ? locationParts.join(', ') : 'Your Location';
    
    const weatherData: WeatherData = {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      icon: data.weather[0].icon,
      location: locationLabel,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed)
    };
    
    return NextResponse.json(weatherData);
    
  } catch (error) {
    console.error('Weather API error:', error);
    
    // Return mock data on error
    const cityFromPostal = await resolveCityFromPostal(providedPostal, providedCountry);
    const fallbackLocation = cityFromPostal
      ? `${cityFromPostal}${providedPostal ? `, ${providedPostal}` : ''}`
      : providedPostal
        ? `ZIP ${providedPostal}`
        : 'Your Location';

    return NextResponse.json({
      temperature: Math.round(Math.random() * 30 + 50),
      condition: 'Partly Cloudy',
      icon: '02d',
      location: fallbackLocation,
      humidity: Math.round(Math.random() * 40 + 40),
      windSpeed: Math.round(Math.random() * 15 + 5)
    } as WeatherData);
  }
}
