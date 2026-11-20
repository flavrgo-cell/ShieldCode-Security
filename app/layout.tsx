import React from "react"
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { I18nProvider } from '@/lib/i18n'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'SecurePay Gateway - Anti-Phishing Payment Verification',
  description: 'Protect your payments with real-time identity verification. SecurePay Gateway prevents unauthorized transactions through selfie verification and email confirmation.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='shieldcode_theme',s=localStorage.getItem(k),d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches),r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans font-medium antialiased tabular-nums">
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
        {process.env.VERCEL === "1" ? <Analytics /> : null}
      </body>
    </html>
  )
}
