import React from 'react'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ShieldCode - أداة مكافحة التصيد والاحتيال المالي للمؤسسات',
  description: 'ShieldCode - أداة سطر الأوامر ومكتبة الأمان المالي لمكافحة التصيد والاحتيال في البنوك والمنصات المالية',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
