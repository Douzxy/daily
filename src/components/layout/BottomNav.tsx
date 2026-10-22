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

export interface NavTab {
  name: string
  href: string
  icon: IconDefinition
}

export const TABS: NavTab[] = [
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
      className="md:hidden fixed bottom-3 inset-x-3 z-40 max-w-md mx-auto"
      aria-label="Navigasi Android Mobile"
    >
      <div className="flex items-center justify-around h-16 px-1.5 py-1 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-[0_8px_32px_rgba(15,23,42,0.14)]">
        {TABS.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== '/' && pathname.startsWith(tab.href))

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="flex flex-col items-center justify-center flex-1 py-1 group transition-all duration-150 active:scale-90"
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Android Material 3 Pill Indicator */}
              <div
                className={`
                  flex items-center justify-center h-8 px-4 rounded-full transition-all duration-200
                  ${
                    isActive
                      ? 'bg-navy text-white shadow-xs'
                      : 'text-slate group-hover:text-navy group-hover:bg-slate-100/70'
                  }
                `}
              >
                <FontAwesomeIcon
                  icon={tab.icon}
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-white' : 'text-slate group-hover:text-navy'
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
