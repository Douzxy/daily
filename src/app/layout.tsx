import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, DM_Sans, Fira_Code } from 'next/font/google'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import './globals.css'

config.autoAddCss = false

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'Daily OS — Edo Priyatna',
  description:
    'Sistem kendali hidup terpadu: sholat, keuangan, kebugaran, dan produktivitas harian Edo Priyatna.',
  icons: {
    icon: [
      { url: '/banana-icon.png', type: 'image/png' },
      { url: '/icon.png?v=3', type: 'image/png' },
    ],
    shortcut: '/banana-icon.png',
    apple: '/banana-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} ${dmSans.variable} ${firaCode.variable}`}
    >
      <body className="min-h-screen bg-bg text-navy antialiased">
        {children}
      </body>
    </html>
  )
}
