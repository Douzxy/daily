'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import HabitsWidget from '@/components/modules/HabitsWidget'
import { Card } from '@/components/ui'
import { Storage } from '@/lib/storage'
import type { Habit } from '@/types'
import { MONTH_NAMES_ID, getCurrentYearAndMonth, getDaysInMonth, getTodayDateStr } from '@/lib/dateUtils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFire, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

const WEEKDAY_HEADERS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export default function HabitsPage() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const [habits, setHabits] = useState<Habit[]>(() =>
    typeof window !== 'undefined' ? Storage.getHabits() : []
  )
  const [loaded, setLoaded] = useState<boolean>(() =>
    typeof window !== 'undefined' ? Storage.hasHabitsLoaded() : false
  )

  const now = getCurrentYearAndMonth()
  const [viewYear, setViewYear] = useState(now.year)
  const [viewMonth, setViewMonth] = useState(now.monthIndex)

  useEffect(() => {
    const refresh = () => {
      setHabits(Storage.getHabits())
      setLoaded(Storage.hasHabitsLoaded())
    }
    refresh()
    // Always pull the latest from the database when opening this page
    Storage.syncFromDatabase()
      .then(refresh)
      .catch(() => {})
    window.addEventListener('lifetime-data-change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('lifetime-data-change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  if (!mounted) {
    return (
      <DashboardLayout title="Habits">
        <div className="flex items-center justify-center min-h-100">
          <div className="h-8 w-8 rounded-full border-2 border-navy border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  const todayStr = getTodayDateStr()
  const total = habits.length
  const doneToday = habits.filter((h) => h.completedToday).length
  const pctToday = total > 0 ? Math.round((doneToday / total) * 100) : 0
  const best = habits.reduce<Habit | null>((acc, h) => (!acc || h.streak > acc.streak ? h : acc), null)

  // Month calendar
  const monthDays = getDaysInMonth(viewYear, viewMonth)
  const firstWeekday = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7 // Monday = 0
  const isCurrentMonth = viewYear === now.year && viewMonth === now.monthIndex
  const cells = monthDays.map((d) => {
    const isFuture = d.date > todayStr
    const count = habits.reduce((n, h) => n + (h.history?.[d.date] ? 1 : 0), 0)
    const ratio = total > 0 ? count / total : 0
    return { ...d, count, ratio, isFuture }
  })
  const pastCells = cells.filter((c) => !c.isFuture)
  const monthDone = pastCells.reduce((n, c) => n + c.count, 0)
  const monthPossible = pastCells.length * total
  const monthPct = monthPossible > 0 ? Math.round((monthDone / monthPossible) * 100) : 0

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  const cellColor = (ratio: number, isFuture: boolean) => {
    if (isFuture) return 'bg-transparent text-slate-300 border border-dashed border-border'
    if (ratio >= 1) return 'bg-emerald-600 text-white'
    if (ratio >= 0.5) return 'bg-emerald-400 text-white'
    if (ratio > 0) return 'bg-emerald-200 text-emerald-900'
    return 'bg-slate-100 text-slate-500'
  }

  return (
    <DashboardLayout title="Habits">
      <div className="space-y-5 pb-12 max-w-3xl">
        {/* Today summary */}
        <section aria-labelledby="habit-today-heading" className="rounded-2xl bg-navy text-white p-5 sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 id="habit-today-heading" className="text-caption text-white/70 font-medium">
                Hari ini
              </h1>
              <p className="font-heading font-bold text-[34px] leading-none mt-1.5 tabular-nums">
                {doneToday}
                <span className="text-white/50 text-h4 font-semibold"> / {total}</span>
              </p>
              <p className="text-body-sm text-white/80 mt-1.5">
                {total === 0
                  ? 'Belum ada habit'
                  : doneToday === total
                  ? 'Semua beres. Mantap!'
                  : `${total - doneToday} lagi untuk hari ini`}
              </p>
            </div>
            {best && best.streak > 0 && (
              <div className="text-right">
                <p className="inline-flex items-center gap-1.5 text-body font-heading font-bold">
                  <FontAwesomeIcon icon={faFire} className="h-4 w-4 text-amber-400" />
                  {best.streak} hari
                </p>
                <p className="text-[11px] text-white/60 mt-0.5 wrap-break-word">{best.name}</p>
              </div>
            )}
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-500 ease-out"
              style={{ width: `${pctToday}%` }}
            />
          </div>
        </section>

        {/* Habit list */}
        <HabitsWidget
          habits={habits}
          loading={!loaded}
          onToggleHabit={(id) => setHabits(Storage.toggleHabit(id))}
          onToggleDate={(id, date) => setHabits(Storage.toggleHabitForDate(id, date))}
          onAddHabit={(name, category) => {
            Storage.addHabit({ name, category, icon: 'CircleCheck' })
            setHabits(Storage.getHabits())
          }}
          onEditHabit={(id, updates) => setHabits(Storage.updateHabit(id, updates))}
          onDeleteHabit={(id) => setHabits(Storage.deleteHabit(id))}
        />

        {/* Monthly calendar */}
        <Card className="p-4! sm:p-5!">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-body-lg font-heading font-bold text-navy">
                {MONTH_NAMES_ID[viewMonth]} {viewYear}
              </h2>
              <p className="text-caption text-slate">
                {monthPossible > 0 ? `${monthPct}% konsisten (${monthDone}/${monthPossible})` : 'Belum ada data'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                id="habit-prev-month"
                onClick={() => shiftMonth(-1)}
                className="h-9 w-9 rounded-lg border border-border text-navy hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                aria-label="Bulan sebelumnya"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3" />
              </button>
              <button
                type="button"
                id="habit-next-month"
                onClick={() => shiftMonth(1)}
                disabled={isCurrentMonth}
                className="h-9 w-9 rounded-lg border border-border text-navy hover:bg-slate-50 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Bulan berikutnya"
              >
                <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {WEEKDAY_HEADERS.map((w) => (
              <span key={w} className="text-[10px] font-medium text-slate pb-1">
                {w}
              </span>
            ))}
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {cells.map((c) => (
              <div
                key={c.date}
                title={c.isFuture ? c.date : `${c.date}: ${c.count}/${total} selesai`}
                className={`aspect-square max-h-12 rounded-lg flex items-center justify-center text-[11px] font-semibold tabular-nums ${cellColor(
                  c.ratio,
                  c.isFuture
                )} ${c.isToday ? 'ring-2 ring-offset-1 ring-navy' : ''}`}
              >
                {c.dayNumber}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-1.5 mt-4 text-[10px] text-slate">
            <span>Sedikit</span>
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-100" />
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-200" />
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />
            <span>Semua</span>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
