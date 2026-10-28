/**
 * Utility functions for Rupiah and thousands formatting with dots (.)
 */

export function formatDots(val: string | number | undefined | null): string {
  if (val === undefined || val === null || val === '') return ''
  const str = String(val).trim()
  const isNegative = typeof val === 'number' ? val < 0 : str.startsWith('-')
  const cleanNumber = str.replace(/\D/g, '')
  if (!cleanNumber) return ''
  const formatted = cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return isNegative ? `-${formatted}` : formatted
}

export function parseDots(val: string | number | undefined | null): number {
  if (val === undefined || val === null || val === '') return 0
  const str = String(val).trim()
  const isNegative = str.startsWith('-')
  const cleanNumber = str.replace(/\D/g, '')
  if (!cleanNumber) return 0
  const parsed = parseInt(cleanNumber, 10)
  return isNegative ? -parsed : parsed
}

export function formatRupiah(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') return 'Rp 0'
  const numeric = typeof amount === 'number' ? amount : parseDots(amount)
  if (numeric === 0) return 'Rp 0'
  const isNegative = numeric < 0
  const absDots = formatDots(Math.abs(numeric))
  return isNegative ? `-Rp ${absDots}` : `Rp ${absDots}`
}

