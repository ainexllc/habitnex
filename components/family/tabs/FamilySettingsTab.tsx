'use client';

import { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { InviteCodeDisplay } from '@/components/family/InviteCodeDisplay';
import { FeedbackDisplay } from '@/components/feedback/FeedbackDisplay';
import { detectSystemTimeFormat } from '@/lib/timeUtils';
import { Settings, Clock, Globe, Bell, Palette, Users, Moon, Sun, Monitor, Edit2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FamilySettingsTab() {
  const { currentFamily, currentMember, isParent, loading, updateFamilySettings, updateFamilyName } = useFamily();
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [familyName, setFamilyName] = useState('');

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
      await updateFamilyName(familyName.trim());
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update family name:', error);
    }
  };

  if (!currentFamily || !currentMember) {
    return null;
  }

  return (
    <div>
      {/* Tab Header with Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Family Settings</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Customize your family's experience</p>
        </div>

        <Button
          onClick={handleSaveSettings}
          disabled={saving}
        >
          <Save className="w-5 h-5 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {success && (
        <div className="mb-8 p-3 bg-green-100 border border-green-300 text-green-800 rounded-lg">
          Settings saved successfully!
        </div>
      )}

      <div className="space-y-6">
        {/* Family Name Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Family Name
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Enter family name"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveFamilyName}
                className="text-gray-600 dark:text-gray-300"
                title="Save family name"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
            {currentFamily?.isPersonal && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                This is your personal dashboard name
              </p>
            )}
          </CardContent>
        </Card>

        {/* Family Invite Code */}
        {isParent && (
          <div>
            <InviteCodeDisplay variant="card" showTitle={true} />
          </div>
        )}

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="light"
                    checked={theme === 'light'}
                    onChange={(e) => setTheme(e.target.value as 'light')}
                    className="mr-2"
                  />
                  Light
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="dark"
                    checked={theme === 'dark'}
                    onChange={(e) => setTheme(e.target.value as 'dark')}
                    className="mr-2"
                  />
                  Dark
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="system"
                    checked={theme === 'system'}
                    onChange={(e) => setTheme(e.target.value as 'system')}
                    className="mr-2"
                  />
                  System
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Touch Screen Settings */}
        {isParent && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Touch Screen Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={touchScreenMode}
                  onChange={(e) => setTouchScreenMode(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Enable Touch Screen Mode</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Optimized interface for tablets and touch screens
                  </div>
                </div>
              </label>

              {touchScreenMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Auto Timeout (minutes)
                  </label>
                  <select
                    value={autoTimeout}
                    onChange={(e) => setAutoTimeout(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="1">1 minute</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                  </select>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.dailyReminders}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  dailyReminders: e.target.checked
                }))}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Daily Reminders</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Get reminded about your daily habits
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.weeklyReports}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  weeklyReports: e.target.checked
                }))}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Weekly Reports</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Receive weekly progress summaries
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.rewardAlerts}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  rewardAlerts: e.target.checked
                }))}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Reward Alerts</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified when rewards are available
                </div>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Family Feedback Management */}
        <FeedbackDisplay />
      </div>
    </div>
  );
}
