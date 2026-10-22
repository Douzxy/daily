'use client'

import { useSyncExternalStore } from 'react'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import AuthLockScreen from '@/components/auth/AuthLockScreen'
import { ToastContainer } from '@/components/ui'
import { Storage } from '@/lib/storage'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

function subscribeAuth(callback: () => void) {
  window.addEventListener('lifetime-auth-change', callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener('lifetime-auth-change', callback)
    window.removeEventListener('storage', callback)
  }
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
}: DashboardLayoutProps) {
  const isUnlocked = useSyncExternalStore(
    subscribeAuth,
    () => Storage.isUnlocked(),
    () => false
  )

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  if (!mounted) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-navy border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!isUnlocked) {
    return (
      <>
        <ToastContainer />
        <AuthLockScreen
          onUnlocked={() => window.dispatchEvent(new Event('lifetime-auth-change'))}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col antialiased selection:bg-navy/10 selection:text-navy">
      <ToastContainer />
      <Header title={title} subtitle={subtitle} />
      <main className="flex-1 w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 pb-26 md:pb-12">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
