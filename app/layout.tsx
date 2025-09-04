import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { FamilyProvider } from '@/contexts/FamilyContext'
import { GlobalDataProvider } from '@/contexts/GlobalDataContext'
import { CelebrationProvider } from '@/contexts/CelebrationContext'
import { CelebrationOverlay } from '@/components/celebration/CelebrationOverlay'
import { SoundFeedback } from '@/components/celebration/SoundFeedback'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'NextVibe - Build Better Habits',
  description: 'Track your daily habits and build a better you',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Climate+Crisis&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Kablammo:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Flavors&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            <FamilyProvider>
              <GlobalDataProvider>
                <CelebrationProvider>
                  {children}
                  <CelebrationOverlay />
                  <SoundFeedback />
                  <Toaster 
                    position="top-center"
                    reverseOrder={false}
                    gutter={8}
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: 'var(--toast-bg)',
                        color: 'var(--toast-color)',
                        border: '1px solid var(--toast-border)',
                      },
                      success: {
                        iconTheme: {
                          primary: '#10B981',
                          secondary: '#ffffff',
                        },
                      },
                      error: {
                        iconTheme: {
                          primary: '#EF4444',
                          secondary: '#ffffff',
                        },
                      },
                    }}
                  />
                </CelebrationProvider>
              </GlobalDataProvider>
            </FamilyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}