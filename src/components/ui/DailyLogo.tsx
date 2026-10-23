'use client'

import React from 'react'

interface DailyLogoProps {
  size?: number
  className?: string
  withBackground?: boolean
}

export default function DailyLogo({
  size = 36,
  className = '',
  withBackground = true,
}: DailyLogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none overflow-hidden rounded-xl transition-transform duration-200 hover:scale-105 active:scale-95 ${className}`}
      style={{ width: size, height: size }}
      title="Daily OS Mascot Logo"
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Background Squircle Gradient with Clean Navy */}
          <linearGradient id="dl-bg-squircle" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E293B" />
            <stop offset="0.6" stopColor="#0F172A" />
            <stop offset="1" stopColor="#0B132B" />
          </linearGradient>

          {/* Luminous Bright Cyan Mascot Body (NEVER black/dark!) */}
          <linearGradient id="dl-mascot-vibrant-body" x1="20" y1="12" x2="44" y2="54" gradientUnits="userSpaceOnUse">
            <stop stopColor="#BAE6FD" />
            <stop offset="0.25" stopColor="#38BDF8" />
            <stop offset="0.7" stopColor="#0EA5E9" />
            <stop offset="1" stopColor="#0284C7" />
          </linearGradient>

          {/* Glowing Golden Antenna Gradient */}
          <linearGradient id="dl-gold-antenna-ball" x1="29" y1="4" x2="35" y2="10" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEF08A" />
            <stop offset="0.45" stopColor="#FBBF24" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>

          {/* Droplet Ambient Glow */}
          <filter id="dl-cyan-glow" x="10" y="10" width="44" height="48" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#38BDF8" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Squircle Base with Bright Vibrant Cyan Border */}
        {withBackground && (
          <>
            <rect
              x="1.5"
              y="1.5"
              width="61"
              height="61"
              rx="16"
              fill="url(#dl-bg-squircle)"
              stroke="#38BDF8"
              strokeWidth="1.8"
              strokeOpacity="0.8"
            />
            {/* Top glass reflection */}
            <rect x="3" y="3" width="58" height="26" rx="14" fill="white" fillOpacity="0.08" />
            {/* Ground shadow */}
            <ellipse cx="32" cy="54" rx="14" ry="3.5" fill="#020617" fillOpacity="0.6" />
          </>
        )}

        <g filter="url(#dl-cyan-glow)">
          {/* Golden Antenna Pole */}
          <line x1="32" y1="16" x2="32" y2="8" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="32" y1="16" x2="32" y2="8" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />

          {/* Golden Antenna Glowing Orb */}
          <circle cx="32" cy="7.5" r="4.2" fill="url(#dl-gold-antenna-ball)" stroke="#FEF08A" strokeWidth="0.8" />
          <circle cx="30.6" cy="6.2" r="1.4" fill="#FFFFFF" fillOpacity="0.9" />

          {/* Main Teardrop Body: Bright & Vivid Cyan */}
          <path
            d="M32 14 C32 14 47 28 47 41 C47 50 40 55 32 55 C24 55 17 50 17 41 C17 28 32 14 32 14 Z"
            fill="url(#dl-mascot-vibrant-body)"
            stroke="#E0F2FE"
            strokeWidth="1"
            strokeOpacity="0.6"
          />

          {/* Specular Gloss Highlight */}
          <path
            d="M24 23 C21 28 20 35 21 41"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeOpacity="0.75"
          />
          <path
            d="M26 20 C28 17 30 15 32 14"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.5"
          />

          {/* Left Eye */}
          <ellipse cx="26.8" cy="38" rx="3.6" ry="4.2" fill="white" />
          <circle cx="27.2" cy="38.2" r="2.4" fill="#0B132B" />
          <circle cx="28.2" cy="36.8" r="1.2" fill="white" />
          <circle cx="26.2" cy="39.2" r="0.6" fill="white" />

          {/* Right Eye */}
          <ellipse cx="37.2" cy="38" rx="3.6" ry="4.2" fill="white" />
          <circle cx="36.8" cy="38.2" r="2.4" fill="#0B132B" />
          <circle cx="37.8" cy="36.8" r="1.2" fill="white" />
          <circle cx="35.8" cy="39.2" r="0.6" fill="white" />

          {/* Sweet Pink Blush Cheeks */}
          <ellipse cx="22" cy="42" rx="2.2" ry="1.3" fill="#FB7185" fillOpacity="0.7" />
          <ellipse cx="42" cy="42" rx="2.2" ry="1.3" fill="#FB7185" fillOpacity="0.7" />

          {/* Cute Smiling Mouth with Pink Tongue */}
          <path d="M28.5 43.5 Q32 47.5 35.5 43.5" stroke="#0B132B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M30 44.5 Q32 47.5 34 44.5 Z" fill="#FB7185" />
        </g>

        {/* Golden Sparkle Star Upper Right */}
        <path
          d="M48 10 L49.2 13.5 L53 14.5 L49.2 15.5 L48 19 L46.8 15.5 L43 14.5 L46.8 13.5 Z"
          fill="#FACC15"
          stroke="#FEF08A"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  )
}
