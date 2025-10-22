'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { useWeather } from '@/hooks/useWeather';
import { cn } from '@/lib/utils';
import { resolveMode, MODE_CONFIGS, TAB_META } from '@/lib/modes';
import type { HabitNexModeId, FamilyTabId } from '@/types/family';
import {
  ArrowRight,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Maximize,
  Minimize,
  LogOut,
  Sun,
  Loader2,
  Settings
} from 'lucide-react';

interface ModernWorkspaceHeaderProps {
  familyName: string;
  date: string;
  touchMode?: boolean;
  isParent?: boolean;
  className?: string;
  activeTab?: FamilyTabId;
  onTabChange?: (tab: FamilyTabId) => void;
}

const WEATHER_ICON_SIZE = 18;

const getWeatherIcon = (condition: string | null) => {
  const normalized = condition?.toLowerCase() ?? '';
  switch (normalized) {
    case 'rain':
    case 'drizzle':
      return CloudRain;
    case 'snow':
      return CloudSnow;
    case 'thunderstorm':
      return CloudLightning;
    case 'clouds':
      return Cloud;
    case 'clear':
    default:
      return Sun;
  }
};

export function ModernWorkspaceHeader({
  familyName,
  date,
  className,
  activeTab = 'overview',
  onTabChange,
}: ModernWorkspaceHeaderProps) {
  const router = useRouter();
  const { palette, mode } = useTheme();
  const { currentFamily, currentMember } = useFamily();
  const { userProfile, user, signOut } = useAuth();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const memberCount = currentFamily?.members?.length ?? 0;
  const inferredMode: HabitNexModeId = resolveMode(
    (currentFamily?.settings?.mode as HabitNexModeId | undefined) ?? null,
    {
      isPersonal: currentFamily?.isPersonal,
      memberCount,
    }
  );
  const modeConfig = MODE_CONFIGS[inferredMode];

  const familyWeatherZip = currentFamily?.settings?.weatherZip?.trim() || null;
  const { weather, loading: weatherLoading } = useWeather(familyWeatherZip);
  const WeatherIcon = getWeatherIcon(weather?.condition ?? null);

  const displayName =
    currentMember?.displayName ||
    userProfile?.displayName ||
    user?.email?.split('@')[0] ||
    'HabitNex Hero';

  const heroHeadline = memberCount <= 1 ? `Welcome back, ${displayName}` : familyName;
  const heroSupporting = memberCount <= 1 ? `It’s ${date} · Keep your pulse steady` : `${memberCount} members · ${date}`;

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

  const handleFullscreenToggle = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // ignore fullscreen errors
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

  const primaryNav = useMemo(() => {
    const list = modeConfig.navigation.primary;
    return list.filter((tab) => TAB_META[tab]);
  }, [modeConfig.navigation.primary]);

  const secondaryNav = useMemo(() => {
    const list = modeConfig.navigation.secondary ?? [];
    return list.filter((tab) => TAB_META[tab]);
  }, [modeConfig.navigation.secondary]);

  const renderNav = (tabs: FamilyTabId[], variant: 'primary' | 'secondary') => {
    if (!tabs.length) return null;

    return (
      <nav
        className={cn(
          'flex items-center gap-2 overflow-x-auto rounded-full border border-white/5 bg-white/5 p-1 backdrop-blur',
          variant === 'secondary' && 'border-dashed bg-white/2'
        )}
      >
        {tabs.map((tab) => {
          const meta = TAB_META[tab];
          if (!meta) return null;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange?.(tab)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                isActive
                  ? 'shadow-lg shadow-black/20'
                  : 'text-white/70 hover:text-white'
              )}
              style={
                isActive
                  ? { background: modeConfig.accent, color: modeConfig.onAccent }
                  : undefined
              }
            >
              <meta.icon className="h-4 w-4" />
              <span className="whitespace-nowrap">{meta.label}</span>
            </button>
          );
        })}
      </nav>
    );
  };

  return (
    <header className={cn('relative border-b border-white/10 bg-[#050607]/80 backdrop-blur-md', className)}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.4em] text-[#ff7a1c]">{modeConfig.name}</p>
            <h1 className="text-2xl font-semibold text-white sm:text-[28px]">{heroHeadline}</h1>
            <p className="text-sm text-white/70">{heroSupporting}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
              {weatherLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <WeatherIcon size={WEATHER_ICON_SIZE} className="text-white" />
              )}
              <div className="leading-tight">
                <p className="font-medium text-white/90">
                  {weather?.temperature ? `${Math.round(weather.temperature)}°F` : '—'}
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                  {weather?.location ? weather.location : weather?.condition ?? 'Weather'}
                </p>
              </div>
            </div>
            <ThemeToggle compact className="bg-white/10 hover:bg-white/15" showLabel={false} />
            <button
              type="button"
              onClick={() => onTabChange?.('settings')}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/80 transition",
                activeTab === 'settings' ? "bg-[#ff7a1c] text-white" : "bg-white/5 hover:bg-white/10 hover:text-white"
              )}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleFullscreenToggle}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:text-white"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
            <button
              type="button"
              disabled={signingOut}
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-[#ff7a1c] to-[#ff9966] px-3 py-2 text-xs font-semibold text-black transition disabled:opacity-60"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {renderNav(primaryNav, 'primary')}
        {renderNav(secondaryNav, 'secondary')}
      </div>
    </header>
  );
}
