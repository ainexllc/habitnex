'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Heart, Users, Mail, Lock, Eye, EyeOff, User, ArrowRight, Rocket, Trophy, Star, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

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

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user, signUp, signInWithGoogle, authError, clearAuthError, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpForm) => {
    try {
      setLoading(true);
      setError('');
      await signUp(data.email, data.password, data.displayName);
      router.push('/');
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Auto-detect best method based on environment
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const usePopup = !isLocalhost;
    try {
      setLoading(true);
      setError('');
      clearAuthError();
      
      const result = await signInWithGoogle(usePopup);
      
      // If using popup and we get a result immediately, navigate
      if (result) {
        router.push('/');
      } else if (!usePopup) {
        // If using redirect, the page will reload after auth
        // No need to navigate here
      }
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-gray-900 dark:via-emerald-950 dark:to-teal-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-teal-400 to-green-600 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo textSize="md" />

            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                Already have an account?
              </Link>
              <Link 
                href="/login" 
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                Sign In
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          {/* Left Side - Hero Content */}
          <div className="flex-1 max-w-xl lg:pr-8">
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">LIMITED TIME: 30-DAY FREE TRIAL</span>
              </div>

              {/* Hero Text */}
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold">
                  <span className="bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Start Your
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    Transformation
                  </span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Join thousands who've transformed their lives with smart habit tracking, AI-powered insights, and a supportive community.
                </p>
              </div>

              {/* Benefits List */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">No credit card required</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Start free and upgrade when you&apos;re ready</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">AI habit recommendations</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Get personalized suggestions based on your goals</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Cancel anytime</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No commitments, no hidden fees</p>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">B</span>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">C</span>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">+</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">10,000+ happy users</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Sign Up Form */}
          <div className="flex-shrink-0 w-full max-w-md">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 backdrop-blur-lg bg-opacity-95 dark:bg-opacity-95">
              {/* Form Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Create your account
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Start your 30-day free trial
                </p>
              </div>

              <div className="space-y-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Full Name Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                      </div>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                          errors.displayName ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                        {...register('displayName')}
                      />
                    </div>
                    {errors.displayName && (
                      <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                        <span className="text-xs">⚠</span> {errors.displayName.message}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                      </div>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                          errors.email ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                        {...register('email')}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                        <span className="text-xs">⚠</span> {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        className={`w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                          errors.password ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                        {...register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                        <span className="text-xs">⚠</span> {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        className={`w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                          errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                        {...register('confirmPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                        <span className="text-xs">⚠</span> {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Terms Agreement */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-emerald-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded focus:ring-emerald-500 focus:ring-2 mt-0.5"
                      required
                    />
                    <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      I agree to the{' '}
                      <Link href="/terms" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Error Message */}
                  {(error || authError) && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                      <div className="flex items-center gap-2">
                        <span>⚠</span>
                        <span>{error || authError}</span>
                      </div>
                    </div>
                  )}

                  {/* Create Account Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>Start free trial</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white dark:bg-gray-900 px-4 text-gray-500 dark:text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social Sign In Buttons */}
                <div className="space-y-3">
                  {/* Google Sign In */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm hover:shadow-md"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Continue with Google</span>
                  </button>
                </div>

                {/* Sign In Link */}
                <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link
                      href="/login"
                      className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors duration-200"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl mb-3">
              <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Achieve Your Goals</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Set and track habits with smart reminders</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl mb-3">
              <Heart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Stay Motivated</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Celebrate streaks and milestones</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl mb-3">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Share Progress</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Connect with family and friends</p>
          </div>
        </div>
      </main>
    </div>
  );
}
