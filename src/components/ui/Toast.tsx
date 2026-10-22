'use client'

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faCircleXmark,
  faCircleInfo,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

export function showToast(message: string, type: ToastType = 'success') {
  if (typeof window === 'undefined') return
  const event = new CustomEvent('daily-toast-message', {
    detail: { id: `toast-${Date.now()}-${Math.random()}`, message, type },
  })
  window.dispatchEvent(event)
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const handleNewToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastItem>
      if (!customEvent.detail) return

      const newToast = customEvent.detail
      setToasts((prev) => [newToast, ...prev.slice(0, 4)]) // Max 5 toasts

      // Auto dismiss after 3.5s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id))
      }, 3500)
    }

    window.addEventListener('daily-toast-message', handleNewToast)
    return () => window.removeEventListener('daily-toast-message', handleNewToast)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success'
        const isError = toast.type === 'error'

        return (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl
              transition-all duration-300 animate-slide-in
              ${
                isSuccess
                  ? 'bg-white border-emerald-300 text-emerald-950 shadow-emerald-900/10'
                  : isError
                  ? 'bg-white border-red-300 text-red-950 shadow-red-900/10'
                  : 'bg-white border-border text-navy shadow-navy/10'
              }
            `}
          >
            <div
              className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                isSuccess
                  ? 'bg-emerald-100 text-emerald-700'
                  : isError
                  ? 'bg-red-100 text-red-700'
                  : 'bg-slate-100 text-navy'
              }`}
            >
              <FontAwesomeIcon
                icon={isSuccess ? faCircleCheck : isError ? faCircleXmark : faCircleInfo}
                className="h-3.5 w-3.5"
              />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <h5 className="text-body-sm font-heading font-bold text-navy leading-tight">
                {isSuccess ? 'Berhasil' : isError ? 'Terjadi Kesalahan' : 'Pemberitahuan'}
              </h5>
              <p className="text-caption text-slate mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate hover:text-navy p-1 transition-colors shrink-0 cursor-pointer"
              aria-label="Tutup notifikasi"
            >
              <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
