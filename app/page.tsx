import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-primary-950 dark:to-secondary-900">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-primary-800 dark:text-primary-200 mb-6">
            Build Better Habits
          </h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 mb-12 max-w-2xl mx-auto">
            Track your daily habits, visualize your progress, and build the life you want with our simple yet powerful habit tracker.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/signup" className="btn-primary text-lg px-8 py-3">
              Get Started Free
            </Link>
            <Link href="/login" className="btn-outline text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Simple Tracking</h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                Mark habits as complete with a simple tap. No complicated setup required.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-16 h-16 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Visual Progress</h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                See your streaks and progress with beautiful charts and calendar views.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-16 h-16 bg-warning-100 dark:bg-warning-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Insights</h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                Get insights into your habits and discover patterns in your behavior.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}