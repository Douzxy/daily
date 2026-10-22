'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faTableColumns,
  faPenToSquare,
  faMosque,
  faWallet,
  faDumbbell,
  faListCheck,
  faGear,
  faXmark,
  faChevronRight,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect } from 'react'

interface NavItem {
  name: string
  href: string
  icon: IconDefinition
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: faTableColumns },
  { name: 'Daily Capture', href: '/capture', icon: faPenToSquare },
  { name: 'Sholat', href: '/sholat', icon: faMosque },
  { name: 'Keuangan', href: '/finance', icon: faWallet },
  { name: 'Gym & Fitness', href: '/gym', icon: faDumbbell },
  { name: 'Habits', href: '/habits', icon: faListCheck },
  { name: 'Settings', href: '/settings', icon: faGear },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen: controlledIsOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [internalOpen, setInternalOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isMobileOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen
  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setInternalOpen(false)
    }
  }

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        if (onClose) onClose()
        else setInternalOpen(false)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isMobileOpen, onClose])

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-xs lg:hidden animate-fade-in"
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-surface border-r border-border
          flex flex-col transition-all duration-300 ease-out
          ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto lg:shadow-none
          ${isCollapsed ? 'lg:w-18' : 'lg:w-65'}
          w-70
        `}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-border">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 animate-fade-in">
              <div className="h-8 w-8 rounded-lg bg-navy flex items-center justify-center">
                <span className="text-white font-heading font-bold text-body-sm">P</span>
              </div>
              <span className="font-heading font-bold text-h4 text-navy tracking-tight">
                Personal OS
              </span>
            </div>
          )}

          {isCollapsed && (
            <div className="mx-auto h-8 w-8 rounded-lg bg-navy flex items-center justify-center">
              <span className="text-white font-heading font-bold text-body-sm">P</span>
            </div>
          )}

          {/* Close button (mobile) */}
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-border-light lg:hidden transition-colors"
            aria-label="Tutup navigasi"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4 text-slate" />
          </button>

          {/* Collapse toggle (desktop) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              hidden lg:flex h-7 w-7 items-center justify-center rounded-md
              hover:bg-border-light transition-all duration-200
              ${isCollapsed ? 'mx-auto' : ''}
            `}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <FontAwesomeIcon
              icon={isCollapsed ? faChevronRight : faChevronLeft}
              className="h-3 w-3 text-slate"
            />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleClose}
                className={`
                  group flex items-center gap-3 rounded-lg px-3 h-11
                  transition-all duration-200 relative
                  ${
                    isActive
                      ? 'bg-navy text-white shadow-xs'
                      : 'text-slate hover:bg-border-light hover:text-navy'
                  }
                  ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className={`h-4 w-4 shrink-0 transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-slate group-hover:text-navy'
                  }`}
                />
                {!isCollapsed && (
                  <span className="text-body-sm font-medium truncate">
                    {item.name}
                  </span>
                )}

                {/* Active indicator dot for collapsed mode */}
                {isActive && isCollapsed && (
                  <span className="absolute -right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-sage" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        {!isCollapsed && (
          <div className="px-3 pb-4 animate-fade-in">
            <div className="rounded-lg bg-bg border border-border p-4">
              <p className="text-caption text-slate font-medium uppercase tracking-wider">
                Progress Hari Ini
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sage transition-all duration-700 ease-out"
                    style={{ width: '65%' }}
                  />
                </div>
                <span className="text-caption font-mono text-sage font-medium">
                  65%
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
