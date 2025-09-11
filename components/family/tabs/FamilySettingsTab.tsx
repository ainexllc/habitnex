'use client';

import { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { InviteCodeDisplay } from '@/components/family/InviteCodeDisplay';
import { FeedbackDisplay } from '@/components/feedback/FeedbackDisplay';
import { detectSystemTimeFormat } from '@/lib/timeUtils';
import { Settings, Clock, Globe, Bell, Palette, Users, Moon, Sun, Monitor, Edit2, Save, Shield, Mail, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FamilySettingsTab() {
  const { currentFamily, currentMember, isParent, loading, updateFamilySettings, updateFamilyName } = useFamily();
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  // Local state for family settings
  const [touchScreenMode, setTouchScreenMode] = useState(false);
  const [autoTimeout, setAutoTimeout] = useState(5);
  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    weeklyReports: true,
    rewardAlerts: true
  });

  // Initialize form with current family settings
  useEffect(() => {
    if (currentFamily) {
      setFamilyName(currentFamily.name || '');
      if (currentFamily.settings) {
        setTouchScreenMode(currentFamily.settings.touchScreenMode || false);
        setAutoTimeout(currentFamily.settings.autoTimeout || 5);
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

      const settings = {
        touchScreenMode,
        autoTimeout,
        notifications
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
            {theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'} Theme
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Theme Mode
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all",
                    theme === 'light'
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  )}
                >
                  <Sun className={cn(
                    "w-6 h-6 mb-2",
                    theme === 'light' ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                  )} />
                  <span className={cn(
                    "text-sm font-medium",
                    theme === 'light' ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                  )}>
                    Light
                  </span>
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all",
                    theme === 'dark'
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  )}
                >
                  <Moon className={cn(
                    "w-6 h-6 mb-2",
                    theme === 'dark' ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                  )} />
                  <span className={cn(
                    "text-sm font-medium",
                    theme === 'dark' ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                  )}>
                    Dark
                  </span>
                </button>

                <button
                  onClick={() => setTheme('system')}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all",
                    theme === 'system'
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  )}
                >
                  <Monitor className={cn(
                    "w-6 h-6 mb-2",
                    theme === 'system' ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                  )} />
                  <span className={cn(
                    "text-sm font-medium",
                    theme === 'system' ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                  )}>
                    System
                  </span>
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                Choose how NextVibe appears on your device
              </p>
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