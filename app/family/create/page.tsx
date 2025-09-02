'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFamily } from '@/contexts/FamilyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CreateFamilyRequest } from '@/types/family';
import { Home, ArrowLeft, Users, Settings } from 'lucide-react';
import { theme } from '@/lib/theme';
import { familyText, familyAnimations, familyIcons } from '@/lib/familyThemes';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function CreateFamilyPage() {
  const router = useRouter();
  const { createNewFamily, loading, error, clearError } = useFamily();
  
  const [formData, setFormData] = useState({
    familyName: '',
    touchScreenMode: false,
    voiceFeedback: false,
    autoTimeout: 5
  });
  const [step, setStep] = useState<'basic' | 'settings' | 'preview'>('basic');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.familyName.trim()) {
      return;
    }
    
    try {
      clearError();
      
      const request: CreateFamilyRequest = {
        name: formData.familyName.trim(),
        settings: {
          touchScreenMode: formData.touchScreenMode,
          voiceFeedback: formData.voiceFeedback,
          autoTimeout: formData.autoTimeout,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          weekStartsOn: 1, // Monday
          theme: 'light',
          notifications: {
            dailyReminders: true,
            weeklyReports: true,
            rewardAlerts: true
          },
          display: {
            showAllMembers: true,
            compactMode: false,
            animationSpeed: 'normal'
          }
        }
      };
      
      await createNewFamily(request);
      router.push('/dashboard/family');
      
    } catch (err) {
      // Failed to create family - handle silently
    }
  };
  
  return (
    <ProtectedRoute>
      <div className={cn(theme.gradients.pageBackground, "py-8 px-4")}>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center shadow-lg",
                theme.components.button.primary,
                theme.animation.transition,
                "hover:scale-105"
              )}>
                <Home className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className={cn(
              familyText.primary,
              "text-3xl font-bold mb-2"
            )}>
              Create Your Family
            </h1>
            <p className={familyText.secondary}>
              Set up your family habit tracking system
            </p>
          </div>
          
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" className={cn(
                "flex items-center",
                familyAnimations.hover
              )}>
                <ArrowLeft className={cn("w-4 h-4 mr-2", familyIcons.primary)} />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'basic' ? 'bg-blue-600 text-white' : 
                step === 'settings' || step === 'preview' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className="w-8 h-1 bg-gray-200">
                <div className={`h-full bg-blue-600 transition-all duration-300 ${
                  step === 'settings' || step === 'preview' ? 'w-full' : 'w-0'
                }`} />
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'settings' ? 'bg-blue-600 text-white' : 
                step === 'preview' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className="w-8 h-1 bg-gray-200">
                <div className={`h-full bg-blue-600 transition-all duration-300 ${
                  step === 'preview' ? 'w-full' : 'w-0'
                }`} />
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <Card className="shadow-xl">
              {/* Basic Info Step */}
              {step === 'basic' && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Family Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Family Name *
                      </label>
                      <Input
                        type="text"
                        placeholder="The Smith Family"
                        value={formData.familyName}
                        onChange={(e) => setFormData(prev => ({ ...prev, familyName: e.target.value }))}
                        className="text-lg py-3"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        This will be displayed on your family dashboard
                      </p>
                    </div>
                    
                    <div className="pt-6">
                      <Button 
                        type="button" 
                        onClick={() => setStep('settings')}
                        className="w-full"
                        size="lg"
                        disabled={!formData.familyName.trim()}
                      >
                        Next: Display Settings
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
              
              {/* Settings Step */}
              {step === 'settings' && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Display Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.touchScreenMode}
                          onChange={(e) => setFormData(prev => ({ ...prev, touchScreenMode: e.target.checked }))}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Touch Screen Mode</div>
                          <div className="text-sm text-gray-500">
                            Optimize for wall-mounted displays and tablets
                          </div>
                        </div>
                      </label>
                    </div>
                    
                    <div>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.voiceFeedback}
                          onChange={(e) => setFormData(prev => ({ ...prev, voiceFeedback: e.target.checked }))}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Voice Feedback</div>
                          <div className="text-sm text-gray-500">
                            Play sounds when habits are completed
                          </div>
                        </div>
                      </label>
                    </div>
                    
                    {formData.touchScreenMode && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Auto-timeout (minutes)
                        </label>
                        <select
                          value={formData.autoTimeout}
                          onChange={(e) => setFormData(prev => ({ ...prev, autoTimeout: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={2}>2 minutes</option>
                          <option value={5}>5 minutes</option>
                          <option value={10}>10 minutes</option>
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1">
                          Return to main view after inactivity
                        </p>
                      </div>
                    )}
                    
                    <div className="flex space-x-4 pt-6">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setStep('basic')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setStep('preview')}
                        className="flex-1"
                      >
                        Review & Create
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
              
              {/* Preview Step */}
              {step === 'preview' && (
                <>
                  <CardHeader>
                    <CardTitle>Review Your Family</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-4">Family Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Family Name:</span>
                          <span className="font-medium">{formData.familyName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Touch Screen Mode:</span>
                          <span className="font-medium">{formData.touchScreenMode ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Voice Feedback:</span>
                          <span className="font-medium">{formData.voiceFeedback ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        {formData.touchScreenMode && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Auto-timeout:</span>
                            <span className="font-medium">{formData.autoTimeout} minutes</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-red-800">{error}</div>
                      </div>
                    )}
                    
                    <div className="flex space-x-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setStep('settings')}
                        className="flex-1"
                        disabled={loading}
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit"
                        className="flex-1"
                        size="lg"
                        disabled={loading}
                      >
                        {loading ? 'Creating...' : 'Create Family'}
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </form>
          
          {/* Help Text */}
          <div className="mt-8 text-center text-gray-600">
            <p className="text-sm">
              After creating your family, you'll get an invite code to share with family members
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}