'use client';

import { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { InviteCodeDisplay } from '@/components/family/InviteCodeDisplay';
import { FeedbackDisplay } from '@/components/feedback/FeedbackDisplay';
import { Clock, Bell, Palette, Users, Moon, Sun, Monitor, Edit2, Save, Shield, Mail, Activity, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { texturePatterns, type TexturePatternId } from '@/lib/familyTextures';

export function FamilySettingsTab() {
  const { currentFamily, currentMember, isParent, updateFamilySettings, updateFamilyName } = useFamily();
  const { mode, preset, setPreset, availableThemes } = useTheme();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  // Local state for family settings
  const [touchScreenMode, setTouchScreenMode] = useState(false);
  const [autoTimeout, setAutoTimeout] = useState(5);
  const [weatherZip, setWeatherZip] = useState('');
  const [cardTexture, setCardTexture] = useState<TexturePatternId>('sparkle-bubbles');
  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    weeklyReports: true,
    rewardAlerts: true
  });
  const themeGroups: Array<'light' | 'dark'> = ['light', 'dark'];

  // Initialize form with current family settings
  useEffect(() => {
    if (currentFamily) {
      setFamilyName(currentFamily.name || '');
      if (currentFamily.settings) {
        setTouchScreenMode(currentFamily.settings.touchScreenMode || false);
        setAutoTimeout(currentFamily.settings.autoTimeout || 5);
        setWeatherZip(currentFamily.settings.weatherZip || '');
        setCardTexture(currentFamily.settings.cardTexture || 'sparkle-bubbles');
        setNotifications(currentFamily.settings.notifications || {
          dailyReminders: true,
          weeklyReports: true,
          rewardAlerts: true
        });
      }
    }
  }, [currentFamily]);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);

      const sanitizedZip = weatherZip.replace(/[^0-9]/g, '').slice(0, 5);

      const settings = {
        ...currentFamily.settings,
        touchScreenMode,
        autoTimeout,
        notifications,
        weatherZip: sanitizedZip,
        cardTexture,
      };

      await updateFamilySettings(settings);
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

  return (
    <div className="px-6">
      {/* Stats and Actions Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
            {currentFamily.members.filter(m => m.isActive).length} Active Members
          </span>
          <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
            {mode === 'dark' ? 'Dark mode' : 'Light mode'} · {availableThemes.find((t) => t.id === preset)?.name ?? 'Classic'}
          </span>
        </div>

        {isParent && (
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-8 p-5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 rounded-lg flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Settings saved successfully!
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Family Information */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Family Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Family Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  disabled={!isEditingName && !isParent}
                  placeholder="Enter family name"
                  className={cn(
                    "flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-700",
                    "text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "border-gray-300 dark:border-gray-600",
                    !isEditingName && !isParent && "opacity-60 cursor-not-allowed"
                  )}
                />
                {isParent && (
                  <Button
                    variant={isEditingName ? "primary" : "ghost"}
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
                    {isEditingName ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  </Button>
                )}
              </div>
              {currentFamily?.isPersonal && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  This is your personal dashboard name
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Family ID
              </label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <code className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {currentFamily.id}
                </code>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Created
              </label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(currentFamily.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Weather ZIP Code
              </label>
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
                  "w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700",
                  "text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  "border-gray-300 dark:border-gray-600",
                  !isParent && "opacity-60 cursor-not-allowed"
                )}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                We’ll use this ZIP code to show the local forecast in the dashboard banner. Leave blank to fall back to
                the device location.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Theme Presets
                </label>
                <div className="space-y-6">
                  {themeGroups.map((group) => {
                    const themesForGroup = availableThemes.filter((theme) => theme.appearance === group);
                    if (!themesForGroup.length) {
                      return null;
                    }
                    return (
                      <div key={group} className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                          {group === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                          <span>{group === 'light' ? 'Daylight themes' : 'Midnight themes'}</span>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {themesForGroup.map((themeOption) => (
                            <button
                              key={themeOption.id}
                              type="button"
                              onClick={() => setPreset(themeOption.id)}
                              className={cn(
                                "relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                                preset === themeOption.id
                                  ? "border-blue-500 shadow-lg"
                                  : "border-transparent hover:border-blue-300 dark:hover:border-blue-500/40"
                              )}
                              style={{ background: themeOption.previewGradient }}
                            >
                              <div className="absolute inset-0 bg-black/10 dark:bg-black/20 mix-blend-soft-light" />
                              <div className="relative flex flex-col gap-2 text-white drop-shadow-md">
                                <span className="text-sm font-semibold uppercase tracking-wide opacity-80">
                                  {themeOption.name}
                                </span>
                                <span className="text-xs opacity-75">
                                  {themeOption.description}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  Each preset delivers a complete experience, including colors, surfaces, and depth. Choose the vibe that fits your family.
                </p>
              </div>

              {/* Member Card Texture Selection */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Member Card Texture</span>
                  </div>
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  {Object.values(texturePatterns).map((pattern) => (
                    <button
                      key={pattern.id}
                      type="button"
                      onClick={() => setCardTexture(pattern.id)}
                      disabled={!isParent}
                      className={cn(
                        "relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
                        cardTexture === pattern.id
                          ? "border-purple-500 shadow-lg"
                          : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500/40",
                        !isParent && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      {/* Texture Preview Background */}
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
                            pattern.getSvg('#8B5CF6', '#D1D5DB', '#6B7280')
                          )}")`,
                          backgroundSize: '200px 200px',
                          backgroundRepeat: 'repeat'
                        }}
                      />

                      {/* Content */}
                      <div className="relative flex flex-col gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {pattern.name}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {pattern.description}
                        </span>
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                          {pattern.vibe}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  This texture will be applied to member cards on the Overview tab. Each pattern adapts to your chosen member colors.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Touch Screen Settings - Only visible to parents */}
        {isParent && (
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="p-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Monitor className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Touch Screen Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={touchScreenMode}
                  onChange={(e) => setTouchScreenMode(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    Enable Touch Screen Mode
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Optimizes the interface for tablets and touch screens with larger buttons and improved touch targets
                  </div>
                </div>
              </label>

              {touchScreenMode && (
                <div className="mt-4 pl-8">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Auto Timeout
                  </label>
                  <select
                    value={autoTimeout}
                    onChange={(e) => setAutoTimeout(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1">1 minute</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="0">Never</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Automatically return to overview after inactivity
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notification Preferences */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.dailyReminders}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  dailyReminders: e.target.checked
                }))}
                disabled={!isParent}
                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Daily Reminders
                  </span>
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Get reminded about your daily habits at your preferred time
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.weeklyReports}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  weeklyReports: e.target.checked
                }))}
                disabled={!isParent}
                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Weekly Reports
                  </span>
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Receive comprehensive weekly progress summaries every Sunday
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.rewardAlerts}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  rewardAlerts: e.target.checked
                }))}
                disabled={!isParent}
                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Reward Alerts
                  </span>
                  <Bell className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Get notified when family members earn rewards and achievements
                </div>
              </div>
            </label>

            {!isParent && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <Shield className="w-4 h-4 inline mr-1" />
                Only parents can modify notification settings
              </p>
            )}
          </CardContent>
        </Card>

        {/* Family Invite Code - Only for parents */}
        {isParent && (
          <div className="lg:col-span-2">
            <InviteCodeDisplay variant="card" showTitle={false} />
          </div>
        )}

        {/* Family Feedback Management */}
        <div className="lg:col-span-2">
          <FeedbackDisplay />
        </div>
      </div>
    </div>
  );
}
