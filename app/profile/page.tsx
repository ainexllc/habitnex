'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { User, Moon, Sun, Bell, Globe } from 'lucide-react';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const { mode, setMode, preset, setPreset, availableThemes } = useTheme();
  const [loading] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface-light dark:bg-background-dark">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Profile Settings
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Manage your account and preferences
            </p>
          </div>

          <div className="grid gap-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark">
                      {userProfile?.displayName || 'User'}
                    </h3>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">
                      {user?.email}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Display Name"
                    value={userProfile?.displayName || ''}
                    placeholder="Enter your name"
                  />
                  <Input
                    label="Email"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
                
                <Button loading={loading}>
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {mode === 'light' ? (
                    <Sun className="w-5 h-5 mr-2" />
                  ) : (
                    <Moon className="w-5 h-5 mr-2" />
                  )}
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Theme
                    </label>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant={mode === 'light' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setMode('light')}
                      >
                        <Sun className="w-4 h-4 mr-1" />
                        Light
                      </Button>
                      <Button
                        variant={mode === 'dark' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setMode('dark')}
                      >
                        <Moon className="w-4 h-4 mr-1" />
                        Dark
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Theme Pack
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {availableThemes?.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setPreset(theme.id)}
                          className={`relative overflow-hidden rounded-xl border-2 transition-all text-left ${
                            preset === theme.id
                              ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                          }`}
                        >
                          <div
                            className="h-20 w-full rounded-lg m-3"
                            style={{ backgroundImage: theme.previewGradient }}
                          />
                          <div className="px-4 pb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                                {theme.name}
                              </span>
                              {preset === theme.id && (
                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                              {theme.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                    Week Starts On
                  </label>
                  <select className="input w-full max-w-xs">
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                      Notifications
                    </h4>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      Receive reminders about your habits
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Bell className="w-4 h-4 mr-2 text-text-muted-light dark:text-text-muted-dark" />
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-error-600 dark:text-error-400">
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="text-error-600 border-error-600 hover:bg-error-50 dark:hover:bg-error-900/20">
                    Export Data
                  </Button>
                  <Button variant="outline" className="text-error-600 border-error-600 hover:bg-error-50 dark:hover:bg-error-900/20">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
