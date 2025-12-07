import { cn } from '@seeds/ui/cn'
import '@seeds/ui/globals.css'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'

export const metadata: Metadata = {
  title: 'Seeds',
  description: 'ATS Solution for all sizes',
}

export const viewport = {
  themeColor: [{ media: '(prefers-color-scheme: light)' }, { media: '(prefers-color-scheme: dark)' }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(`${GeistSans.variable} ${GeistMono.variable}`, 'antialiased')}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
