import './globals.css'
import type { Metadata } from 'next'
import { Providers } from './providers'
import React from 'react'

export const metadata: Metadata = {
  title: 'Issue Tracker Kanban',
  description: 'Issue tracking with Kanban board',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}