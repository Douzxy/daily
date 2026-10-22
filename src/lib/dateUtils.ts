export const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

export const DAY_NAMES_ID = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
]

export const AVAILABLE_YEARS = [2024, 2025, 2026, 2027, 2028]

export function getTodayDateStr(): string {
  if (typeof window === 'undefined') {
    return '2026-10-22'
  }
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

export function getCurrentYearAndMonth(): { year: number; monthIndex: number } {
  if (typeof window === 'undefined') {
    return { year: 2026, monthIndex: 9 }
  }
  const todayStr = getTodayDateStr()
  const [y, m] = todayStr.split('-').map(Number)
  return {
    year: y || 2026,
    monthIndex: (m ? m - 1 : 9), // 0-indexed (9 = Oktober)
  }
}

export function getTotalDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate()
}

export interface MonthDayInfo {
  date: string // YYYY-MM-DD
  dayNumber: number
  dayName: string
  dayShort: string
  isToday: boolean
}

export interface WeekPeriodInfo {
  weekNumber: number
  label: string
  startDay: number
  endDay: number
  startDate: string
  endDate: string
  days: MonthDayInfo[]
}

export function getDaysInMonth(year: number, monthIndex: number): MonthDayInfo[] {
  const totalDays = getTotalDaysInMonth(year, monthIndex)
  const todayStr = getTodayDateStr()
  const days: MonthDayInfo[] = []

  const pad = (n: number) => String(n).padStart(2, '0')
  const mStr = pad(monthIndex + 1)

  for (let d = 1; d <= totalDays; d++) {
    const dStr = pad(d)
    const dateStr = `${year}-${mStr}-${dStr}`
    const dateObj = new Date(year, monthIndex, d)
    const dayOfWeek = dateObj.getDay()

    days.push({
      date: dateStr,
      dayNumber: d,
      dayName: DAY_NAMES_ID[dayOfWeek],
      dayShort: DAY_NAMES_ID[dayOfWeek].slice(0, 3),
      isToday: dateStr === todayStr,
    })
  }

  return days
}

export function getWeeksInMonth(year: number, monthIndex: number): WeekPeriodInfo[] {
  const allDays = getDaysInMonth(year, monthIndex)
  const totalDays = allDays.length
  const monthName = MONTH_NAMES_ID[monthIndex]
  const todayStr = getTodayDateStr()

  const weeks: WeekPeriodInfo[] = []
  const weekRanges = [
    { num: 1, start: 1, end: Math.min(7, totalDays) },
    { num: 2, start: 8, end: Math.min(14, totalDays) },
    { num: 3, start: 15, end: Math.min(21, totalDays) },
    { num: 4, start: 22, end: Math.min(28, totalDays) },
  ]

  if (totalDays > 28) {
    weekRanges.push({ num: 5, start: 29, end: totalDays })
  }

  for (const wr of weekRanges) {
    const weekDays = allDays.slice(wr.start - 1, wr.end)
    const hasToday = weekDays.some((d) => d.date === todayStr)
    const suffix = hasToday ? ' - Minggu Ini' : ''
    const label = `Minggu ${wr.num} (${wr.start} - ${wr.end} ${monthName.slice(0, 3)}${suffix})`

    weeks.push({
      weekNumber: wr.num,
      label,
      startDay: wr.start,
      endDay: wr.end,
      startDate: weekDays[0]?.date || '',
      endDate: weekDays[weekDays.length - 1]?.date || '',
      days: weekDays,
    })
  }

  return weeks
}

export function formatDateIndonesian(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    const dayName = DAY_NAMES_ID[dateObj.getDay()]
    const monthName = MONTH_NAMES_ID[m - 1]
    return `${dayName}, ${d} ${monthName} ${y}`
  } catch {
    return dateStr
  }
}
