import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { FamilyProvider } from '@/contexts/FamilyContext'
import { CelebrationProvider } from '@/contexts/CelebrationContext'
import { CelebrationOverlay } from '@/components/celebration/CelebrationOverlay'
import { SoundFeedback } from '@/components/celebration/SoundFeedback'

export const metadata: Metadata = {
  title: 'NextVibe - Build Better Habits',
  description: 'Track your daily habits and build a better you',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            <FamilyProvider>
              <CelebrationProvider>
                {children}
                <CelebrationOverlay />
                <SoundFeedback />
              </CelebrationProvider>
            </FamilyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}