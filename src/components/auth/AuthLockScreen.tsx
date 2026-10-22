'use client'

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLock,
  faLockOpen,
  faEye,
  faEyeSlash,
  faDeleteLeft,
  faShieldHalved,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons'
import { Storage } from '@/lib/storage'

interface AuthLockScreenProps {
  onUnlocked: () => void
}

export default function AuthLockScreen({ onUnlocked }: AuthLockScreenProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      )
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      )
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!password) {
      setErrorMsg('Masukkan password terlebih dahulu.')
      triggerShake()
      return
    }

    const success = Storage.unlock(password)
    if (success) {
      setErrorMsg('')
      onUnlocked()
    } else {
      setErrorMsg('Password salah. Coba: "edo"')
      triggerShake()
    }
  }

  const triggerShake = () => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 500)
  }

  const handleKeyPadPress = (num: string) => {
    setErrorMsg('')
    setPassword((prev) => prev + num)
  }

  const handleKeyPadDelete = () => {
    setErrorMsg('')
    setPassword((prev) => prev.slice(0, -1))
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between min-h-screen bg-bg text-navy px-4 py-8 overflow-y-auto selection:bg-navy/10">
      {/* Top Android Lock Header & Clock */}
      <div className="w-full max-w-sm flex flex-col items-center text-center pt-4 sm:pt-8 animate-fade-in">
        <div className="h-12 w-12 rounded-2xl bg-navy text-white flex items-center justify-center shadow-md mb-3">
          <FontAwesomeIcon icon={faLock} className="h-5 w-5" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-navy tracking-tight tabular-nums">
          {currentTime || '--:--'}
        </h1>
        <p className="text-body-sm font-medium text-slate mt-1">{currentDate}</p>

        <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-border text-caption text-slate font-medium">
          <FontAwesomeIcon icon={faShieldHalved} className="text-navy text-[11px]" />
          <span>Daily OS • Edo Priyatna</span>
        </div>
      </div>

      {/* Center: Password Input Card */}
      <div className="w-full max-w-xs sm:max-w-sm my-auto py-4">
        <form
          onSubmit={handleUnlock}
          className={`space-y-4 ${isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
        >
          <div className="text-center">
            <h2 className="text-body font-heading font-bold text-navy">
              Kunci Keamanan Aplikasi
            </h2>
            <p className="text-caption text-slate mt-0.5">
              Masukkan password untuk mengakses data harian
            </p>
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              autoFocus
              value={password}
              onChange={(e) => {
                setErrorMsg('')
                setPassword(e.target.value)
              }}
              placeholder="Ketik password..."
              className={`
                w-full h-12 pl-4 pr-12 rounded-xl border bg-surface text-body font-mono text-center tracking-widest text-navy
                transition-all duration-200 outline-none
                ${
                  errorMsg
                    ? 'border-error ring-2 ring-error/20'
                    : 'border-border focus:border-navy focus:ring-2 focus:ring-navy/10'
                }
              `}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate hover:text-navy transition-colors p-1"
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="h-4 w-4"
              />
            </button>
          </div>

          {errorMsg && (
            <p className="text-caption text-error font-medium text-center animate-fade-in">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-navy text-white font-heading font-bold text-body-sm hover:bg-navy-hover active:scale-98 transition-all duration-150 flex items-center justify-center gap-2 shadow-xs"
          >
            <FontAwesomeIcon icon={faLockOpen} className="h-3.5 w-3.5" />
            <span>Buka Daily OS</span>
            <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 opacity-70" />
          </button>
        </form>

        {/* Tactile Android Keypad (Mobile-friendly PIN buttons) */}
        <div className="mt-6 pt-5 border-t border-border">
          <div className="grid grid-cols-3 gap-2.5 max-w-65 mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPadPress(digit)}
                className="h-11 rounded-xl bg-surface border border-border text-navy font-heading font-bold text-body hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleKeyPadDelete}
              className="h-11 rounded-xl bg-surface border border-border text-slate hover:text-navy hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center shadow-2xs"
              aria-label="Hapus karakter"
            >
              <FontAwesomeIcon icon={faDeleteLeft} className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleKeyPadPress('0')}
              className="h-11 rounded-xl bg-surface border border-border text-navy font-heading font-bold text-body hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleUnlock()}
              className="h-11 rounded-xl bg-navy text-white font-heading font-bold text-caption hover:bg-navy-hover active:scale-95 transition-all flex items-center justify-center shadow-xs"
              aria-label="Konfirmasi Buka"
            >
              <FontAwesomeIcon icon={faLockOpen} className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="text-center pt-2 pb-4">
        <span className="inline-block text-[11px] font-mono text-slate bg-surface px-3 py-1 rounded-full border border-border/70">
          Default Password: <strong className="text-navy">edo</strong> (ganti di Pengaturan)
        </span>
      </div>
    </div>
  )
}
