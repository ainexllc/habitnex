'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { useWeather } from '@/hooks/useWeather';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  Users,
  Target,
  Trophy,
  Gift,
  BarChart3,
  Home,
  Settings,
  Maximize,
  Minimize,
  LogOut,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
} from 'lucide-react';

interface ModernFamilyHeaderProps {
  familyName: string;
  date: string;
  touchMode?: boolean;
  isParent?: boolean;
  className?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const navigationLinks = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'habits', label: 'Habits', icon: Target },
  { id: 'challenges', label: 'Challenges', icon: Trophy },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

type VendorFullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
};

type VendorFullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
};

const resolveWeatherIcon = (condition: string, color: string) => {
  const normalized = condition.toLowerCase();
  const baseClass = 'w-5 h-5';

  switch (normalized) {
    case 'rain':
    case 'drizzle':
      return <CloudRain className={baseClass} style={{ color }} />;
    case 'snow':
      return <CloudSnow className={baseClass} style={{ color }} />;
    case 'thunderstorm':
      return <CloudLightning className={baseClass} style={{ color }} />;
    case 'clouds':
      return <Cloud className={baseClass} style={{ color }} />;
    case 'clear':
    default:
      return <Sun className={baseClass} style={{ color }} />;
  }
};

const buildWeatherOverlay = (
  condition: string | null,
  palette: ReturnType<typeof useTheme>['palette'],
  toRgba: (color: string | undefined, alpha: number) => string,
  mode: 'light' | 'dark'
) => {
  const accentLayer = toRgba(palette.accentSoft, mode === 'dark' ? 0.28 : 0.2);

  switch (condition) {
    case 'rain':
    case 'drizzle':
      return [
        `radial-gradient(circle at 10% 10%, rgba(14,165,233,0.25), transparent 60%)`,
        `radial-gradient(circle at 80% 80%, rgba(56,189,248,0.18), transparent 55%)`,
        `linear-gradient(135deg, ${accentLayer}, transparent 70%)`,
      ].join(',');
    case 'snow':
      return [
        `radial-gradient(circle at 15% 25%, rgba(241,245,249,0.35), transparent 55%)`,
        `radial-gradient(circle at 85% 65%, rgba(148,163,184,0.22), transparent 60%)`,
        `linear-gradient(135deg, ${accentLayer}, transparent 70%)`,
      ].join(',');
    case 'thunderstorm':
      return [
        `radial-gradient(circle at 25% 20%, rgba(147,51,234,0.24), transparent 60%)`,
        `radial-gradient(circle at 80% 45%, rgba(79,70,229,0.2), transparent 55%)`,
        `linear-gradient(135deg, ${accentLayer}, transparent 70%)`,
      ].join(',');
    case 'clouds':
      return [
        `linear-gradient(160deg, rgba(148,163,184,0.15), transparent 55%)`,
        `linear-gradient(320deg, rgba(148,163,184,0.1), transparent 60%)`,
        `linear-gradient(135deg, ${accentLayer}, transparent 70%)`,
      ].join(',');
    case 'clear':
      return [
        `radial-gradient(circle at 85% 20%, rgba(253,224,71,0.22), transparent 55%)`,
        `linear-gradient(135deg, ${accentLayer}, transparent 70%)`,
      ].join(',');
    default:
      return `linear-gradient(135deg, ${accentLayer}, transparent 70%)`;
  }
};

export function ModernFamilyHeader({
  familyName,
  date,
  touchMode = false,
  className,
  activeTab = 'overview',
  onTabChange,
}: ModernFamilyHeaderProps) {
  const { palette, mode } = useTheme();
  const { currentFamily, currentMember } = useFamily();
  const { userProfile, user, signOut } = useAuth();
  const router = useRouter();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const memberCount = currentFamily?.members?.length ?? 0;
  const isSoloFamily = memberCount <= 1;

  const displayName =
    currentMember?.displayName ||
    userProfile?.displayName ||
    user?.email?.split('@')[0] ||
    'HabitNex Hero';

  const headline = isSoloFamily ? `Welcome back, ${displayName}` : currentFamily?.name ?? familyName;
  const supportingLine = isSoloFamily
    ? 'Here’s your day at a glance'
    : `${memberCount} ${memberCount === 1 ? 'member' : 'members'} • ${date}`;

  const familyWeatherZip = currentFamily?.settings?.weatherZip?.trim() || null;
  const { weather, loading: weatherLoading, error: weatherError } = useWeather(familyWeatherZip);
  const weatherCondition = weather?.condition?.toLowerCase() ?? null;

  const toRgba = useCallback(
    (color: string | undefined, alpha: number) => {
      if (!color) return `rgba(59,130,246,${alpha})`;

      if (color.startsWith('rgba')) {
        const parts = color.match(/[\d.]+/g);
        if (parts && parts.length >= 3) {
          return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
        }
      }

      if (color.startsWith('rgb')) {
        const parts = color.match(/[\d.]+/g);
        if (parts && parts.length >= 3) {
          return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
        }
      }

      if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        const expanded = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
        const r = parseInt(expanded.substring(0, 2), 16);
        const g = parseInt(expanded.substring(2, 4), 16);
        const b = parseInt(expanded.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }

      return color;
    },
    []
  );

  const bannerBackground = useMemo(() => {
    const baseGradient = `linear-gradient(130deg, ${toRgba(
      palette.surface,
      mode === 'dark' ? 0.98 : 0.96
    )} 0%, ${toRgba(palette.surfaceMuted, mode === 'dark' ? 0.78 : 0.88)} 55%, ${toRgba(
      palette.accentSoft,
      mode === 'dark' ? 0.26 : 0.18
    )} 100%)`;

    if (!weatherCondition) return baseGradient;
    const overlay = buildWeatherOverlay(weatherCondition, palette, toRgba, mode);
    return `${baseGradient}, ${overlay}`;
  }, [palette, mode, weatherCondition, toRgba]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const element = document.documentElement as VendorFullscreenElement;
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          await element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen();
        }
      } else {
        const extendedDoc = document as VendorFullscreenDocument;
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (extendedDoc.webkitExitFullscreen) {
          await extendedDoc.webkitExitFullscreen();
        } else if (extendedDoc.mozCancelFullScreen) {
          await extendedDoc.mozCancelFullScreen();
        } else if (extendedDoc.msExitFullscreen) {
          await extendedDoc.msExitFullscreen();
        }
      }
    } catch {
      // no-op
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      router.replace('/');
    } catch {
      // swallow errors for now
    } finally {
      setSigningOut(false);
    }
  };

  const weatherIconColor = mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(17,24,39,0.8)';
  const weatherPrimaryText = mode === 'dark' ? palette.accentContrast : palette.textPrimary;
  const weatherSecondaryText = mode === 'dark' ? 'rgba(226,232,255,0.7)' : 'rgba(15,23,42,0.65)';
  const actionButtonText = mode === 'dark' ? palette.accentContrast : palette.textPrimary;
  const actionButtonBorder = toRgba(palette.borderMuted, mode === 'dark' ? 0.2 : 0.35);
  const actionButtonBackground =
    mode === 'dark'
      ? toRgba(palette.glass, 0.65)
      : `linear-gradient(130deg, ${toRgba(palette.surfaceMuted, 0.92)}, ${toRgba(palette.backgroundAlt, 0.82)})`;

  return (
    <header className={cn('relative mb-10', className)}>
      <div
        className="relative overflow-hidden border-b backdrop-blur-sm"
        style={{
          backgroundImage: bannerBackground,
          borderColor: toRgba(palette.border, mode === 'dark' ? 0.35 : 0.18),
          boxShadow: palette.shadow,
        }}
      >
        <div className="relative z-10 flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                  style={{
                    background:
                      mode === 'dark'
                        ? toRgba(palette.glass, 0.6)
                        : `linear-gradient(120deg, ${toRgba(palette.accentSoft, 0.2)}, ${toRgba(
                            palette.surfaceMuted,
                            0.85
                          )})`,
                    color: mode === 'dark' ? palette.accentContrast : palette.textSecondary,
                    border: `1px solid ${toRgba(palette.borderMuted, mode === 'dark' ? 0.2 : 0.35)}`,
                  }}
                >
                  {isSoloFamily ? 'Solo mode' : 'Family command center'}
                </span>
                {!isSoloFamily && (
                  <span className="text-sm font-medium" style={{ color: palette.textSecondary }}>
                    {memberCount} {memberCount === 1 ? 'member' : 'members'}
                  </span>
                )}
              </div>

              <h1
                className={cn(
                  'text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl',
                  touchMode && 'text-4xl sm:text-5xl'
                )}
                style={{ color: palette.textPrimary }}
              >
                {headline}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: palette.textSecondary }}>
                <span>{supportingLine}</span>
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: palette.accent }} />
                  {date}
                </span>
              </div>
            </div>

            <div className="flex min-w-[240px] flex-col items-start gap-4 sm:items-end">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <div
                  className="flex items-center gap-3 rounded-2xl border px-4 py-2"
                  style={{
                    background:
                      mode === 'dark'
                        ? toRgba(palette.glass, 0.7)
                        : `linear-gradient(130deg, ${toRgba(palette.surfaceMuted, 0.88)}, ${toRgba(
                            palette.backgroundAlt,
                            0.85
                          )})`,
                    borderColor: toRgba(palette.borderMuted, mode === 'dark' ? 0.4 : 0.6),
                    color: weatherPrimaryText,
                  }}
                >
                  {weather ? (
                    <>
                      <div className="flex items-center gap-2">
                        {resolveWeatherIcon(weather.condition, weatherIconColor)}
                        <div className="flex flex-col">
                          <span className="text-base font-semibold" style={{ color: weatherPrimaryText }}>
                            {Math.round(weather.temperature)}°F
                          </span>
                          <span className="text-xs uppercase tracking-wide" style={{ color: weatherSecondaryText }}>
                            {weather.condition}
                          </span>
                        </div>
                      </div>
                      <div
                        className="hidden flex-col items-end text-[11px] opacity-80 sm:flex"
                        style={{ color: weatherSecondaryText }}
                      >
                        <span>{weather.location}</span>
                        <span className="flex items-center gap-1">
                          <Wind className="h-3 w-3" />
                          {Math.round(weather.windSpeed)} mph
                        </span>
                      </div>
                    </>
                  ) : weatherLoading ? (
                    <span className="text-sm opacity-80" style={{ color: weatherSecondaryText }}>
                      Fetching weather…
                    </span>
                  ) : weatherError ? (
                    <span className="text-sm opacity-80" style={{ color: weatherSecondaryText }}>
                      Weather unavailable
                    </span>
                  ) : (
                    <>
                      {resolveWeatherIcon('clear', weatherIconColor)}
                      <span className="text-sm opacity-80" style={{ color: weatherSecondaryText }}>
                        Add weather in settings
                      </span>
                    </>
                  )}
                </div>

                <ThemeToggle />

                <Button
                  variant="ghost"
                  size={touchMode ? 'default' : 'sm'}
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  className="border border-transparent backdrop-blur transition-all duration-200"
                  style={{
                    background: actionButtonBackground,
                    color: actionButtonText,
                    borderColor: actionButtonBorder,
                  }}
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>

                <Button
                  variant="ghost"
                  size={touchMode ? 'default' : 'sm'}
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="border border-transparent backdrop-blur transition-all duration-200"
                  style={{
                    background: actionButtonBackground,
                    color: actionButtonText,
                    borderColor: actionButtonBorder,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">{signingOut ? 'Signing out…' : 'Sign out'}</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div
          className="border-t"
          style={{
            borderColor: toRgba(palette.borderMuted, mode === 'dark' ? 0.4 : 0.25),
            background: toRgba(palette.glass, 0.65),
          }}
        >
          <nav className="w-full">
            <div className="flex flex-wrap gap-2 px-4 py-3 sm:px-6 sm:py-4">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => onTabChange?.(link.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
                      isActive ? 'shadow-lg' : 'hover:-translate-y-0.5 hover:shadow-md'
                    )}
                    style={{
                      background: isActive ? palette.accentGradient : toRgba(palette.glass, isActive ? 0.9 : 0.55),
                      color: isActive ? palette.accentContrast : palette.textSecondary,
                      border: `1px solid ${toRgba(palette.borderMuted, isActive ? 0.2 : 0.15)}`,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
