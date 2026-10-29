'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFilter,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { Card } from '@/components/ui'
import { MONTH_NAMES_ID, AVAILABLE_YEARS, getWeeksInMonth } from '@/lib/dateUtils'

export type PeriodMode = 'monthly' | 'weekly' | 'today'

interface PeriodFilterBarProps {
  periodMode: PeriodMode
  onPeriodModeChange: (mode: PeriodMode) => void
  selectedYear: number
  onYearChange: (year: number) => void
  selectedMonthIndex: number
  onMonthChange: (monthIndex: number) => void
  onResetToCurrentMonth: () => void
  selectedWeekNumber?: number
  onWeekChange?: (weekNumber: number) => void
  activePeriodLabel?: string
  badgeText?: string
  className?: string
}

export default function PeriodFilterBar({
  periodMode,
  onPeriodModeChange,
  selectedYear,
  onYearChange,
  selectedMonthIndex,
  onMonthChange,
  onResetToCurrentMonth,
  selectedWeekNumber = 1,
  onWeekChange,
  activePeriodLabel,
  badgeText,
  className = '',
}: PeriodFilterBarProps) {
  const weeksInMonth = getWeeksInMonth(selectedYear, selectedMonthIndex)

  const handlePrevMonth = () => {
    if (selectedMonthIndex === 0) {
      onMonthChange(11)
      onYearChange(selectedYear - 1)
    } else {
      onMonthChange(selectedMonthIndex - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonthIndex === 11) {
      onMonthChange(0)
      onYearChange(selectedYear + 1)
    } else {
      onMonthChange(selectedMonthIndex + 1)
    }
  }

  return (
    <Card className={`p-4 bg-surface border border-border ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Mode Switcher (Per Bulan | Per Minggu | Hari Ini) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-caption font-bold uppercase tracking-wider text-slate flex items-center gap-1.5 mr-1">
            <FontAwesomeIcon icon={faFilter} className="text-xs text-navy" />
            Periode:
          </span>
          <div className="inline-flex rounded-xl bg-slate-200/60 p-1 border border-border/60">
            <button
              type="button"
              onClick={() => onPeriodModeChange('monthly')}
              className={`px-3 py-1.5 rounded-lg text-caption font-bold transition-all cursor-pointer ${
                periodMode === 'monthly'
                  ? 'bg-white text-navy shadow-xs'
                  : 'text-slate hover:text-navy'
              }`}
            >
              Per Bulan
            </button>
            <button
              type="button"
              onClick={() => onPeriodModeChange('weekly')}
              className={`px-3 py-1.5 rounded-lg text-caption font-bold transition-all cursor-pointer ${
                periodMode === 'weekly'
                  ? 'bg-white text-navy shadow-xs'
                  : 'text-slate hover:text-navy'
              }`}
            >
              Per Minggu
            </button>
            <button
              type="button"
              onClick={() => {
                onPeriodModeChange('today')
                onResetToCurrentMonth()
              }}
              className={`px-3 py-1.5 rounded-lg text-caption font-bold transition-all cursor-pointer ${
                periodMode === 'today'
                  ? 'bg-white text-navy shadow-xs'
                  : 'text-slate hover:text-navy'
              }`}
            >
              Hari Ini
            </button>
          </div>
        </div>

        {/* Right: Month & Year Picker Controls */}
        {periodMode !== 'today' && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="h-8.5 w-8.5 rounded-lg border border-border bg-white hover:bg-slate-100 flex items-center justify-center text-navy transition-colors cursor-pointer"
                title="Bulan Sebelumnya"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
              </button>

              {/* Month Select */}
              <select
                value={selectedMonthIndex}
                onChange={(e) => onMonthChange(Number(e.target.value))}
                className="h-8.5 px-2.5 rounded-lg border border-border bg-white text-caption font-bold text-navy focus:outline-none focus:border-navy cursor-pointer"
              >
                {MONTH_NAMES_ID.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              {/* Year Select */}
              <select
                value={selectedYear}
                onChange={(e) => onYearChange(Number(e.target.value))}
                className="h-8.5 px-2 rounded-lg border border-border bg-white text-caption font-bold text-navy focus:outline-none focus:border-navy cursor-pointer"
              >
                {AVAILABLE_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleNextMonth}
                className="h-8.5 w-8.5 rounded-lg border border-border bg-white hover:bg-slate-100 flex items-center justify-center text-navy transition-colors cursor-pointer"
                title="Bulan Berikutnya"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
              </button>
            </div>

            <button
              type="button"
              onClick={onResetToCurrentMonth}
              className="h-8.5 px-2.5 rounded-lg border border-border bg-white hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Bulan Ini
            </button>
          </div>
        )}
      </div>

      {/* Sub-bar for Weekly Selector */}
      {periodMode === 'weekly' && onWeekChange && (
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate uppercase shrink-0">
            Pilih Minggu:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {weeksInMonth.map((w) => (
              <button
                key={w.weekNumber}
                type="button"
                onClick={() => onWeekChange(w.weekNumber)}
                className={`h-7.5 px-3 rounded-lg text-caption font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedWeekNumber === w.weekNumber
                    ? 'bg-navy text-white shadow-2xs font-bold'
                    : 'bg-white border border-border text-slate hover:text-navy hover:bg-slate-100'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Period Info */}
      {(activePeriodLabel || badgeText) && (
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate font-mono">
          <span>
            Menampilkan:{' '}
            <strong className="text-navy">{activePeriodLabel}</strong>
          </span>
          {badgeText && (
            <span className="text-navy font-semibold">{badgeText}</span>
          )}
        </div>
      )}
    </Card>
  )
}
