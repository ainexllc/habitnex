import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { theme } from '@/lib/theme'

export default function HomePage() {
  return (
    <div className={`min-h-screen ${theme.gradients.pageBackground}`}>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className={`text-5xl font-bold ${theme.text.primary} mb-6`}>
            Build Better Habits
          </h1>
          <p className={`text-xl ${theme.text.secondary} mb-12 max-w-2xl mx-auto`}>
            Track your daily habits, visualize your progress, and build the life you want with our simple yet powerful habit tracker.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/signup" className={`${theme.components.button.primary} text-lg px-8 py-3 rounded-lg inline-block ${theme.animation.transition}`}>
              Get Started Free
            </Link>
            <Link href="/login" className={`${theme.components.button.outline} text-lg px-8 py-3 rounded-lg inline-block ${theme.animation.transition}`}>
              Sign In
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className={`${theme.components.card} text-center p-8`}>
              <div className={`w-16 h-16 ${theme.iconContainer.blue} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <svg className={`w-8 h-8 ${theme.status.info.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${theme.text.primary}`}>Simple Tracking</h3>
              <p className={theme.text.secondary}>
                Mark habits as complete with a simple tap. No complicated setup required.
              </p>
            </div>
            
            <div className={`${theme.components.card} text-center p-8`}>
              <div className={`w-16 h-16 ${theme.iconContainer.green} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <svg className={`w-8 h-8 ${theme.status.success.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${theme.text.primary}`}>Visual Progress</h3>
              <p className={theme.text.secondary}>
                See your streaks and progress with beautiful charts and calendar views.
              </p>
            </div>
            
            <div className={`${theme.components.card} text-center p-8`}>
              <div className={`w-16 h-16 ${theme.iconContainer.yellow} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <svg className={`w-8 h-8 ${theme.status.warning.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${theme.text.primary}`}>Smart Insights</h3>
              <p className={theme.text.secondary}>
                Get insights into your habits and discover patterns in your behavior.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}