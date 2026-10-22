/**
 * Utility functions for Rupiah and thousands formatting with dots (.)
 */

export function formatDots(val: string | number | undefined | null): string {
  if (val === undefined || val === null || val === '') return ''
  const cleanNumber = String(val).replace(/\D/g, '')
  if (!cleanNumber) return ''
  return cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function parseDots(val: string | number | undefined | null): number {
  if (val === undefined || val === null || val === '') return 0
  const cleanNumber = String(val).replace(/\D/g, '')
  return cleanNumber ? parseInt(cleanNumber, 10) : 0
}

export function formatRupiah(amount: number | string | undefined | null): string {
  const numeric = typeof amount === 'number' ? amount : parseDots(amount)
  return `Rp ${formatDots(numeric) || '0'}`
}
