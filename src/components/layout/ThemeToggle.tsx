'use client'

import { useSyncExternalStore } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
  return () => {
    window.removeEventListener('storage', callback)
    observer.disconnect()
  }
}

function getSnapshot(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.classList.contains('dark')
}

function getServerSnapshot(): boolean {
  return false
}

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggleTheme = () => {
    const nextDark = !isDark
    if (nextDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('lifetime_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('lifetime_theme', 'light')
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`
        flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 active:scale-90
        ${
          isDark
            ? 'text-amber-400 hover:text-amber-300 hover:bg-slate-800'
            : 'text-slate hover:text-navy hover:bg-slate-100'
        }
      `}
      aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      title={isDark ? 'Mode Terang' : 'Mode Gelap'}
    >
      <FontAwesomeIcon
        icon={isDark ? faSun : faMoon}
        className={`h-4 w-4 transition-transform duration-300 ${isDark ? 'rotate-90 text-amber-400' : 'rotate-0 text-slate hover:text-navy'}`}
      />
    </button>
  )
}
