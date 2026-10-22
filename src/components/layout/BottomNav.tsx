'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faHouse,
  faMosque,
  faWallet,
  faDumbbell,
  faListCheck,
} from '@fortawesome/free-solid-svg-icons'

interface NavTab {
  name: string
  href: string
  icon: IconDefinition
}

const TABS: NavTab[] = [
  { name: 'Beranda', href: '/', icon: faHouse },
  { name: 'Sholat', href: '/sholat', icon: faMosque },
  { name: 'Keuangan', href: '/finance', icon: faWallet },
  { name: 'Gym', href: '/gym', icon: faDumbbell },
  { name: 'Habits', href: '/habits', icon: faListCheck },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface/98 backdrop-blur-md border-t border-border shadow-[0_-4px_24px_rgba(15,23,42,0.08)] pb-[env(safe-area-inset-bottom)]"
      aria-label="Navigasi Aplikasi"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {TABS.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== '/' && pathname.startsWith(tab.href))

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="flex flex-col items-center justify-center flex-1 py-1 group transition-all duration-150 active:scale-95"
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Material 3 active indicator pill */}
              <div
                className={`
                  flex items-center justify-center h-8 px-4 rounded-full transition-all duration-200
                  ${
                    isActive
                      ? 'bg-navy text-white shadow-xs'
                      : 'text-slate group-hover:text-navy group-hover:bg-slate-100/60'
                  }
                `}
              >
                <FontAwesomeIcon
                  icon={tab.icon}
                  className={`h-4.5 w-4.5 transition-transform duration-200 ${
                    isActive ? 'scale-105 text-white' : 'text-slate group-hover:text-navy'
                  }`}
                />
              </div>

              {/* Label */}
              <span
                className={`
                  text-[10px] font-heading tracking-tight mt-1 transition-colors duration-150
                  ${isActive ? 'font-bold text-navy' : 'font-medium text-slate'}
                `}
              >
                {tab.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
