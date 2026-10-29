'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PeriodFilterBar, { type PeriodMode } from '@/components/layout/PeriodFilterBar'
import { Card, StatCard, Badge, Button, ProgressBar, showToast } from '@/components/ui'
import { Storage } from '@/lib/storage'
import type { DailyCapture } from '@/types'
import {
  MONTH_NAMES_ID,
  getCurrentYearAndMonth,
  getWeeksInMonth,
  getDaysInMonth,
  getTodayDateStr,
  formatDateIndonesian,
} from '@/lib/dateUtils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBed,
  faMoon,
  faSun,
  faClock,
  faHeartPulse,
  faBatteryFull,
  faPenToSquare,
  faPlus,
  faXmark,
  faLightbulb,
} from '@fortawesome/free-solid-svg-icons'

function calculateSleepDuration(bed: string, wake: string) {
  if (!bed || !wake) return { hours: 7, minutes: 30, totalHours: 7.5 }
  const [bh, bm] = bed.split(':').map(Number)
  const [wh, wm] = wake.split(':').map(Number)
  if (isNaN(bh) || isNaN(bm) || isNaN(wh) || isNaN(wm)) {
    return { hours: 7, minutes: 30, totalHours: 7.5 }
  }
  let bedMins = bh * 60 + bm
  let wakeMins = wh * 60 + wm
  if (wakeMins <= bedMins) {
    wakeMins += 24 * 60
  }
  const diffMins = wakeMins - bedMins
  const hours = Math.floor(diffMins / 60)
  const minutes = diffMins % 60
  const totalHours = Math.round((diffMins / 60) * 10) / 10
  return { hours, minutes, totalHours }
}

export default function SleepPage() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const [captures, setCaptures] = useState<DailyCapture[]>(() => {
    if (typeof window !== 'undefined') return Storage.getDailyCaptures()
    return []
  })

  // Period filter states
  const [periodMode, setPeriodMode] = useState<PeriodMode>('weekly')
  const { year: curYear, monthIndex: curMonthIndex } = getCurrentYearAndMonth()
  const [selectedYear, setSelectedYear] = useState(curYear)
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(curMonthIndex)
  const [selectedWeekNumber, setSelectedWeekNumber] = useState(1)

  // Quick Edit / Log Modal State
  const [showLogModal, setShowLogModal] = useState(false)
  const [modalDate, setModalDate] = useState(getTodayDateStr())
  const [modalBedTime, setModalBedTime] = useState('23:00')
  const [modalWakeTime, setModalWakeTime] = useState('06:30')

  // Auto-sync storage changes
  useEffect(() => {
    const refresh = () => {
      setCaptures(Storage.getDailyCaptures())
    }
    refresh()
    window.addEventListener('lifetime-data-change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('lifetime-data-change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  // Sync current active week on mount
  useEffect(() => {
    const todayStr = getTodayDateStr()
    const weeks = getWeeksInMonth(selectedYear, selectedMonthIndex)
    const active = weeks.find((w) => w.days.some((d) => d.date === todayStr))
    if (active) {
      setSelectedWeekNumber(active.weekNumber)
    }
  }, [selectedYear, selectedMonthIndex])

  const handleResetToCurrentMonth = () => {
    const { year, monthIndex } = getCurrentYearAndMonth()
    setSelectedYear(year)
    setSelectedMonthIndex(monthIndex)
    const weeks = getWeeksInMonth(year, monthIndex)
    const todayStr = getTodayDateStr()
    const active = weeks.find((w) => w.days.some((d) => d.date === todayStr))
    setSelectedWeekNumber(active ? active.weekNumber : 1)
  }

  // Days list according to period
  const allWeeks = getWeeksInMonth(selectedYear, selectedMonthIndex)
  const activeWeek = allWeeks.find((w) => w.weekNumber === selectedWeekNumber) || allWeeks[0]
  const allDaysInMonth = getDaysInMonth(selectedYear, selectedMonthIndex)
  const todayStr = getTodayDateStr()

  const currentPeriodDays =
    periodMode === 'today'
      ? allDaysInMonth.filter((d) => d.date === todayStr)
      : periodMode === 'weekly'
      ? activeWeek?.days || []
      : allDaysInMonth

  // Map each day to sleep capture
  const daysWithSleep = currentPeriodDays.map((d) => {
    const cap = captures.find((c) => c.date === d.date)
    const hasLog = Boolean(cap && cap.sleepHours)
    const bedTime = cap?.sleepBedTime || '23:00'
    const wakeTime = cap?.sleepWakeTime || '06:30'
    const hours = cap?.sleepHours || (hasLog ? 7.5 : 0)

    let quality: 'optimal' | 'cukup' | 'kurang' | 'unlogged' = 'unlogged'
    if (hasLog) {
      if (hours >= 7.0) quality = 'optimal'
      else if (hours >= 6.0) quality = 'cukup'
      else quality = 'kurang'
    }

    return {
      ...d,
      hasLog,
      bedTime,
      wakeTime,
      hours,
      quality,
    }
  })

  // Calculate Aggregates for Period
  const loggedDays = daysWithSleep.filter((d) => d.hasLog)
  const loggedCount = loggedDays.length
  const totalSleepHours = loggedDays.reduce((acc, d) => acc + d.hours, 0)
  const avgSleepHours = loggedCount > 0 ? Math.round((totalSleepHours / loggedCount) * 10) / 10 : 7.5
  const optimalNightsCount = loggedDays.filter((d) => d.hours >= 7.0).length

  // Sleep debt (target: 7.5 hours / logged day or period days)
  const targetTotalPeriod = (loggedCount > 0 ? loggedCount : currentPeriodDays.length) * 7.5
  const sleepDebt = Math.round((totalSleepHours - targetTotalPeriod) * 10) / 10

  // Circadian stability calculation
  let circadianStability = 'Cukup Teratur'
  if (loggedDays.length >= 2) {
    const minuteOffsets = loggedDays.map((d) => {
      const [h, m] = d.bedTime.split(':').map(Number)
      const adjH = h < 12 ? h + 24 : h
      return adjH * 60 + m
    })
    const avgMin = minuteOffsets.reduce((a, b) => a + b, 0) / minuteOffsets.length
    const variance =
      minuteOffsets.reduce((acc, val) => acc + Math.pow(val - avgMin, 2), 0) / minuteOffsets.length
    const stdDev = Math.sqrt(variance)

    if (stdDev <= 30) circadianStability = 'Sangat Disiplin (±15m)'
    else if (stdDev <= 60) circadianStability = 'Cukup Teratur (±40m)'
    else circadianStability = 'Jadwal Fluktuatif'
  }

  // Recovery score (0-100%)
  const recoveryScore = Math.min(
    100,
    Math.max(45, Math.round((avgSleepHours / 7.5) * 85 + (optimalNightsCount / (loggedCount || 1)) * 15))
  )

  // Open Quick Edit Modal for a specific date
  const handleOpenEdit = (date: string, curBed = '23:00', curWake = '06:30') => {
    setModalDate(date)
    setModalBedTime(curBed)
    setModalWakeTime(curWake)
    setShowLogModal(true)
  }

  // Save Sleep Modal
  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault()
    const calc = calculateSleepDuration(modalBedTime, modalWakeTime)
    Storage.saveSleep(modalDate, modalBedTime, modalWakeTime, calc.totalHours)
    setCaptures(Storage.getDailyCaptures())
    setShowLogModal(false)
    showToast(
      `Jam tidur tanggal ${modalDate} tersimpan: ${calc.hours}j ${calc.minutes > 0 ? `${calc.minutes}m` : ''} (${calc.totalHours} jam)`,
      'success'
    )
  }

  const liveCalc = calculateSleepDuration(modalBedTime, modalWakeTime)

  if (!mounted) {
    return (
      <DashboardLayout title="Tidur & Recovery" subtitle="Analisis jam tidur, konsistensi ritme sirkadian & pemulihan fisik">
        <div className="flex items-center justify-center min-h-100">
          <div className="h-8 w-8 rounded-full border-2 border-navy border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Tidur & Recovery"
      subtitle="Pemantauan durasi istirahat, ritme sirkadian & kesiapan fisik"
    >
      <div className="space-y-6 pb-16">
        {/* Unified Period Navigation Bar */}
        <PeriodFilterBar
          periodMode={periodMode}
          onPeriodModeChange={setPeriodMode}
          selectedYear={selectedYear}
          onYearChange={(y) => {
            setSelectedYear(y)
            setSelectedWeekNumber(1)
          }}
          selectedMonthIndex={selectedMonthIndex}
          onMonthChange={(m) => {
            setSelectedMonthIndex(m)
            setSelectedWeekNumber(1)
          }}
          onResetToCurrentMonth={handleResetToCurrentMonth}
          selectedWeekNumber={selectedWeekNumber}
          onWeekChange={setSelectedWeekNumber}
          activePeriodLabel={
            periodMode === 'today'
              ? `Hari Ini (${formatDateIndonesian(todayStr)})`
              : periodMode === 'monthly'
              ? `${MONTH_NAMES_ID[selectedMonthIndex]} ${selectedYear}`
              : `${activeWeek?.label || ''} (${selectedYear})`
          }
          badgeText={`Rata-rata: ${avgSleepHours} Jam / Malam`}
        />

        {/* 4 Stat Cards: Weekly Sleep Clarity */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <StatCard
            label="Rata-rata Tidur"
            value={`${avgSleepHours} Jam`}
            sublabel={avgSleepHours >= 7 ? 'Target 7.5j tercapai optimal' : 'Defisit istirahat'}
            icon={faBed}
            color={avgSleepHours >= 7 ? 'sage' : 'navy'}
            trend={`${optimalNightsCount} malam optimal (≥7j)`}
            trendUp={avgSleepHours >= 7}
          />

          <StatCard
            label="Ritme Sirkadian"
            value={circadianStability.split('(')[0].trim()}
            sublabel="Konsistensi jam tidur harian"
            icon={faMoon}
            color="info"
            trend={circadianStability}
            trendUp={!circadianStability.includes('Fluktuatif')}
          />

          <StatCard
            label="Hutang Tidur (Debt)"
            value={sleepDebt >= 0 ? `+${sleepDebt} Jam` : `${sleepDebt} Jam`}
            sublabel={sleepDebt >= 0 ? 'Surplus jam pemulihan' : 'Defisit istirahat mingguan'}
            icon={faClock}
            color={sleepDebt >= 0 ? 'sage' : 'warning'}
            trend={sleepDebt >= 0 ? 'Pemulihan tuntas' : 'Perlu tidur lebih awal'}
            trendUp={sleepDebt >= 0}
          />

          <StatCard
            label="Skor Recovery"
            value={`${recoveryScore}%`}
            sublabel="Kesiapan fisik & fokus"
            icon={faBatteryFull}
            color={recoveryScore >= 75 ? 'sage' : 'warning'}
            trend="Sinkron dengan Gym bulk"
            trendUp={recoveryScore >= 75}
          />
        </div>

        {/* Action Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-navy text-white flex items-center justify-center shrink-0 shadow-xs">
              <FontAwesomeIcon icon={faBed} className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-body sm:text-h4 font-heading font-bold text-navy">
                {periodMode === 'today'
                  ? 'Catatan Jam Tidur Hari Ini'
                  : periodMode === 'weekly'
                  ? `Breakdown Tidur ${activeWeek?.label || 'Minggu Ini'}`
                  : `Matriks Tidur Bulan ${MONTH_NAMES_ID[selectedMonthIndex]} ${selectedYear}`}
              </h3>
              <p className="text-caption text-slate">
                Target ideal 7.5 – 8.0 jam untuk regenerasi sel otot & konsentrasi kerja
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenEdit(todayStr)}
            className="gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
          >
            <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
            <span>Catat Jam Tidur</span>
          </Button>
        </div>

        {/* 1. WEEKLY BREAKDOWN: 7-Day Visual Strip (Senin - Minggu) */}
        {periodMode === 'weekly' && (
          <Card className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h4 className="text-body-sm font-heading font-bold text-navy">
                  Grafik 7 Hari & Konsistensi Jam Tidur
                </h4>
                <span className="text-[11px] text-slate font-medium">
                  Garis putus-putus vertikal adalah garis target optimal 7.5 Jam
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Optimal (≥7j)
                </span>
                <span className="flex items-center gap-1 text-amber-700">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Cukup (6-7j)
                </span>
                <span className="flex items-center gap-1 text-red-700">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Kurang (&lt;6j)
                </span>
              </div>
            </div>

            {/* List of 7 Days */}
            <div className="space-y-3">
              {daysWithSleep.map((day) => {
                const isToday = day.date === todayStr
                const pct = Math.min(100, Math.round((day.hours / 10) * 100))

                return (
                  <div
                    key={day.date}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isToday
                        ? 'border-navy bg-navy/5 shadow-2xs'
                        : 'border-border/80 bg-surface hover:border-slate/40'
                    }`}
                  >
                    {/* Left: Day & Date */}
                    <div className="min-w-36 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-body-sm font-heading font-bold text-navy">
                          {day.dayName}
                        </span>
                        {isToday && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-navy text-white uppercase">
                            Hari Ini
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate font-mono">
                        {formatDateIndonesian(day.date).split(',')[1]?.trim() || day.date}
                      </span>
                    </div>

                    {/* Middle: Horizontal Bar with 7.5h Target Line */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                        {/* Target line at 75% (7.5 hours / 10 max) */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-navy/40 z-10"
                          style={{ left: '75%' }}
                          title="Target 7.5 Jam"
                        />
                        {day.hasLog ? (
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              day.hours >= 7.0
                                ? 'bg-emerald-500'
                                : day.hours >= 6.0
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        ) : (
                          <div className="h-full w-full bg-slate-200/50 flex items-center justify-center text-[10px] text-slate font-mono">
                            Belum dicatat
                          </div>
                        )}
                      </div>

                      {/* Time Details Pill */}
                      <div className="flex items-center justify-between text-[11px] mt-1.5 text-slate font-mono">
                        {day.hasLog ? (
                          <>
                            <span>
                              Masuk: <strong>{day.bedTime}</strong> → Bangun: <strong>{day.wakeTime}</strong>
                            </span>
                            <span className="font-bold text-navy">
                              {day.hours} Jam Istirahat
                            </span>
                          </>
                        ) : (
                          <span>Gunakan tombol untuk catat jam tidur hari ini</span>
                        )}
                      </div>
                    </div>

                    {/* Right: Badge & Action */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {day.hasLog ? (
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            day.quality === 'optimal'
                              ? 'bg-emerald-100 text-emerald-800'
                              : day.quality === 'cukup'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {day.quality}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          Kosong
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(day.date, day.bedTime, day.wakeTime)}
                        className="h-7 px-2.5 rounded-lg border border-border bg-white hover:bg-slate-100 text-navy text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Koreksi jam tidur"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} className="text-[10px]" />
                        <span>{day.hasLog ? 'Ubah' : 'Catat'}</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Smart Recovery & Productivity Advice */}
            <div className="p-4 rounded-xl bg-slate-50 border border-border text-[12px] text-navy flex items-start gap-3 mt-4">
              <FontAwesomeIcon icon={faLightbulb} className="text-navy text-base mt-0.5 shrink-0" />
              <div className="space-y-1">
                <strong className="block font-heading font-bold text-navy text-body-sm">
                  Evaluasi & Rekomendasi Pemulihan Fisik
                </strong>
                {sleepDebt < 0 ? (
                  <p className="leading-relaxed">
                    Minggu ini Anda memiliki <strong>defisit tidur {Math.abs(sleepDebt)} jam</strong>. Untuk menjaga fokus kerja dan memaksimalkan sintesis protein hasil latihan gym, disarankan malam ini memajukan jam tidur 30–45 menit lebih awal (pukul 22:30).
                  </p>
                ) : (
                  <p className="leading-relaxed">
                    Luar biasa! Jam istirahat Anda minggu ini <strong>surplus +{sleepDebt} jam</strong> dan optimal. Kesiapan fisik berada di puncaknya, sangat ideal untuk beban progresif saat latihan Push/Pull Day di gym!
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* 2. MONTHLY VIEW: Full Calendar Heatmap Grid */}
        {periodMode === 'monthly' && (
          <Card className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
              <div>
                <h4 className="text-body-sm font-heading font-bold text-navy">
                  Kalender Tidur Bulanan ({MONTH_NAMES_ID[selectedMonthIndex]} {selectedYear})
                </h4>
                <span className="text-[11px] text-slate font-medium">
                  Klik kotak tanggal mana pun untuk melihat atau mengoreksi jam tidur
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate">
                Total: <strong>{totalSleepHours} Jam</strong> • Optimal: <strong>{optimalNightsCount} Malam</strong>
              </div>
            </div>

            {/* Grid of days in the month */}
            <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-7 gap-2">
              {daysWithSleep.map((day) => {
                const isToday = day.date === todayStr

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => handleOpenEdit(day.date, day.bedTime, day.wakeTime)}
                    className={`p-3 rounded-xl border text-left transition-all hover:scale-102 cursor-pointer flex flex-col justify-between min-h-22 ${
                      isToday
                        ? 'border-navy bg-navy/5 shadow-2xs font-bold'
                        : day.hasLog
                        ? day.quality === 'optimal'
                          ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
                          : day.quality === 'cukup'
                          ? 'border-amber-200 bg-amber-50/50 hover:bg-amber-50'
                          : 'border-red-200 bg-red-50/50 hover:bg-red-50'
                        : 'border-border/60 bg-surface hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                      <span className="font-bold text-navy">{day.dayNumber} {day.dayShort}</span>
                      {isToday && (
                        <span className="h-1.5 w-1.5 rounded-full bg-navy" />
                      )}
                    </div>

                    {day.hasLog ? (
                      <div className="space-y-0.5 mt-auto">
                        <span className="text-caption font-mono font-bold text-navy block">
                          {day.hours} Jam
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block truncate">
                          {day.bedTime}-{day.wakeTime}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-auto text-[10px] text-slate-400 font-mono">
                        -
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </Card>
        )}

        {/* 3. TODAY VIEW: Spotlight Single Day Focus */}
        {periodMode === 'today' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faMoon} className="text-navy text-sm" />
                  <h4 className="text-body font-heading font-bold text-navy">
                    Ringkasan Tidur Semalam
                  </h4>
                </div>
                <Badge variant={avgSleepHours >= 7 ? 'success' : 'warning'}>
                  {avgSleepHours} Jam Istirahat
                </Badge>
              </div>

              {daysWithSleep[0]?.hasLog ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-border">
                      <span className="text-[10px] text-slate uppercase font-medium block mb-1">
                        Jam Masuk Tidur
                      </span>
                      <span className="text-h4 font-mono font-bold text-navy">
                        {daysWithSleep[0].bedTime}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-border">
                      <span className="text-[10px] text-slate uppercase font-medium block mb-1">
                        Jam Bangun Pagi
                      </span>
                      <span className="text-h4 font-mono font-bold text-navy">
                        {daysWithSleep[0].wakeTime}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-caption text-emerald-900">
                    Kualitas: <strong>{daysWithSleep[0].quality.toUpperCase()}</strong>. Tubuh Anda terevitalisasi dengan baik untuk beraktivitas hari ini.
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-border rounded-xl">
                  <p className="text-body-sm font-medium text-navy">Belum mencatat jam tidur semalam.</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenEdit(todayStr)}
                    className="mt-3"
                  >
                    Catat Sekarang
                  </Button>
                </div>
              )}
            </Card>

            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faHeartPulse} className="text-red-600 text-sm" />
                  <h4 className="text-body font-heading font-bold text-navy">
                    Kesiapan Energi & Kebugaran
                  </h4>
                </div>
                <span className="text-caption font-bold text-navy">
                  {recoveryScore}% Kesiapan
                </span>
              </div>

              <div className="space-y-3 text-body-sm text-slate-700 leading-relaxed font-body">
                <p>
                  Berdasarkan durasi tidur semalam, otot tubuh berada dalam tahap pemulihan yang <strong>{avgSleepHours >= 7 ? 'Sangat Baik' : 'Cukup'}</strong>.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 border border-border space-y-1 text-caption">
                  <div>• <strong>Fokus Kerja:</strong> Daya konsentrasi tajam, aman untuk 2-3 sesi deep work.</div>
                  <div>• <strong>Gym & Fitness:</strong> Pasokan glikogen terisi, aman untuk angkat beban Push Day.</div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Quick Edit / Log Sleep Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm"
            onClick={() => setShowLogModal(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-surface border border-border shadow-2xl p-5 z-10 animate-scale-in">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faBed} className="text-navy text-sm" />
                <h3 className="text-h4 font-heading font-bold text-navy">
                  Catat Jam Tidur
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="h-8 w-8 rounded-lg text-slate hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSleep} className="space-y-4">
              <div>
                <label className="text-caption font-medium text-navy block mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={modalDate}
                  onChange={(e) => setModalDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-body-sm font-mono text-navy focus:outline-none focus:border-navy"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-caption font-medium text-navy block mb-1 flex items-center gap-1">
                    <FontAwesomeIcon icon={faMoon} className="text-[11px] text-navy" />
                    <span>Jam Masuk Tidur</span>
                  </label>
                  <input
                    type="time"
                    value={modalBedTime}
                    onChange={(e) => setModalBedTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-body-sm font-mono font-bold text-navy focus:outline-none focus:border-navy"
                    required
                  />
                </div>

                <div>
                  <label className="text-caption font-medium text-navy block mb-1 flex items-center gap-1">
                    <FontAwesomeIcon icon={faSun} className="text-[11px] text-amber-600" />
                    <span>Jam Bangun Pagi</span>
                  </label>
                  <input
                    type="time"
                    value={modalWakeTime}
                    onChange={(e) => setModalWakeTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-body-sm font-mono font-bold text-navy focus:outline-none focus:border-navy"
                    required
                  />
                </div>
              </div>

              {/* Total Duration Live Preview */}
              <div className="p-3 rounded-xl bg-slate-50 border border-border flex items-center justify-between text-body-sm">
                <span className="text-slate font-medium">Total Istirahat:</span>
                <span className="font-mono font-bold text-navy">
                  {liveCalc.hours} Jam {liveCalc.minutes > 0 ? `${liveCalc.minutes}m` : ''} ({liveCalc.totalHours}j)
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setShowLogModal(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="md">
                  Simpan Jam Tidur
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
