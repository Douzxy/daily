'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faArrowsRotate,
  faGear,
  faPenToSquare,
  faLock,
  faHouse,
  faMosque,
  faWallet,
  faDumbbell,
  faListCheck,
} from '@fortawesome/free-solid-svg-icons'
import { Storage } from '@/lib/storage'
import { showToast } from '@/components/ui'
import { TABS } from './BottomNav'

interface HeaderProps {
  title?: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [isSyncing, setIsSyncing] = useState(false)

  const handleManualSync = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    try {
      await Storage.syncFromDatabase()
      showToast('Data berhasil diperbarui dari cloud!', 'success')
    } catch {
      showToast('Gagal menyinkronkan data dari cloud', 'error')
    } finally {
      setTimeout(() => {
        setIsSyncing(false)
      }, 500)
    }
  }

  const handleLockApp = () => {
    Storage.lock()
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 sm:h-16 px-3.5 sm:px-6 bg-surface/95 backdrop-blur-md border-b border-border shadow-2xs">
      {/* Left: Brand or Back Arrow + Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        {!isHome ? (
          <Link
            href="/"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 text-navy transition-colors active:scale-90"
            aria-label="Kembali ke Beranda"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          </Link>
        ) : (
          <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-navy text-white font-heading font-bold text-body-sm shadow-xs">
            D
          </div>
        )}

        <div className="min-w-0">
          <span className="text-body sm:text-h4 font-heading font-bold text-navy truncate block leading-tight">
            {isHome ? 'Daily OS' : title || 'Daily OS'}
          </span>
        </div>
      </div>

      {/* Center: Desktop Navigation Tabs (Sleek Android Pill on Web) */}
      <nav
        className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-border"
        aria-label="Navigasi Desktop"
      >
        {TABS.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== '/' && pathname.startsWith(tab.href))

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`
                flex items-center gap-2 px-3.5 py-1.5 rounded-full text-caption font-heading transition-all duration-200
                ${
                  isActive
                    ? 'bg-navy text-white font-bold shadow-xs'
                    : 'text-slate hover:text-navy hover:bg-white/80 font-medium'
                }
              `}
            >
              <FontAwesomeIcon
                icon={tab.icon}
                className={`text-[11px] ${isActive ? 'text-white' : 'text-slate'}`}
              />
              <span>{tab.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Tombol Refresh Multi-Device Cloud Sync */}
        <button
          type="button"
          onClick={handleManualSync}
          disabled={isSyncing}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate hover:text-navy hover:bg-slate-100 transition-colors active:scale-90 disabled:opacity-50 cursor-pointer"
          aria-label="Segarkan Data Cloud"
          title="Segarkan Data Cloud (Multi-Device Sync)"
        >
          <FontAwesomeIcon
            icon={faArrowsRotate}
            className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-navy' : ''}`}
          />
        </button>

        {/* Quick Capture action button */}
        <Link
          href="/capture"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate hover:text-navy hover:bg-slate-100 transition-colors active:scale-95"
          aria-label="Daily Capture Jurnal"
          title="Daily Capture Jurnal"
        >
          <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" />
        </Link>

        {/* Lock App Button */}
        <button
          type="button"
          onClick={handleLockApp}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate hover:text-navy hover:bg-slate-100 transition-colors active:scale-95"
          aria-label="Kunci Aplikasi"
          title="Kunci Aplikasi"
        >
          <FontAwesomeIcon icon={faLock} className="h-3.5 w-3.5" />
        </button>

        {/* Settings gear - hide if on settings or on mobile */}
        {!pathname.startsWith('/settings') && (
          <Link
            href="/settings"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-slate hover:text-navy hover:bg-slate-100 transition-colors active:scale-95"
            aria-label="Pengaturan"
            title="Pengaturan"
          >
            <FontAwesomeIcon icon={faGear} className="h-4 w-4" />
          </Link>
        )}

        {/* User avatar */}
        <Link
          href="/settings"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white font-heading font-bold text-caption hover:bg-navy-hover transition-colors ml-0.5 active:scale-95 shadow-xs"
          aria-label="Profil Edo"
          title="Profil Edo"
        >
          E
        </Link>
      </div>
    </header>
  )
}
