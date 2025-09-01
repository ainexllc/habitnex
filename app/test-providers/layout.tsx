import { SimpleThemeProvider } from '@/contexts/ThemeContextSimple'

export default function TestProvidersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="bg-yellow-500 text-black p-2 text-sm">
        Test Layout: Only SimpleThemeProvider (no Firebase) active
      </div>
      <SimpleThemeProvider>
        {children}
      </SimpleThemeProvider>
    </>
  )
}