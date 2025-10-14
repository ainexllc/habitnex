'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { detectSystemTimeFormat } from '@/lib/timeUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Settings, Clock, Bell, Palette, Sun, Moon } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const { preset, setPreset, availableThemes } = useTheme();
  const themeGroups: Array<'light' | 'dark'> = ['light', 'dark'];
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Local state for form
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [locale, setLocale] = useState('en-US');
  const [notifications, setNotifications] = useState(true);
  const [weekStartsOn, setWeekStartsOn] = useState(0);

  // Initialize form with current preferences
  useEffect(() => {
    if (preferences) {
      setTimeFormat(preferences.timeFormat);
      setLocale(preferences.locale);
      setNotifications(preferences.notifications);
      setWeekStartsOn(preferences.weekStartsOn);
    }
  }, [preferences]);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'preferences.timeFormat': timeFormat,
        'preferences.locale': locale,
        'preferences.notifications': notifications,
        'preferences.weekStartsOn': weekStartsOn,
        updatedAt: new Date()
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectAndSetSystemFormat = () => {
    const detected = detectSystemTimeFormat();
    setTimeFormat(detected);
  };

  const detectAndSetSystemLocale = () => {
    const detected = navigator.language || 'en-US';
    setLocale(detected);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please sign in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your HabitNex experience and preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Time & Format Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time & Format
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Time Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Format
              </label>
              <div className="flex items-center gap-4">
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="12h"
                      checked={timeFormat === '12h'}
                      onChange={(e) => setTimeFormat(e.target.value as '12h')}
                      className="mr-2"
                    />
                    12-hour (2:30 PM)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="24h"
                      checked={timeFormat === '24h'}
                      onChange={(e) => setTimeFormat(e.target.value as '24h')}
                      className="mr-2"
                    />
                    24-hour (14:30)
                  </label>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={detectAndSetSystemFormat}
                  type="button"
                >
                  Auto-detect
                </Button>
              </div>
            </div>

            {/* Locale */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language & Region
              </label>
              <div className="flex items-center gap-4">
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  className="input flex-1"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="en-CA">English (Canada)</option>
                  <option value="en-AU">English (Australia)</option>
                  <option value="es-ES">Español (España)</option>
                  <option value="es-MX">Español (México)</option>
                  <option value="fr-FR">Français (France)</option>
                  <option value="fr-CA">Français (Canada)</option>
                  <option value="de-DE">Deutsch (Deutschland)</option>
                  <option value="it-IT">Italiano (Italia)</option>
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="pt-PT">Português (Portugal)</option>
                  <option value="ja-JP">日本語 (日本)</option>
                  <option value="ko-KR">한국어 (대한민국)</option>
                  <option value="zh-CN">中文 (简体)</option>
                  <option value="zh-TW">中文 (繁體)</option>
                </select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={detectAndSetSystemLocale}
                  type="button"
                >
                  Auto-detect
                </Button>
              </div>
            </div>

            {/* Week Start */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Week Starts On
              </label>
              <select
                value={weekStartsOn}
                onChange={(e) => setWeekStartsOn(Number(e.target.value))}
                className="input w-full"
              >
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose a preset to restyle HabitNex. Themes bundle backgrounds, glass, and depth so every surface stays consistent.
            </p>
            <div className="space-y-6">
              {themeGroups.map((group) => {
                const themesForGroup = availableThemes.filter((theme) => theme.appearance === group);
                if (!themesForGroup.length) return null;
                return (
                  <div key={group} className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {group === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      <span>{group === 'light' ? 'Daylight themes' : 'Midnight themes'}</span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {themesForGroup.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setPreset(theme.id)}
                          className={`relative overflow-hidden rounded-xl border-2 transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${preset === theme.id ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'}`}
                          style={{ backgroundImage: theme.previewGradient }}
                        >
                          <div className="absolute inset-0 bg-black/10 dark:bg-black/20 mix-blend-soft-light" />
                          <div className="relative px-4 pb-4 pt-14 text-white drop-shadow-md">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold uppercase tracking-wide opacity-90">
                                {theme.name}
                              </span>
                              {preset === theme.id && (
                                <span className="text-xs font-semibold text-white/80">Active</span>
                              )}
                            </div>
                            <p className="mt-2 text-xs opacity-80">{theme.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>


        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="mr-2"
                />
                Enable notifications for habits and reminders
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          {success && (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <span className="text-sm">Settings saved successfully!</span>
            </div>
          )}
          <Button 
            onClick={handleSave}
            loading={loading}
            disabled={loading}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
