'use client'

import React from 'react'

export type MascotState =
  | 'added_today'
  | 'waiting_3_days'
  | 'waiting_6_days'
  | 'waiting_12_days'
  | 'in_progress'
  | 'waiting'
  | 'done'

interface TaskMascotProps {
  status?: 'todo' | 'in_progress' | 'waiting' | 'done'
  daysWaiting?: number
  state?: MascotState
  size?: number | 'sm' | 'md' | 'lg'
  className?: string
  showTooltip?: boolean
}

export function resolveMascotState(
  status?: string,
  daysWaiting: number = 0
): MascotState {
  if (status === 'done') return 'done'
  if (status === 'in_progress') return 'in_progress'
  if (status === 'waiting') return 'waiting'

  if (daysWaiting >= 12) return 'waiting_12_days'
  if (daysWaiting >= 6) return 'waiting_6_days'
  if (daysWaiting >= 3) return 'waiting_3_days'
  return 'added_today'
}

export default function TaskMascot({
  status,
  daysWaiting = 0,
  state: explicitState,
  size = 'md',
  className = '',
  showTooltip = false,
}: TaskMascotProps) {
  const mascotState = explicitState || resolveMascotState(status, daysWaiting)

  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 34
      : size === 'lg'
      ? 56
      : 44

  const labels: Record<MascotState, { title: string; desc: string }> = {
    added_today: {
      title: 'Baru dibuat hari ini',
      desc: 'Segar dan siap dieksekusi',
    },
    waiting_3_days: {
      title: `Menunggu ${daysWaiting || 3} hari`,
      desc: 'Mulai agak sebal diabaikan',
    },
    waiting_6_days: {
      title: `Menunggu ${daysWaiting || 6} hari`,
      desc: 'Alis menekuk, butuh perhatian segera!',
    },
    waiting_12_days: {
      title: `Menunggu ${daysWaiting || 12} hari!`,
      desc: 'Merah membara! Segera tuntaskan atau arsipkan',
    },
    in_progress: {
      title: 'Sedang dikerjakan',
      desc: 'Fokus mengetik dengan laptop',
    },
    waiting: {
      title: 'Tertunda / Menunggu',
      desc: 'Menunggu kelanjutan atau dependensi luar',
    },
    done: {
      title: 'Tuntas & Selesai',
      desc: 'Bahagia dan berkilau!',
    },
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none group ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
      title={showTooltip ? `${labels[mascotState].title} — ${labels[mascotState].desc}` : undefined}
    >
      <svg
        viewBox="0 0 64 64"
        width={pixelSize}
        height={pixelSize}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible transition-transform duration-300 ease-out group-hover:scale-110"
      >
        <defs>
          {/* Gradients for each state */}
          {/* 1. Added Today: Dark Charcoal Navy */}
          <linearGradient id="grad-added-today" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#475569" />
            <stop offset="0.6" stopColor="#1E293B" />
            <stop offset="1" stopColor="#0F172A" />
          </linearGradient>

          {/* 2. Waiting 3 Days: Orange Amber */}
          <linearGradient id="grad-waiting-3" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FB923C" />
            <stop offset="0.6" stopColor="#EA580C" />
            <stop offset="1" stopColor="#C2410C" />
          </linearGradient>

          {/* 3. Waiting 6 Days: Angry Coral Red */}
          <linearGradient id="grad-waiting-6" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F87171" />
            <stop offset="0.6" stopColor="#DC2626" />
            <stop offset="1" stopColor="#991B1B" />
          </linearGradient>

          {/* 4. Waiting 12+ Days: Burning Crimson Maroon */}
          <linearGradient id="grad-waiting-12" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EF4444" />
            <stop offset="0.4" stopColor="#991B1B" />
            <stop offset="1" stopColor="#450A0A" />
          </linearGradient>

          {/* 5. In Progress: Vibrant Violet / Purple */}
          <linearGradient id="grad-in-progress" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A855F7" />
            <stop offset="0.5" stopColor="#7C3AED" />
            <stop offset="1" stopColor="#5B21B6" />
          </linearGradient>

          {/* 6. Waiting: Cyan Sky Blue */}
          <linearGradient id="grad-waiting" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="0.6" stopColor="#0284C7" />
            <stop offset="1" stopColor="#0369A1" />
          </linearGradient>

          {/* 7. Done: Sparkling Mint Emerald */}
          <linearGradient id="grad-done" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34D399" />
            <stop offset="0.5" stopColor="#059669" />
            <stop offset="1" stopColor="#065F46" />
          </linearGradient>

          {/* Soft Drop Shadow Filter */}
          <filter id="mascot-shadow" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Ground ambient shadow */}
        <ellipse cx="32" cy="58" rx="14" ry="2.5" fill="black" fillOpacity="0.12" />

        {/* ----------------- RENDER MASCOT BASED ON STATE ----------------- */}

        {/* 1. ADDED TODAY (Neutral, sweet, calm dark droplet) */}
        {mascotState === 'added_today' && (
          <g filter="url(#mascot-shadow)">
            {/* Antenna */}
            <line x1="32" y1="16" x2="32" y2="8" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
            <circle cx="32" cy="7" r="3" fill="#FBBF24" />

            {/* Teardrop Body */}
            <path
              d="M32 14 C32 14 47 30 47 43 C47 51 40 56 32 56 C24 56 17 51 17 43 C17 30 32 14 32 14 Z"
              fill="url(#grad-added-today)"
            />

            {/* Specular highlight */}
            <path
              d="M26 24 C23 29 22 36 23 41"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeOpacity="0.3"
            />

            {/* Eyes */}
            <ellipse cx="27" cy="40" rx="3.2" ry="3.8" fill="white" />
            <circle cx="27.5" cy="40.5" r="2.2" fill="#0F172A" />
            <circle cx="28.5" cy="39" r="1" fill="white" />

            <ellipse cx="37" cy="40" rx="3.2" ry="3.8" fill="white" />
            <circle cx="36.5" cy="40.5" r="2.2" fill="#0F172A" />
            <circle cx="37.5" cy="39" r="1" fill="white" />

            {/* Gentle smile */}
            <path d="M29 46 Q32 48.5 35 46" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}

        {/* 2. WAITING 3 DAYS (Orange, mildly grumpy / squinting) */}
        {mascotState === 'waiting_3_days' && (
          <g filter="url(#mascot-shadow)">
            {/* Antenna */}
            <line x1="32" y1="16" x2="32" y2="8" stroke="#FED7AA" strokeWidth="2" strokeLinecap="round" />
            <circle cx="32" cy="7" r="3" fill="#FBBF24" />

            {/* Teardrop Body */}
            <path
              d="M32 14 C32 14 47 30 47 43 C47 51 40 56 32 56 C24 56 17 51 17 43 C17 30 32 14 32 14 Z"
              fill="url(#grad-waiting-3)"
            />

            {/* Highlight */}
            <path
              d="M26 24 C23 29 22 36 23 41"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeOpacity="0.3"
            />

            {/* Squinting / suspicious eyes */}
            <ellipse cx="27" cy="41" rx="3" ry="2.2" fill="white" />
            <circle cx="27.5" cy="41" r="1.6" fill="#431407" />
            <path d="M24 39.5 L30 39.5" stroke="#7C2D12" strokeWidth="1.5" strokeLinecap="round" />

            <ellipse cx="37" cy="41" rx="3" ry="2.2" fill="white" />
            <circle cx="36.5" cy="41" r="1.6" fill="#431407" />
            <path d="M34 39.5 L40 39.5" stroke="#7C2D12" strokeWidth="1.5" strokeLinecap="round" />

            {/* Flat unamused mouth */}
            <path d="M29 47 L35 47" stroke="#431407" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        )}

        {/* 3. WAITING 6 DAYS (Coral Red, angry brows, frowning) */}
        {mascotState === 'waiting_6_days' && (
          <g filter="url(#mascot-shadow)">
            {/* Antenna angled */}
            <line x1="32" y1="16" x2="31" y2="8" stroke="#FECACA" strokeWidth="2" strokeLinecap="round" />
            <circle cx="31" cy="7" r="3.2" fill="#EF4444" />

            {/* Teardrop Body */}
            <path
              d="M32 14 C32 14 47 30 47 43 C47 51 40 56 32 56 C24 56 17 51 17 43 C17 30 32 14 32 14 Z"
              fill="url(#grad-waiting-6)"
            />

            {/* Angry angled eyebrows */}
            <path d="M24 36 L29 39" stroke="#450A0A" strokeWidth="2" strokeLinecap="round" />
            <path d="M40 36 L35 39" stroke="#450A0A" strokeWidth="2" strokeLinecap="round" />

            {/* Glaring eyes */}
            <ellipse cx="27" cy="42" rx="3" ry="2.5" fill="white" />
            <circle cx="27" cy="42" r="1.8" fill="#450A0A" />

            <ellipse cx="37" cy="42" rx="3" ry="2.5" fill="white" />
            <circle cx="37" cy="42" r="1.8" fill="#450A0A" />

            {/* Frowning curved mouth */}
            <path d="M28 48 Q32 45 36 48" stroke="#450A0A" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        )}

        {/* 4. WAITING 12+ DAYS (Dark Crimson, steam puffs, furious) */}
        {mascotState === 'waiting_12_days' && (
          <g filter="url(#mascot-shadow)">
            {/* Steam bubbles floating */}
            <circle cx="16" cy="22" r="2" fill="#94A3B8" opacity="0.6" className="animate-pulse" />
            <circle cx="48" cy="22" r="2" fill="#94A3B8" opacity="0.6" className="animate-pulse" />
            <circle cx="32" cy="4" r="2.5" fill="#EF4444" className="animate-ping" opacity="0.75" />

            {/* Antenna */}
            <line x1="32" y1="16" x2="32" y2="8" stroke="#FCA5A5" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="32" cy="7" r="3.5" fill="#DC2626" />

            {/* Teardrop Body */}
            <path
              d="M32 14 C32 14 47 30 47 43 C47 51 40 56 32 56 C24 56 17 51 17 43 C17 30 32 14 32 14 Z"
              fill="url(#grad-waiting-12)"
            />

            {/* Heavy furious eyebrows */}
            <path d="M23 35 L30 39.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M41 35 L34 39.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />

            {/* Slanted furious eyes */}
            <ellipse cx="27" cy="42" rx="3.2" ry="2" fill="#FFFFFF" transform="rotate(-8 27 42)" />
            <circle cx="27" cy="42" r="1.6" fill="#180404" />

            <ellipse cx="37" cy="42" rx="3.2" ry="2" fill="#FFFFFF" transform="rotate(8 37 42)" />
            <circle cx="37" cy="42" r="1.6" fill="#180404" />

            {/* Gritted teeth scowl */}
            <rect x="27" y="47" width="10" height="3.5" rx="1.5" fill="#FFFFFF" stroke="#450A0A" strokeWidth="1" />
            <line x1="30" y1="47" x2="30" y2="50.5" stroke="#450A0A" strokeWidth="0.8" />
            <line x1="34" y1="47" x2="34" y2="50.5" stroke="#450A0A" strokeWidth="0.8" />
          </g>
        )}

        {/* 5. IN PROGRESS (Purple droplet with cute laptop & typing hands) */}
        {mascotState === 'in_progress' && (
          <g filter="url(#mascot-shadow)">
            {/* Antenna */}
            <line x1="32" y1="16" x2="32" y2="8" stroke="#DDD6FE" strokeWidth="2" strokeLinecap="round" />
            <circle cx="32" cy="7" r="3.2" fill="#FBBF24" />

            {/* Teardrop Body */}
            <path
              d="M32 14 C32 14 47 30 47 43 C47 51 40 56 32 56 C24 56 17 51 17 43 C17 30 32 14 32 14 Z"
              fill="url(#grad-in-progress)"
            />

            {/* Cute focused happy eyes */}
            <ellipse cx="27" cy="38" rx="3.4" ry="4" fill="white" />
            <circle cx="27.5" cy="38" r="2.2" fill="#2E1065" />
            <circle cx="28.5" cy="36.5" r="1.2" fill="white" />

            <ellipse cx="37" cy="38" rx="3.4" ry="4" fill="white" />
            <circle cx="36.5" cy="38" r="2.2" fill="#2E1065" />
            <circle cx="37.5" cy="36.5" r="1.2" fill="white" />

            {/* Tiny focused smile / tongue */}
            <path d="M29 44 Q32 46.5 35 44" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M31 44 Q32 47 33 44" fill="#F472B6" />

            {/* Laptop Base & Screen */}
            <rect x="22" y="47" width="20" height="12" rx="1.5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.8" />
            <rect x="23.5" y="48.5" width="17" height="9" rx="1" fill="#38BDF8" fillOpacity="0.85" />
            <circle cx="32" cy="53" r="1.2" fill="white" />

            {/* Little cute purple hands typing */}
            <circle cx="22" cy="55" r="2.5" fill="#A855F7" stroke="#4C1D95" strokeWidth="0.6" />
            <circle cx="42" cy="55" r="2.5" fill="#A855F7" stroke="#4C1D95" strokeWidth="0.6" />
          </g>
        )}

        {/* 6. WAITING (Cyan Blue, with animated '...' speech bubble) */}
        {mascotState === 'waiting' && (
          <g filter="url(#mascot-shadow)">
            {/* Animated '...' speech bubble on top */}
            <g className="animate-bounce" style={{ animationDuration: '2s' }}>
              <rect x="21" y="2" width="22" height="11" rx="5.5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1" />
              <path d="M32 13 L30 16 L34 13 Z" fill="#FFFFFF" />
              <circle cx="26" cy="7.5" r="1.5" fill="#0284C7" />
              <circle cx="32" cy="7.5" r="1.5" fill="#0284C7" />
              <circle cx="38" cy="7.5" r="1.5" fill="#0284C7" />
            </g>

            {/* Teardrop Body */}
            <path
              d="M32 18 C32 18 47 32 47 44 C47 51 40 56 32 56 C24 56 17 51 17 44 C17 32 32 18 32 18 Z"
              fill="url(#grad-waiting)"
            />

            {/* Highlight */}
            <path
              d="M26 27 C23 32 22 38 23 43"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeOpacity="0.35"
            />

            {/* Eyes */}
            <ellipse cx="27" cy="41" rx="3.2" ry="3.5" fill="white" />
            <circle cx="27.5" cy="41" r="2" fill="#082F49" />
            <circle cx="28.5" cy="39.8" r="0.9" fill="white" />

            <ellipse cx="37" cy="41" rx="3.2" ry="3.5" fill="white" />
            <circle cx="36.5" cy="41" r="2" fill="#082F49" />
            <circle cx="37.5" cy="39.8" r="0.9" fill="white" />

            {/* Neutral slightly open oval mouth (waiting) */}
            <ellipse cx="32" cy="47" rx="1.8" ry="1.2" fill="#082F49" />
          </g>
        )}

        {/* 7. DONE (Emerald Green, smiling joyous eyes, sprout & sparkle) */}
        {mascotState === 'done' && (
          <g filter="url(#mascot-shadow)">
            {/* Sparkle 4-point star on top right */}
            <path
              d="M48 10 L49.2 13.5 L53 14.5 L49.2 15.5 L48 19 L46.8 15.5 L43 14.5 L46.8 13.5 Z"
              fill="#F59E0B"
              className="animate-pulse"
            />

            {/* Green Leaf Sprout on top */}
            <line x1="32" y1="16" x2="32" y2="9" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            <path d="M32 9 Q38 6 36 12 Q33 11 32 9 Z" fill="#34D399" stroke="#065F46" strokeWidth="0.8" />

            {/* Teardrop Body */}
            <path
              d="M32 14 C32 14 47 30 47 43 C47 51 40 56 32 56 C24 56 17 51 17 43 C17 30 32 14 32 14 Z"
              fill="url(#grad-done)"
            />

            {/* Specular highlight */}
            <path
              d="M26 24 C23 29 22 36 23 41"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeOpacity="0.4"
            />

            {/* Joyous inverted arch smiling eyes (^ ^) */}
            <path d="M24 40 Q27.5 35 31 40" stroke="#064E3B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M33 40 Q36.5 35 40 40" stroke="#064E3B" strokeWidth="2.2" strokeLinecap="round" fill="none" />

            {/* Rosy cheeks */}
            <ellipse cx="23" cy="43" rx="2" ry="1.2" fill="#F472B6" fillOpacity="0.75" />
            <ellipse cx="41" cy="43" rx="2" ry="1.2" fill="#F472B6" fillOpacity="0.75" />

            {/* Big happy open mouth */}
            <path d="M27 43 Q32 51 37 43 Z" fill="#064E3B" />
            <path d="M29 46 Q32 49 35 46 Z" fill="#F43F5E" />
          </g>
        )}
      </svg>
    </div>
  )
}
