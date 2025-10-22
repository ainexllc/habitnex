'use client';

import { useEffect, useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { InviteCodeDisplay } from '@/components/workspace/InviteCodeDisplay';
import { FeedbackDisplay } from '@/components/feedback/FeedbackDisplay';
import { cn } from '@/lib/utils';
import { texturePatterns, type TexturePatternId } from '@/lib/familyTextures';
import { MODE_CONFIGS, resolveMode } from '@/lib/modes';
import type { HabitNexModeId } from '@/types/family';
import {
  Activity,
  Bell,
  Clock,
  Monitor,
  Shield,
  Mail,
  Users,
  Sparkles,
  Edit2,
  Save,
} from 'lucide-react';

const MODE_OPTIONS: Array<{ id: HabitNexModeId; label: string; description: string }> = [
  {
    id: 'personalPulse',
    label: 'Personal Pulse',
    description: 'Best for individuals tracking their own routines.',
  },
  {
    id: 'partnerBoost',
    label: 'Partner Boost',
    description: 'Perfect for couples syncing shared goals.',
  },
  {
    id: 'householdHarmony',
    label: 'Household Harmony',
    description: 'Great for roommates or small friend groups.',
  },
  {
    id: 'familyOrbit',
    label: 'Family Orbit',
    description: 'Our full family experience with rewards for kids.',
  },
];

export function WorkspaceSettingsTab() {
  const { currentFamily, currentMember, isParent, updateFamilySettings, updateFamilyName } = useFamily();
  const { mode: themeMode } = useTheme();

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  const [touchScreenMode, setTouchScreenMode] = useState(false);
  const [autoTimeout, setAutoTimeout] = useState(5);
  const [weatherZip, setWeatherZip] = useState('');
  const [cardTexture, setCardTexture] = useState<TexturePatternId>('sparkle-bubbles');
  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    weeklyReports: true,
    rewardAlerts: true,
  });
  const [modeSelection, setModeSelection] = useState<HabitNexModeId>('familyOrbit');

  useEffect(() => {
    if (!currentFamily) return;
    setFamilyName(currentFamily.name || '');

    const settings = currentFamily.settings;
    if (settings) {
      setTouchScreenMode(settings.touchScreenMode || false);
      setAutoTimeout(settings.autoTimeout || 5);
      setWeatherZip(settings.weatherZip || '');
      setCardTexture(settings.cardTexture || 'sparkle-bubbles');
      setNotifications(
        settings.notifications || {
          dailyReminders: true,
          weeklyReports: true,
          rewardAlerts: true,
        }
      );
      setModeSelection(
        resolveMode(settings.mode, {
          isPersonal: currentFamily.isPersonal,
          memberCount: currentFamily.members?.filter((m) => m.isActive).length ?? 0,
        })
      );
    }
  }, [currentFamily]);

  const handleSaveSettings = async () => {
    if (!currentFamily) return;
    try {
      setSaving(true);
      const sanitizedZip = weatherZip.replace(/[^0-9]/g, '').slice(0, 5);
      await updateFamilySettings({
        ...currentFamily.settings,
        touchScreenMode,
        autoTimeout,
        notifications,
        weatherZip: sanitizedZip,
        cardTexture,
        mode: modeSelection,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFamilyName = async () => {
    if (!familyName.trim()) return;
    try {
      setSaving(true);
      await updateFamilyName(familyName.trim());
      setIsEditingName(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update family name:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!currentFamily || !currentMember) {
    return null;
  }

  const themeLabel = themeMode === 'dark' ? 'Ainex Pulse (Dark)' : 'Solstice Glass (Light)';

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pb-16 sm:px-6 lg:px-0">
      <header className="flex flex-col gap-4 rounded-[24px] border border-white/5 bg-[#0d101c]/85 px-6 py-5 shadow-[0_28px_90px_rgba(0,0,0,0.45)] sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[#ff7a1c]">Settings</p>
          <h2 className="text-xl font-semibold text-white sm:text-[22px]">Tune HabitNex to fit your crew</h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <Users className="h-4 w-4 text-[#ff7a1c]" />
              {currentFamily.members.filter((m) => m.isActive).length} active members
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Theme: {themeLabel}
            </span>
          </div>
        </div>
        {isParent && (
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="ml-auto inline-flex items-center rounded-full bg-[#ff7a1c] px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(255,122,28,0.3)] hover:bg-[#ff8a35]"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        )}
      </header>

      {success && (
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 shadow-[0_10px_30px_rgba(16,185,129,0.2)]">
          <Activity className="h-4 w-4" /> Settings saved successfully
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Family Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Family name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  disabled={!isEditingName && !isParent}
                  placeholder="Enter family name"
                  className={cn(
                    'flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white',
                    !isEditingName && !isParent && 'cursor-not-allowed opacity-60'
                  )}
                />
                {isParent && (
                  <Button
                    variant={isEditingName ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      if (isEditingName) {
                        handleSaveFamilyName();
                      } else {
                        setIsEditingName(true);
                      }
                    }}
                    disabled={saving}
                  >
                    {isEditingName ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                  </Button>
                )}
              </div>
              {currentFamily?.isPersonal && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">This is your personal dashboard name.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Family ID</label>
              <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/50">
                <code className="text-sm text-gray-600 dark:text-gray-400">{currentFamily.id}</code>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Created</label>
              <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/50">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(currentFamily.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weather ZIP code</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                value={weatherZip}
                onChange={(event) => setWeatherZip(event.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
                placeholder="e.g. 30301"
                disabled={!isParent}
                className={cn(
                  'w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white',
                  !isParent && 'cursor-not-allowed opacity-60'
                )}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                We use this to show your local forecast in the banner. Leave blank to use device location.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Mode & Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Experience mode</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose the HabitNex layout that fits your household. Switching modes keeps your habits and stats intact.
              </p>
              <div className="grid gap-3">
                {MODE_OPTIONS.map((option) => {
                  const selected = modeSelection === option.id;
                  const config = MODE_CONFIGS[option.id];
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setModeSelection(option.id)}
                      className={cn(
                        'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition-all hover:border-white/20',
                        selected && 'shadow-[0_12px_40px_rgba(0,0,0,0.35)]'
                      )}
                      style={
                        selected ? { background: config.accent, color: config.onAccent } : undefined
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">{option.label}</p>
                          <p className={cn('text-xs', selected ? 'opacity-80' : 'text-gray-600 dark:text-gray-400')}>
                            {option.description}
                          </p>
                        </div>
                        {selected && (
                          <span className="rounded-full bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]">
                            Active
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Member card texture</label>
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.values(texturePatterns).map((pattern) => (
                  <button
                    key={pattern.id}
                    type="button"
                    onClick={() => setCardTexture(pattern.id)}
                    disabled={!isParent}
                    className={cn(
                      'relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500',
                      cardTexture === pattern.id
                        ? 'border-purple-500 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500/40',
                      !isParent && 'cursor-not-allowed opacity-60'
                    )}
                  >
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
                          pattern.getSvg('#8B5CF6', '#D1D5DB', '#6B7280')
                        )}")`,
                        backgroundSize: '200px 200px',
                        backgroundRepeat: 'repeat',
                      }}
                    />
                    <div className="relative flex flex-col gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{pattern.name}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{pattern.description}</span>
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">{pattern.vibe}</span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This texture appears on member cards in the overview. Patterns automatically adapt to each member’s color theme.
              </p>
            </div>
          </CardContent>
        </Card>

        {isParent && (
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Monitor className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Touch screen mode
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={touchScreenMode}
                  onChange={(e) => setTouchScreenMode(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">Enable touch screen mode</div>
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Optimizes HabitNex for wall-mounted tablets with larger controls and timeouts.
                  </div>
                </div>
              </label>

              {touchScreenMode && (
                <div className="mt-4 pl-8">
                  <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Auto timeout
                  </label>
                  <select
                    value={autoTimeout}
                    onChange={(e) => setAutoTimeout(parseInt(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="1">1 minute</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="0">Never</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Automatically return to the overview after inactivity.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              Notification preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.dailyReminders}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    dailyReminders: e.target.checked,
                  }))
                }
                disabled={!isParent}
                className="mt-1 h-5 w-5 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">Daily reminders</span>
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Gentle nudges about today’s habits at your preferred time.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.weeklyReports}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    weeklyReports: e.target.checked,
                  }))
                }
                disabled={!isParent}
                className="mt-1 h-5 w-5 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">Weekly reports</span>
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  A full progress summary delivered every Sunday.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.rewardAlerts}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    rewardAlerts: e.target.checked,
                  }))
                }
                disabled={!isParent}
                className="mt-1 h-5 w-5 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">Reward alerts</span>
                  <Bell className="h-4 w-4 text-gray-400" />
                </div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Celebrate instantly when someone earns a boost or reward.
                </div>
              </div>
            </label>

            {!isParent && (
              <p className="mt-6 rounded-lg bg-gray-50 p-4 text-xs text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">
                <Shield className="mr-1 inline h-4 w-4" /> Only parents can modify shared notification settings.
              </p>
            )}
          </CardContent>
        </Card>

        {isParent && (
          <div className="md:col-span-2 xl:col-span-3">
            <InviteCodeDisplay variant="card" showTitle={false} />
          </div>
        )}

        <div className="md:col-span-2 xl:col-span-3">
          <FeedbackDisplay />
        </div>
      </div>
    </div>
  );
}
