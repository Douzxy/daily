'use client'

import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-bg flex flex-col antialiased selection:bg-sage/20 selection:text-navy">
      <Header title={title} subtitle={subtitle} />
      <main className="flex-1 w-full max-w-2xl lg:max-w-3xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-28">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
