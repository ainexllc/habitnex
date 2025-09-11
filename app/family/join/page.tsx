'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFamily } from '@/contexts/FamilyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { JoinFamilyRequest } from '@/types/family';
import { Users, ArrowLeft, UserPlus, Palette } from 'lucide-react';
import { familyBackgrounds, familyText, familyIcons, familyAlerts, familyAnimations, getFamilyInput } from '@/lib/familyThemes';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const memberColors = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

const memberAvatars = [
  '👨‍💼', '👩‍💼', '👨', '👩', '👶', '🧒', '👦', '👧', 
  '🤵', '👰', '👴', '👵', '🧔', '👱‍♂️', '👱‍♀️', '👨‍🦰'
];

const roleOptions = [
  { value: 'parent', label: 'Parent', description: 'Can manage family settings and rewards' },
  { value: 'adult', label: 'Adult', description: 'Full access to family features' },
  { value: 'teen', label: 'Teenager', description: 'Can create habits and earn rewards' },
  { value: 'child', label: 'Child', description: 'Can complete habits and earn rewards' }
];

export default function JoinFamilyPage() {
  const router = useRouter();
  const { joinExistingFamily, loading, error, clearError } = useFamily();
  
  const [formData, setFormData] = useState({
    inviteCode: '',
    name: '',
    displayName: '',
    avatar: '👤',
    color: '#3B82F6',
    role: 'child' as 'parent' | 'child' | 'teen' | 'adult',
    birthYear: new Date().getFullYear() - 10
  });
  
  const [step, setStep] = useState<'code' | 'profile' | 'preview'>('code');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.inviteCode.trim() || !formData.name.trim() || !formData.displayName.trim()) {
      return;
    }
    
    try {
      clearError();
      
      const request: JoinFamilyRequest = {
        inviteCode: formData.inviteCode.trim().toUpperCase(),
        memberInfo: {
          name: formData.name.trim(),
          displayName: formData.displayName.trim(),
          avatar: formData.avatar,
          color: formData.color,
          role: formData.role,
          birthYear: formData.birthYear > 1950 ? formData.birthYear : undefined
        }
      };
      
      await joinExistingFamily(request);
      router.push('/dashboard');
      
    } catch (err) {
      console.error('Failed to join family:', err);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className={cn(familyBackgrounds.page.normal, "py-8 px-4")}>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className={cn(
                "w-20 h-20 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center shadow-lg dark:shadow-green-500/20",
                familyAnimations.hover
              )}>
                <UserPlus className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className={cn(
              familyText.primary,
              "text-3xl font-bold mb-2"
            )}>
              Join a Family
            </h1>
            <p className={familyText.secondary}>
              Enter your family's invite code to get started
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
                step === 'code' ? 'bg-green-600 text-white' : 
                step === 'profile' || step === 'preview' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className="w-8 h-1 bg-gray-200">
                <div className={`h-full bg-green-600 transition-all duration-300 ${
                  step === 'profile' || step === 'preview' ? 'w-full' : 'w-0'
                }`} />
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'profile' ? 'bg-green-600 text-white' : 
                step === 'preview' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className="w-8 h-1 bg-gray-200">
                <div className={`h-full bg-green-600 transition-all duration-300 ${
                  step === 'preview' ? 'w-full' : 'w-0'
                }`} />
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'preview' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <Card className="shadow-xl">
              {/* Invite Code Step */}
              {step === 'code' && (
                <>
                  <CardHeader>
                    <CardTitle>Enter Invite Code</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Family Invite Code *
                      </label>
                      <Input
                        type="text"
                        placeholder="ABC123"
                        value={formData.inviteCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, inviteCode: e.target.value.toUpperCase() }))}
                        className="text-lg py-3 text-center font-mono tracking-widest"
                        maxLength={6}
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Ask a family member for the 6-digit code
                      </p>
                    </div>
                    
                    <div className="pt-6">
                      <Button 
                        type="button" 
                        onClick={() => setStep('profile')}
                        className="w-full"
                        size="lg"
                        disabled={!formData.inviteCode.trim() || formData.inviteCode.length < 6}
                      >
                        Next: Create Profile
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
              
              {/* Profile Step */}
              {step === 'profile' && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Create Your Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <Input
                          type="text"
                          placeholder="John Smith"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Display Name *
                        </label>
                        <Input
                          type="text"
                          placeholder="John"
                          value={formData.displayName}
                          onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This appears on the dashboard
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role in Family *
                      </label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {roleOptions.map((option) => (
                          <label key={option.value} className="cursor-pointer">
                            <input
                              type="radio"
                              name="role"
                              value={option.value}
                              checked={formData.role === option.value}
                              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                              className="sr-only"
                            />
                            <div className={`p-3 border-2 rounded-lg ${
                              formData.role === option.value 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}>
                              <div className="font-medium text-gray-900">{option.label}</div>
                              <div className="text-sm text-gray-500">{option.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    {(formData.role === 'child' || formData.role === 'teen') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Birth Year (Optional)
                        </label>
                        <Input
                          type="number"
                          min="1950"
                          max={new Date().getFullYear()}
                          value={formData.birthYear}
                          onChange={(e) => setFormData(prev => ({ ...prev, birthYear: parseInt(e.target.value) || new Date().getFullYear() - 10 }))}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Helps with age-appropriate habits and rewards
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Choose Avatar
                      </label>
                      <div className="grid grid-cols-8 gap-2">
                        {memberAvatars.map((avatar) => (
                          <button
                            key={avatar}
                            type="button"
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg border-2 ${
                              formData.avatar === avatar
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setFormData(prev => ({ ...prev, avatar }))}
                          >
                            {avatar}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Choose Color
                      </label>
                      <div className="flex items-center space-x-2 mb-3">
                        <Palette className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">This color will represent you on the dashboard</span>
                      </div>
                      <div className="grid grid-cols-8 gap-2">
                        {memberColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 ${
                              formData.color === color
                                ? 'border-gray-800 scale-110'
                                : 'border-gray-300 hover:scale-105'
                            } transition-transform`}
                            style={{ backgroundColor: color }}
                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-4 pt-6">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setStep('code')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setStep('preview')}
                        className="flex-1"
                        disabled={!formData.name.trim() || !formData.displayName.trim()}
                      >
                        Review & Join
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
              
              {/* Preview Step */}
              {step === 'preview' && (
                <>
                  <CardHeader>
                    <CardTitle>Review Your Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white font-bold"
                          style={{ backgroundColor: formData.color }}
                        >
                          {formData.avatar}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{formData.displayName}</h3>
                          <p className="text-gray-600">{formData.name}</p>
                          <p className="text-sm text-gray-500 capitalize">{formData.role}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Invite Code:</span>
                          <span className="font-mono">{formData.inviteCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Role:</span>
                          <span className="capitalize">{formData.role}</span>
                        </div>
                        {formData.birthYear && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Birth Year:</span>
                            <span>{formData.birthYear}</span>
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
                        onClick={() => setStep('profile')}
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
                        {loading ? 'Joining...' : 'Join Family'}
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </form>
          
          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Don't have a family invite code?
            </p>
            <Link href="/family/create">
              <Button variant="outline">
                Create New Family
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}