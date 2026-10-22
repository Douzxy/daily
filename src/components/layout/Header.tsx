'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faGear,
  faPenToSquare,
} from '@fortawesome/free-solid-svg-icons'

interface HeaderProps {
  title?: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 bg-surface/95 backdrop-blur-md border-b border-border shadow-2xs">
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
            P
          </div>
        )}

        <div className="min-w-0">
          <h1 className="text-body sm:text-h4 font-heading font-bold text-navy truncate leading-tight">
            {isHome ? 'Personal OS' : title || 'Personal OS'}
          </h1>
          {isHome ? (
            <p className="text-[10px] text-slate font-mono">Edo Priyatna</p>
          ) : subtitle ? (
            <p className="text-caption text-slate truncate">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {/* Right: Android Action Icons */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Quick Capture action button */}
        <Link
          href="/capture"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate hover:text-navy hover:bg-slate-100 transition-colors active:scale-95"
          aria-label="Daily Capture Jurnal"
          title="Daily Capture Jurnal"
        >
          <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" />
        </Link>

        {/* Settings gear */}
        <Link
          href="/settings"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate hover:text-navy hover:bg-slate-100 transition-colors active:scale-95"
          aria-label="Pengaturan"
          title="Pengaturan"
        >
          <FontAwesomeIcon icon={faGear} className="h-4 w-4" />
        </Link>

        {/* User avatar */}
        <Link
          href="/settings"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white font-heading font-bold text-caption hover:bg-navy-hover transition-colors ml-1 active:scale-95 shadow-xs"
          aria-label="Profil Edo"
          title="Profil Edo"
        >
          E
        </Link>
      </div>
    </header>
  )
}
