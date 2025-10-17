'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { LucideIcon } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import { Home, Gift, BarChart3 } from 'lucide-react';
import { FamilyMembersTab } from '@/components/family/tabs/FamilyMembersTab';
import { FamilyHabitsTab } from '@/components/family/tabs/FamilyHabitsTab';
import { FamilyChallengesTab } from '@/components/family/tabs/FamilyChallengesTab';
import { FamilyRewardsTab } from '@/components/family/tabs/FamilyRewardsTab';
import { FamilyAnalyticsTab } from '@/components/family/tabs/FamilyAnalyticsTab';
import { FamilyOverviewTab } from '@/components/family/tabs/FamilyOverviewTab';
import { FamilySettingsTab } from '@/components/family/tabs/FamilySettingsTab';
import { MemberModal } from '@/components/family/MemberModal';
import { CreateFamilyHabitModal } from '@/components/family/CreateFamilyHabitModal';
import { CreateFamilyChallengeModal } from '@/components/family/CreateFamilyChallengeModal';
import { ModernFamilyHeader } from '@/components/family/ModernFamilyHeader';
import { FeedbackSystem } from '@/components/feedback';
import type { FamilyTabId } from '@/types/family';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Shield,
  Target,
  Zap,
  Users,
  Trophy,
  Sparkles,
  User,
} from 'lucide-react';

const featureHighlights: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}> = [
  {
    title: 'Habit Playbooks',
    description: 'Start fast with guided routines for wellness, productivity, and family life.',
    icon: Target,
    accent: 'from-[#fe6e00] to-[#ff7f24]',
  },
  {
    title: 'Collaborative Dashboards',
    description: 'Invite family, compare streaks, and celebrate wins together with shared views.',
    icon: Users,
    accent: 'from-[#1f2937] to-[#0b1220]',
  },
  {
    title: 'AI-Powered Nudges',
    description: 'Receive actionable recommendations that adapt as your habits improve.',
    icon: Zap,
    accent: 'from-[#ff7f24] to-[#fe6e00]',
  },
];

const howItWorks: Array<{ step: string; title: string; description: string }> = [
  {
    step: '1',
    title: 'Create Your Space',
    description: 'Sign up in seconds and tailor your dashboard to personal or family goals.',
  },
  {
    step: '2',
    title: 'Add Habits & Automations',
    description: 'Choose templates or build your own routines with reminders and AI insights.',
  },
  {
    step: '3',
    title: 'Track, Learn, Celebrate',
    description: 'Review streaks, monitor mood, and unlock celebrations as milestones stack up.',
  },
];

const testimonials = [
  {
    quote:
      'HabitNex keeps our family aligned without nagging. Shared streaks make accountability fun rather than stressful.',
    name: 'The Martinez Family',
    role: 'Weekend reset champions',
  },
  {
    quote:
      'I finally understand my habit patterns. The analytics surface exactly when I slip so I can course-correct fast.',
    name: 'Riya Singh',
    role: 'Product designer & morning routine enthusiast',
  },
];

const quickMetrics: Array<{
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
}> = [
  {
    label: 'Families collaborating',
    value: '12k+',
    caption: 'Share goals in private HabitNex spaces',
    icon: Users,
  },
  {
    label: 'Average streak sustained',
    value: '28 days',
    caption: 'Consistency unlocked with smart reminders',
    icon: Trophy,
  },
  {
    label: 'Habit recommendations delivered',
    value: '2.3M',
    caption: 'Real-time coaching tailored to each check-in',
    icon: Zap,
  },
];

type FamilyTab = FamilyTabId;

const FAMILY_TABS = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'habits', label: 'Habits', icon: Target },
  { id: 'challenges', label: 'Challenges', icon: Trophy },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
] as const;

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpForm = z.infer<typeof signUpSchema>;
type AuthMode = 'signin' | 'signup';

// Authenticated Dashboard Component
function FamilyDashboardContent() {
  const { currentFamily, currentMember, loading, isParent } = useFamily();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<FamilyTab>('overview');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreateHabitModal, setShowCreateHabitModal] = useState(false);
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);

  // Format today's date for the header
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Handle URL tab parameter
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as FamilyTab;
    if (tabFromUrl && FAMILY_TABS.some(tab => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-600 dark:text-blue-400 font-medium">Loading family dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentFamily || !currentMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Family Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">You need to create or join a family first.</p>
          <div className="space-x-4">
            <Link href="/family/create">
              <Button>Create Family</Button>
            </Link>
            <Link href="/family/join">
              <Button variant="outline">Join Family</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <FamilyOverviewTab />;
      case 'members':
        return <FamilyMembersTab onAddMember={() => setShowAddMemberModal(true)} />;
      case 'habits':
        return <FamilyHabitsTab onCreateHabit={() => setShowCreateHabitModal(true)} />;
      case 'challenges':
        return <FamilyChallengesTab onCreateChallenge={() => setShowCreateChallengeModal(true)} />;
      case 'rewards':
        return <FamilyRewardsTab />;
      case 'analytics':
        return <FamilyAnalyticsTab />;
      case 'settings':
        return <FamilySettingsTab />;
      default:
        return <FamilyOverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Modern Family Header - Full Width */}
      <ModernFamilyHeader
        familyName={currentFamily.name}
        date={today}
        isParent={isParent}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content - Full Width */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>

      {/* Modals */}
      <MemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
      />

      <CreateFamilyHabitModal
        isOpen={showCreateHabitModal}
        onClose={() => setShowCreateHabitModal(false)}
      />

      <CreateFamilyChallengeModal
        isOpen={showCreateChallengeModal}
        onClose={() => setShowCreateChallengeModal(false)}
      />

      {/* Feedback System */}
      <FeedbackSystem />
    </div>
  );
}

// Unauthenticated Public Homepage Component
function PublicHomePage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    signIn,
    signUp,
    signInWithGoogle,
    authError,
    clearAuthError,
  } = useAuth();

  const { preset, setPreset } = useTheme();

  useEffect(() => {
    if (preset !== 'ainex') {
      setPreset('ainex');
    }
  }, [preset, setPreset]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpForm>({
    resolver: zodResolver(mode === 'signin' ? loginSchema : signUpSchema),
  });

  // Reset form when mode changes
  useEffect(() => {
    reset();
    setError('');
    clearAuthError();
  }, [mode, reset, clearAuthError]);

  const onSubmit = async (data: SignUpForm) => {
    try {
      setLoading(true);
      setError('');

      if (mode === 'signin') {
        await signIn(data.email, data.password);
      } else {
        await signUp(data.email, data.password, data.displayName);
      }

      // No redirect needed - parent component will handle showing dashboard
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || (mode === 'signin' ? 'Failed to sign in' : 'Failed to create account'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const usePopup = isLocalhost; // Use popup on localhost, redirect on production

    try {
      setLoading(true);
      setError('');
      clearAuthError();

      await signInWithGoogle(usePopup);
      // No redirect needed - parent component will handle showing dashboard
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle_at_top_left,_rgba(255,120,30,0.28),_rgba(0,0,0,0))] blur-3xl" />
        <div className="absolute bottom-[-180px] left-[-120px] w-[440px] h-[440px] rounded-full bg-[radial-gradient(circle_at_bottom_left,_rgba(35,35,35,0.45),_rgba(0,0,0,0))] blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,_rgba(255,125,40,0.18),_rgba(0,0,0,0))] blur-[140px]" />
      </div>

      <header className="sticky top-0 z-50 w-full py-4 px-4 sm:px-6 lg:px-8 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Logo />
          </div>

          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a href="#overview" className="text-sm font-medium text-gray-300 hover:text-orange-400 transition-colors">
              Overview
            </a>
            <a href="#features" className="text-sm font-medium text-gray-300 hover:text-orange-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-300 hover:text-orange-400 transition-colors">
              How It Works
            </a>
            <button
              onClick={() => {
                setMode('signup');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-2 rounded-full bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 focus:ring-offset-gray-950"
            >
              Get Started
            </button>
          </nav>
        </div>
      </header>

      <main id="overview" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          <div className="flex-1 max-w-xl lg:pr-8">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fe6e00]/10 ring-1 ring-[#fe6e00]/20">
                <div className="w-2 h-2 rounded-full bg-[#fe6e00] animate-pulse" />
                <span className="text-xs font-semibold tracking-wide text-[#fe6e00]">
                  TRUSTED BY 10,000+ USERS
                </span>
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold">
                  <span className="bg-gradient-to-br from-white to-slate-200 bg-clip-text text-transparent">
                    Transform Your
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-[#fe6e00] via-[#ff7f24] to-[#ffb469] bg-clip-text text-transparent">
                    Daily Habits
                  </span>
                </h1>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Welcome to HabitNex. Track progress, build streaks, and achieve your goals with AI-powered insights and
                  effortless collaboration.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 py-6 border-y border-white/10">
                <div className="text-center space-y-1">
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">Report real progress</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-bold text-white">30+</div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">Habit templates included</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">AI coaching available</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#fe6e00] to-[#ff9333] rounded-lg flex items-center justify-center shadow-md shadow-[#fe6e00]/30 group-hover:scale-110 transition-transform duration-200">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Smart Habit Tracking</h3>
                    <p className="text-sm text-slate-400">AI-powered recommendations and insights</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md shadow-black/30 bg-gradient-to-br from-[#1f2937] via-[#111a2d] to-black group-hover:scale-110 transition-transform duration-200">
                    <TrendingUp className="w-5 h-5 text-[#fe6e00]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Visual Progress Analytics</h3>
                    <p className="text-sm text-slate-400">Beautiful charts and streak tracking</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#ff7f24] to-[#fe6e00] rounded-lg flex items-center justify-center shadow-md shadow-[#fe6e00]/25 group-hover:scale-110 transition-transform duration-200">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Privacy First</h3>
                    <p className="text-sm text-slate-400">Your data is encrypted and secure</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-[#121b2f] to-[#0b1324] rounded-xl border border-white/10 shadow-lg shadow-black/20">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#fe6e00] to-[#ff9333] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">JD</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-300 italic">
                      &quot;HabitNex transformed my daily routine. The AI suggestions are spot-on, and I&apos;ve maintained my longest
                      streak ever!&quot;
                    </p>
                    <div className="mt-2">
                      <div className="text-xs font-semibold text-white">Jane Doe</div>
                      <div className="text-xs text-slate-400">120-day streak holder</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-full max-w-md">
            <div className="rounded-[32px] border border-[#1f1f1f] bg-[radial-gradient(circle_at_top,_#121212,_#050505)] px-8 py-9 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
              {/* Mode Toggle */}
              <div className="mb-6 flex gap-2 p-1 bg-[#0a0a0c] rounded-full border border-[#1f1f1f]">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className={clsx(
                    'flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-200',
                    mode === 'signin'
                      ? 'bg-gradient-to-r from-[#ff7a1c] to-[#ff5c00] text-black shadow-lg'
                      : 'text-[#6e6e78] hover:text-white'
                  )}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={clsx(
                    'flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-200',
                    mode === 'signup'
                      ? 'bg-gradient-to-r from-[#ff7a1c] to-[#ff5c00] text-black shadow-lg'
                      : 'text-[#6e6e78] hover:text-white'
                  )}
                >
                  Sign Up
                </button>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between text-xs tracking-[0.4em] text-[#ff7a1c] uppercase">
                  <span>{mode === 'signin' ? 'Access' : 'Create'}</span>
                  <Sparkles className="h-4 w-4 text-[#ff7a1c]" />
                </div>
                <h2 className="mt-4 text-3xl font-semibold text-white">
                  {mode === 'signin' ? 'Get into your workspace' : 'Start your journey'}
                </h2>
                <p className="mt-3 text-sm text-[#a6a6a6]">
                  {mode === 'signin'
                    ? 'Enter your credentials to unlock HabitNex.'
                    : 'Create an account to begin tracking habits.'}
                </p>
              </div>

              <div className="space-y-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Display Name Field (Signup Only) */}
                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium uppercase tracking-[0.28em] text-[#ff7a1c]">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#6e6e78]">
                          <User className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="John Doe"
                          className={clsx(
                            'w-full rounded-full border border-[#222229] bg-[#101014] px-11 py-3.5 text-sm text-white shadow-[0_1px_0_rgba(255,255,255,0.05)] outline-none transition-colors duration-200',
                            errors.displayName
                              ? 'border-[#ff4d4f] focus:border-[#ff4d4f] focus:ring-2 focus:ring-[#ff4d4f]/40'
                              : 'focus:border-[#ff7a1c] focus:ring-2 focus:ring-[#ff7a1c]/40'
                          )}
                          {...register('displayName')}
                        />
                      </div>
                      {errors.displayName && (
                        <p className="text-sm text-red-400 flex items-center gap-1 mt-1">
                          <span className="text-xs">⚠</span> {errors.displayName.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium uppercase tracking-[0.28em] text-[#ff7a1c]">
                      Email
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#6e6e78]">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        placeholder="dino@example.com"
                        className={clsx(
                          'w-full rounded-full border border-[#222229] bg-[#101014] px-11 py-3.5 text-sm text-white shadow-[0_1px_0_rgba(255,255,255,0.05)] outline-none transition-colors duration-200',
                          errors.email
                            ? 'border-[#ff4d4f] focus:border-[#ff4d4f] focus:ring-2 focus:ring-[#ff4d4f]/40'
                            : 'focus:border-[#ff7a1c] focus:ring-2 focus:ring-[#ff7a1c]/40'
                        )}
                        {...register('email')}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-400 flex items-center gap-1 mt-1">
                        <span className="text-xs">⚠</span> {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium uppercase tracking-[0.28em] text-[#ff7a1c]">
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-medium text-[#ff7a1c] hover:text-[#ff9243] transition-colors duration-200"
                      >
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#6e6e78]">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={clsx(
                          'w-full rounded-full border border-[#222229] bg-[#101014] px-11 py-3.5 text-sm text-white shadow-[0_1px_0_rgba(255,255,255,0.05)] outline-none transition-colors duration-200',
                          errors.password
                            ? 'border-[#ff4d4f] focus:border-[#ff4d4f] focus:ring-2 focus:ring-[#ff4d4f]/40'
                            : 'focus:border-[#ff7a1c] focus:ring-2 focus:ring-[#ff7a1c]/40'
                        )}
                        {...register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-4 flex items-center text-[#6e6e78] transition-colors duration-200 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-400 flex items-center gap-1 mt-1">
                        <span className="text-xs">⚠</span> {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field (Signup Only) */}
                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium uppercase tracking-[0.28em] text-[#ff7a1c]">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#6e6e78]">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className={clsx(
                            'w-full rounded-full border border-[#222229] bg-[#101014] px-11 py-3.5 text-sm text-white shadow-[0_1px_0_rgba(255,255,255,0.05)] outline-none transition-colors duration-200',
                            errors.confirmPassword
                              ? 'border-[#ff4d4f] focus:border-[#ff4d4f] focus:ring-2 focus:ring-[#ff4d4f]/40'
                              : 'focus:border-[#ff7a1c] focus:ring-2 focus:ring-[#ff7a1c]/40'
                          )}
                          {...register('confirmPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-4 flex items-center text-[#6e6e78] transition-colors duration-200 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-400 flex items-center gap-1 mt-1">
                          <span className="text-xs">⚠</span> {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  )}

                  {mode === 'signin' && (
                    <div className="flex items-center justify-between text-xs text-[#6e6e78]">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-[#2a2a2f] bg-[#121217] text-[#ff7a1c] focus:ring-2 focus:ring-[#ff7a1c]/30"
                        />
                        <span>Remember me</span>
                      </label>
                      <span className="text-[#6e6e78]">Secured with 256-bit encryption</span>
                    </div>
                  )}

                  {(error || authError) && (
                    <div className="rounded-full border border-red-500/40 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
                      <div className="flex items-center gap-2">
                        <span>⚠</span>
                        <span>{error || authError}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-gradient-to-r from-[#ff7a1c] to-[#ff5c00] py-3.5 text-sm font-semibold text-black transition-transform duration-200 hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a1c]/60 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{mode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>{mode === 'signin' ? 'Sign in' : 'Create account'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                </form>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#1f1f23]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-[0.35em] text-[#5c5c66]">
                    <span className="bg-transparent px-3">or</span>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-full border border-[#1f1f24] bg-[#0b0b0f] px-6 py-3 text-sm font-medium text-[#d0d0d0] shadow-[0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:border-[#ff7a1c]/40 hover:text-white disabled:opacity-60"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-4">Teams and creators building with HabitNex</p>
          <div className="flex items-center justify-center gap-8 opacity-60 grayscale">
            <div className="text-2xl font-semibold text-slate-500">FocusLab</div>
            <div className="text-2xl font-semibold text-slate-500">Nimbus</div>
            <div className="text-2xl font-semibold text-slate-500">Oak & Co</div>
            <div className="text-2xl font-semibold text-slate-500">BrightPath</div>
          </div>
        </div>
      </main>

      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white">Why teams choose HabitNex</h2>
            <p className="mt-4 text-slate-300">
              Blend guidance and accountability with flexible modules that grow with your habits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featureHighlights.map(({ title, description, icon: Icon, accent }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-[#121b2f]/80 shadow-lg shadow-black/30 p-8 transition-transform duration-200 hover:-translate-y-1 hover:shadow-[#fe6e00]/30"
              >
                <div className={`w-12 h-12 mb-6 bg-gradient-to-br ${accent} rounded-xl flex items-center justify-center shadow-md shadow-black/30 ring-1 ring-white/10`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 bg-[#05070d]/95">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white">Start in minutes</h2>
            <p className="mt-3 text-slate-300">
              HabitNex guides you from your first habit to long-term streaks with a simple onboarding flow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map(({ step, title, description }) => (
              <div
                key={step}
                className="relative p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-[#111a2d] to-[#0b1220] shadow-lg shadow-black/30"
              >
                <div className="absolute -top-4 left-8 w-10 h-10 bg-gradient-to-br from-[#fe6e00] to-[#ff7f24] text-white font-semibold rounded-xl flex items-center justify-center shadow-lg shadow-[#fe6e00]/40">
                  {step}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 sm:grid-cols-3">
            {quickMetrics.map(({ label, value, caption, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-[#111a2d]/80 backdrop-blur p-6 shadow-lg shadow-black/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#fe6e00] to-[#ff7f24] flex items-center justify-center shadow-md shadow-[#fe6e00]/30">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{value}</div>
                    <div className="text-sm text-slate-400">{label}</div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-300">{caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-16 bg-gradient-to-br from-[#131f33] via-[#0b1220] to-[#05070d]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center text-white">
            <h2 className="text-3xl font-bold">Real stories from HabitNex builders</h2>
            <p className="mt-3 text-white/80">
              From solo streaks to family accountability squads, HabitNex adapts to every routine.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map(({ quote, name, role }) => (
              <div key={name} className="rounded-2xl border border-white/10 bg-[#0b1220]/80 p-8 text-white shadow-xl shadow-black/40">
                <p className="text-lg leading-relaxed mb-4 text-slate-100">“{quote}”</p>
                <div className="space-y-1">
                  <div className="font-semibold text-[#fe6e00]">{name}</div>
                  <div className="text-sm text-slate-300">{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 bg-[#010307] border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-slate-500 text-sm">
            <div>
              <Logo textSize="sm" tone="light" />
              <p className="mt-2 text-xs text-slate-500">
                © {new Date().getFullYear()} HabitNex. Build healthier routines—together.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-[#fe6e00] transition-colors duration-200">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-[#fe6e00] transition-colors duration-200">
                Terms
              </Link>
              <a
                href="mailto:support@habitnex.app"
                className="hover:text-[#fe6e00] transition-colors duration-200"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Main component that conditionally renders Dashboard or Public Homepage
function HomePageContent() {
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = !authLoading && Boolean(user);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-orange-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Show dashboard if authenticated, public homepage if not
  return isAuthenticated ? <FamilyDashboardContent /> : <PublicHomePage />;
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-orange-400 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
