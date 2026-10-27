'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import SholatWidget from '@/components/modules/SholatWidget'
import PeriodFilterBar, { type PeriodMode } from '@/components/layout/PeriodFilterBar'
import { Card, StatCard, Badge, showToast } from '@/components/ui'
import { Storage, authFetch } from '@/lib/storage'
import type { PrayerStatus, PrayerName } from '@/types'
import {
  MONTH_NAMES_ID,
  getCurrentYearAndMonth,
  getWeeksInMonth,
  getDaysInMonth,
  getTodayDateStr,
  formatDateIndonesian,
  DAY_NAMES_ID,
} from '@/lib/dateUtils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMosque,
  faFire,
  faBookOpen,
  faCircleCheck,
  faCalendarWeek,
  faChartPie,
  faCheck,
} from '@fortawesome/free-solid-svg-icons'

const PRAYER_KEYS: PrayerName[] = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya']
const PRAYER_LABELS: Record<PrayerName, string> = {
  subuh: 'Subuh',
  dzuhur: 'Dzuhur',
  ashar: 'Ashar',
  maghrib: 'Maghrib',
  isya: 'Isya',
}

export default function SholatPage() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const [prayerStatus, setPrayerStatus] = useState<PrayerStatus>(() => {
    if (typeof window !== 'undefined') return Storage.getPrayerStatus()
    return {
      date: getTodayDateStr(),
      prayers: { subuh: false, dzuhur: false, ashar: false, maghrib: false, isya: false },
      streak: 0,
    }
  })

  // Prayer history map: { [dateStr]: { subuh: bool, dzuhur: bool, ashar: bool, maghrib: bool, isya: bool } }
  const [historyMap, setHistoryMap] = useState<
    Record<string, { subuh: boolean; dzuhur: boolean; ashar: boolean; maghrib: boolean; isya: boolean }>
  >(() => {
    if (typeof window !== 'undefined') return Storage.getPrayerHistoryMap()
    return {}
  })

  // Period Navigation State (Mode: monthly | weekly | all)
  const initialDate = getCurrentYearAndMonth()
  const [periodMode, setPeriodMode] = useState<PeriodMode>('weekly')
  const [selectedYear, setSelectedYear] = useState<number>(initialDate.year)
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(initialDate.monthIndex)
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(() => {
    const today = getTodayDateStr()
    const day = parseInt(today.split('-')[2] || '1', 10)
    if (day <= 7) return 1
    if (day <= 14) return 2
    if (day <= 21) return 3
    if (day <= 28) return 4
    return 5
  })

  useEffect(() => {
    let ignore = false
    const loadPrayers = async () => {
      try {
        const res = await authFetch('/api/prayers')
        const json = await res.json()
        if (!ignore && json && json.success) {
          if (json.today) setPrayerStatus(json.today)
          if (json.history && Array.isArray(json.history)) {
            const map = Storage.getPrayerHistoryMap()
            for (const h of json.history) {
              if (h && h.date) {
                map[h.date] = {
                  subuh: Boolean(h.subuh),
                  dzuhur: Boolean(h.dzuhur),
                  ashar: Boolean(h.ashar),
                  maghrib: Boolean(h.maghrib),
                  isya: Boolean(h.isya),
                }
              }
            }
            setHistoryMap({ ...map })
          }
        }
      } catch (e) {
        console.warn('Failed to fetch prayers from DB:', e)
      }
    }

    loadPrayers()

    const onDataChange = () => {
      setPrayerStatus(Storage.getPrayerStatus())
      setHistoryMap(Storage.getPrayerHistoryMap())
    }

    window.addEventListener('lifetime-data-change', onDataChange)
    window.addEventListener('storage', onDataChange)
    return () => {
      ignore = true
      window.removeEventListener('lifetime-data-change', onDataChange)
      window.removeEventListener('storage', onDataChange)
    }
  }, [])

  const handleToggleToday = (prayer: PrayerName) => {
    const updated = Storage.togglePrayer(prayer)
    setPrayerStatus(updated)
    setHistoryMap(Storage.getPrayerHistoryMap())
  }

  const handleTogglePastPrayer = (dateStr: string, prayer: PrayerName) => {
    const updatedRecord = Storage.togglePrayerForDate(dateStr, prayer)
    setHistoryMap((prev) => ({
      ...prev,
      [dateStr]: updatedRecord as any,
    }))
    if (dateStr === getTodayDateStr()) {
      setPrayerStatus(Storage.getPrayerStatus())
    }
    const isDone = updatedRecord[prayer]
    showToast(
      `${PRAYER_LABELS[prayer]} ${formatDateIndonesian(dateStr)} ditandai ${isDone ? 'selesai' : 'belum'}`,
      isDone ? 'success' : 'info'
    )
  }

  // Weeks and days for chosen month & year
  const weeksInMonth = getWeeksInMonth(selectedYear, selectedMonthIndex)
  const activeWeek =
    weeksInMonth.find((w) => w.weekNumber === selectedWeekNumber) || weeksInMonth[0]
  const allDaysInMonth = getDaysInMonth(selectedYear, selectedMonthIndex)

  // Construct displayed days depending on periodMode
  const todayStr = getTodayDateStr()
  const [ty, tm, td] = todayStr.split('-').map(Number)
  const todayDateObj = new Date(ty, (tm || 1) - 1, td || 1)
  const todayDayOfWeek = todayDateObj.getDay()
  const todayDayItem = {
    date: todayStr,
    dayNumber: td || 1,
    dayName: DAY_NAMES_ID[todayDayOfWeek],
    dayShort: DAY_NAMES_ID[todayDayOfWeek]?.slice(0, 3) || 'Hri',
    isToday: true,
  }

  let displayedDays: Array<{
    date: string
    dayNumber: number
    dayName: string
    dayShort: string
    isToday: boolean
  }> = []

  if (periodMode === 'today') {
    displayedDays = [todayDayItem]
  } else if (periodMode === 'weekly') {
    displayedDays = activeWeek?.days || []
  } else {
    displayedDays = allDaysInMonth
  }

  // Calculate statistics for the displayed days
  const totalPossible = displayedDays.length * 5
  let totalDone = 0
  const breakdown: Record<PrayerName, number> = {
    subuh: 0,
    dzuhur: 0,
    ashar: 0,
    maghrib: 0,
    isya: 0,
  }

  for (const day of displayedDays) {
    const rec = historyMap[day.date] || {
      subuh: false,
      dzuhur: false,
      ashar: false,
      maghrib: false,
      isya: false,
    }
    for (const p of PRAYER_KEYS) {
      if (rec[p]) {
        totalDone++
        breakdown[p]++
      }
    }
  }

  const complianceRate =
    totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0

  const handleResetToCurrentMonth = () => {
    const now = getCurrentYearAndMonth()
    setSelectedYear(now.year)
    setSelectedMonthIndex(now.monthIndex)
    const today = getTodayDateStr()
    const day = parseInt(today.split('-')[2] || '1', 10)
    if (day <= 7) setSelectedWeekNumber(1)
    else if (day <= 14) setSelectedWeekNumber(2)
    else if (day <= 21) setSelectedWeekNumber(3)
    else if (day <= 28) setSelectedWeekNumber(4)
    else setSelectedWeekNumber(5)
    showToast('Menampilkan bulan & minggu saat ini', 'info')
  }

  if (!mounted) {
    return (
      <DashboardLayout title="Sholat Tracker" subtitle="Pantau ibadah 5 waktu">
        <div className="flex items-center justify-center min-h-100">
          <div className="h-8 w-8 rounded-full border-2 border-navy border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  const doneTodayCount = Object.values(prayerStatus.prayers).filter(Boolean).length

  return (
    <DashboardLayout title="Sholat">
      <div className="space-y-6 pb-12">
        {/* Top Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Sholat Hari Ini"
            value={`${doneTodayCount}/5`}
            sublabel={`${Math.round((doneTodayCount / 5) * 100)}% terselesaikan`}
            icon={faMosque}
            color={doneTodayCount === 5 ? 'sage' : 'navy'}
          />

          <StatCard
            label={`Kepatuhan ${periodMode === 'weekly' ? 'Mingguan' : periodMode === 'monthly' ? 'Bulanan' : 'Hari Ini'}`}
            value={`${complianceRate}%`}
            sublabel={`${totalDone} dari ${totalPossible} sholat tertunaikan`}
            icon={faChartPie}
            color="sage"
            trend={
              periodMode === 'weekly'
                ? activeWeek?.label.split('(')[0].trim() || 'Mingguan'
                : periodMode === 'monthly'
                ? `${MONTH_NAMES_ID[selectedMonthIndex]} ${selectedYear}`
                : 'Hari Ini'
            }
            trendUp={complianceRate >= 70}
          />

          <StatCard
            label="Current Streak"
            value={`${prayerStatus.streak} Hari`}
            sublabel="Konsistensi ibadah tanpa putus"
            icon={faFire}
            color="warning"
            trend="Aktif Real-time"
            trendUp={true}
          />
        </div>

        {/* Sholat Widget Main (Hari Ini) */}
        <SholatWidget status={prayerStatus} onToggle={handleToggleToday} />

        {/* Unified Month & Week Historical Navigator Bar */}
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
          badgeText={`Kepatuhan: ${complianceRate}% (${totalDone}/${totalPossible})`}
        />

        {/* Detailed Prayer History Grid & Interactive Toggles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Days and Interactive Prayer Chips (2 Cols) */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-navy/10 text-navy flex items-center justify-center">
                  <FontAwesomeIcon icon={faCalendarWeek} className="h-4 w-4 text-navy" />
                </div>
                <div>
                  <h3 className="text-body-sm font-heading font-bold text-navy">
                    Riwayat Sholat {periodMode === 'today' ? `Hari Ini (${formatDateIndonesian(todayStr)})` : periodMode === 'weekly' ? activeWeek?.label : `${MONTH_NAMES_ID[selectedMonthIndex]} ${selectedYear}`}
                  </h3>
                  <span className="text-caption text-slate">
                    Klik chip sholat (Subuh s/d Isya) pada hari mana pun untuk menandai atau mengubah riwayat
                  </span>
                </div>
              </div>
              <Badge variant={complianceRate >= 80 ? 'success' : 'warning'}>
                {complianceRate}% Kepatuhan
              </Badge>
            </div>

            <div className="space-y-3">
              {displayedDays.map((d) => {
                const rec = historyMap[d.date] || {
                  subuh: false,
                  dzuhur: false,
                  ashar: false,
                  maghrib: false,
                  isya: false,
                }
                const dayDone = PRAYER_KEYS.filter((p) => rec[p]).length
                const isToday = d.date === getTodayDateStr()

                return (
                  <div
                    key={d.date}
                    className={`p-3 rounded-xl border transition-all ${
                      isToday
                        ? 'border-navy bg-navy/5 shadow-2xs'
                        : 'border-border bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-navy text-body-sm">
                          {d.dayName}, {d.dayNumber} {MONTH_NAMES_ID[parseInt(d.date.split('-')[1] || '1', 10) - 1]?.slice(0, 3)}
                        </span>
                        {isToday && (
                          <Badge variant="success" className="text-[10px] py-0 px-2">
                            Hari Ini
                          </Badge>
                        )}
                        <span className="text-[10px] font-mono text-slate bg-slate-100 px-1.5 py-0.2 rounded">
                          {d.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="font-mono font-bold text-navy text-caption">
                          {dayDone}/5 Selesai
                        </span>
                        {dayDone === 5 ? (
                          <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4 text-sage" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-amber-500" />
                        )}
                      </div>
                    </div>

                    {/* Interactive 5 Prayer Chips */}
                    <div className="grid grid-cols-5 gap-1.5">
                      {PRAYER_KEYS.map((prayer) => {
                        const done = Boolean(rec[prayer])
                        return (
                          <button
                            key={prayer}
                            type="button"
                            onClick={() => handleTogglePastPrayer(d.date, prayer)}
                            className={`py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer select-none ${
                              done
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs font-bold'
                                : 'bg-white text-slate-500 border-border hover:border-slate hover:bg-slate-50 font-medium'
                            }`}
                            title={`Klik untuk tandai ${PRAYER_LABELS[prayer]} ${d.date} (${done ? 'sudah' : 'belum'})`}
                          >
                            <span className="block text-[10px] uppercase tracking-wider">
                              {PRAYER_LABELS[prayer]}
                            </span>
                            <div className="flex items-center justify-center mt-0.5 text-xs">
                              {done ? (
                                <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                              ) : (
                                <span className="text-[10px] text-slate-400">•</span>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Right: Summary Evaluation & Breakdown Card */}
          <div className="space-y-6">
            <Card className="bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-lg bg-navy/10 text-navy flex items-center justify-center">
                  <FontAwesomeIcon icon={faBookOpen} className="h-4 w-4 text-navy" />
                </div>
                <div>
                  <h3 className="text-body-sm font-heading font-bold text-navy">
                    Pengingat & Nilai Ibadah
                  </h3>
                  <span className="text-caption text-slate">Panduan kedisiplinan 5 waktu</span>
                </div>
              </div>

              <blockquote className="text-body-sm text-slate-700 leading-relaxed italic mb-4 p-3 rounded-xl bg-white border border-border">
                &quot;Sesungguhnya sholat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang beriman.&quot;
                <span className="block text-caption font-semibold font-mono text-slate-500 mt-1 not-italic">
                  — QS. An-Nisa: 103
                </span>
              </blockquote>

              <div className="p-3.5 rounded-xl bg-white border border-border text-caption text-navy space-y-2">
                <span className="font-bold text-navy uppercase tracking-wider block text-[11px]">
                  Rincian Kepatuhan ({periodMode === 'weekly' ? activeWeek?.label.split('(')[0].trim() : periodMode === 'monthly' ? MONTH_NAMES_ID[selectedMonthIndex] : 'Semua'}):
                </span>
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {PRAYER_KEYS.map((p) => (
                    <div key={p} className="p-1.5 rounded-lg bg-slate-50 border border-border">
                      <span className="text-[10px] text-slate block">{PRAYER_LABELS[p]}</span>
                      <strong className="text-navy text-[11px]">
                        {breakdown[p]}/{displayedDays.length}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
