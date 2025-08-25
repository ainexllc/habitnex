'use client';

import { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { Button } from '@/components/ui/Button';
import { DiceBearAvatar, AvatarStyle } from '@/components/ui/DiceBearAvatar';
import { ArrowLeft, Save, Palette, Users, Moon, Sun, Bell, Monitor } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const avatarStyles = [
  { 
    value: 'fun-emoji' as AvatarStyle, 
    label: 'Fun Emoji', 
    description: 'Colorful, playful emoji-style faces',
    preview: ['happy', 'excited', 'cool', 'silly']
  },
  { 
    value: 'avataaars' as AvatarStyle, 
    label: 'Illustrated', 
    description: 'Popular cartoon-style avatars',
    preview: ['person1', 'person2', 'person3', 'person4']
  },
  { 
    value: 'bottts' as AvatarStyle, 
    label: 'Robots', 
    description: 'Fun robot avatars (great for kids)',
    preview: ['bot1', 'bot2', 'bot3', 'bot4']
  },
  { 
    value: 'personas' as AvatarStyle, 
    label: 'Professional', 
    description: 'Clean, professional avatars',
    preview: ['pro1', 'pro2', 'pro3', 'pro4']
  }
];

export default function FamilySettingsPage() {
  const { currentFamily, currentMember, isParent, loading, updateFamilySettings } = useFamily();
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [settings, setSettings] = useState({
    avatarStyle: 'personas' as AvatarStyle,
    theme: 'light' as 'light' | 'dark',
    touchScreenMode: false,
    autoTimeout: 5,
    notifications: {
      dailyReminders: true,
      weeklyReports: true,
      rewardAlerts: true
    }
  });
  
  // Initialize settings from current family
  useEffect(() => {
    if (currentFamily?.settings) {
      setSettings({
        avatarStyle: currentFamily.settings.avatarStyle || 'personas',
        theme: currentFamily.settings.theme || 'light',
        touchScreenMode: currentFamily.settings.touchScreenMode || false,
        autoTimeout: currentFamily.settings.autoTimeout || 5,
        notifications: currentFamily.settings.notifications || {
          dailyReminders: true,
          weeklyReports: true,
          rewardAlerts: true
        }
      });
    }
  }, [currentFamily]);
  
  const handleSaveSettings = async () => {
    setSaving(true);
    setSuccessMessage('');
    
    try {
      await updateFamilySettings(settings);
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-600 dark:text-blue-400 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }
  
  if (!currentFamily || !currentMember || !isParent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Only parents can access family settings.</p>
          <Link href="/family/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/family/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Family Settings</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Customize your family's experience</p>
            </div>
            
            <Button 
              onClick={handleSaveSettings}
              disabled={saving}
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
          
          {successMessage && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded-lg">
              {successMessage}
            </div>
          )}
        </div>
        
        {/* Avatar Style Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Avatar Style</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Choose a consistent avatar style for all family members</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {avatarStyles.map((style) => (
              <label key={style.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="avatarStyle"
                  value={style.value}
                  checked={settings.avatarStyle === style.value}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    avatarStyle: e.target.value as AvatarStyle 
                  }))}
                  className="sr-only"
                />
                <div className={cn(
                  "p-4 border-2 rounded-lg transition-all",
                  settings.avatarStyle === style.value 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                )}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{style.label}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{style.description}</p>
                    </div>
                    {settings.avatarStyle === style.value && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {style.preview.map((seed, index) => (
                      <DiceBearAvatar
                        key={seed}
                        seed={seed}
                        style={style.value}
                        size={32}
                        className="rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
        
        {/* Theme Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            {settings.theme === 'light' ? 
              <Sun className="w-5 h-5 text-yellow-500" /> : 
              <Moon className="w-5 h-5 text-blue-600" />
            }
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Theme</h2>
          </div>
          
          <div className="flex gap-4">
            <label className="cursor-pointer flex-1">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={settings.theme === 'light'}
                onChange={(e) => setSettings(prev => ({ ...prev, theme: 'light' }))}
                className="sr-only"
              />
              <div className={cn(
                "p-4 border-2 rounded-lg text-center",
                settings.theme === 'light' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              )}>
                <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <p className="font-medium">Light Mode</p>
              </div>
            </label>
            
            <label className="cursor-pointer flex-1">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={settings.theme === 'dark'}
                onChange={(e) => setSettings(prev => ({ ...prev, theme: 'dark' }))}
                className="sr-only"
              />
              <div className={cn(
                "p-4 border-2 rounded-lg text-center",
                settings.theme === 'dark' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              )}>
                <Moon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="font-medium">Dark Mode</p>
              </div>
            </label>
          </div>
        </div>
        
        {/* Touch Screen Mode */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Touch Screen Mode</h2>
          </div>
          
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Enable Touch Screen Mode</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Optimized for wall-mounted displays and tablets</p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.touchScreenMode}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  touchScreenMode: e.target.checked 
                }))}
                className="sr-only"
              />
              <div className={cn(
                "w-14 h-8 rounded-full transition-colors",
                settings.touchScreenMode ? 'bg-blue-600' : 'bg-gray-300'
              )}>
                <div className={cn(
                  "w-6 h-6 bg-white rounded-full shadow-md transform transition-transform mt-1",
                  settings.touchScreenMode ? 'translate-x-7 ml-1' : 'translate-x-1'
                )} />
              </div>
            </div>
          </label>
          
          {settings.touchScreenMode && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Auto-timeout (minutes)</span>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.autoTimeout}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    autoTimeout: parseInt(e.target.value) || 5 
                  }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </label>
            </div>
          )}
        </div>
        
        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Daily Reminders</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get reminded to complete habits</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.dailyReminders}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  notifications: {
                    ...prev.notifications,
                    dailyReminders: e.target.checked
                  }
                }))}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>
            
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Weekly Reports</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive weekly progress summaries</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.weeklyReports}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  notifications: {
                    ...prev.notifications,
                    weeklyReports: e.target.checked
                  }
                }))}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>
            
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Reward Alerts</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Notify when rewards are earned</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.rewardAlerts}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  notifications: {
                    ...prev.notifications,
                    rewardAlerts: e.target.checked
                  }
                }))}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}