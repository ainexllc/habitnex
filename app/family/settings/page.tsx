'use client';

import { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { FeedbackDisplay } from '@/components/feedback/FeedbackDisplay';
import { ArrowLeft, Save, Users, Moon, Sun, Bell, Monitor, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { familyBackgrounds } from '@/lib/familyThemes';


export default function FamilySettingsPage() {
  const { currentFamily, currentMember, isParent, loading, updateFamilySettings, updateFamilyName } = useFamily();
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [familyName, setFamilyName] = useState('');
  
  const [settings, setSettings] = useState({
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
    if (currentFamily) {
      setFamilyName(currentFamily.name || '');
      if (currentFamily.settings) {
        setSettings({
          touchScreenMode: currentFamily.settings.touchScreenMode || false,
          autoTimeout: currentFamily.settings.autoTimeout || 5,
          notifications: currentFamily.settings.notifications || {
            dailyReminders: true,
            weeklyReports: true,
            rewardAlerts: true
          }
        });
      }
    }
  }, [currentFamily]);
  
  const handleSaveSettings = async () => {
    setSaving(true);
    setSuccessMessage('');
    
    try {
      // Update family name if changed
      if (familyName && familyName !== currentFamily?.name) {
        await updateFamilyName(familyName);
      }
      
      // Update settings
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
          <Link href="/dashboard/family">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className={familyBackgrounds.page.normal}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/family">
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
        
        {/* Family Feedback Display */}
        <FeedbackDisplay />
        
        {/* Family Name Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Family Name</h2>
          </div>
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
              className="text-gray-600 dark:text-gray-300"
              title="Edit family name"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
          {currentFamily?.isPersonal && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              This is your personal dashboard name
            </p>
          )}
        </div>
        
        
        {/* Theme Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            {theme === 'light' ? 
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
                checked={theme === 'light'}
                onChange={() => setTheme('light')}
                className="sr-only"
              />
              <div className={cn(
                "p-4 border-2 rounded-lg text-center",
                theme === 'light' 
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
                checked={theme === 'dark'}
                onChange={() => setTheme('dark')}
                className="sr-only"
              />
              <div className={cn(
                "p-4 border-2 rounded-lg text-center",
                theme === 'dark' 
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
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-timeout (minutes)</span>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.autoTimeout}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    autoTimeout: parseInt(e.target.value) || 5 
                  }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
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