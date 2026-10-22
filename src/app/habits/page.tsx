'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import HabitsWidget from '@/components/modules/HabitsWidget'
import PeriodFilterBar, { type PeriodMode } from '@/components/layout/PeriodFilterBar'
import { Card, Button, StatCard, Badge, showToast } from '@/components/ui'
import { Storage } from '@/lib/storage'
import type { Habit } from '@/types'
import {
  MONTH_NAMES_ID,
  getCurrentYearAndMonth,
  getWeeksInMonth,
  getDaysInMonth,
  getTodayDateStr,
} from '@/lib/dateUtils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faListCheck,
  faFire,
  faCircleCheck,
  faCalendar,
  faPlus,
  faXmark,
  faChartPie,
} from '@fortawesome/free-solid-svg-icons'

export default function HabitsPage() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const [habits, setHabits] = useState<Habit[]>(() => {
    if (typeof window !== 'undefined') return Storage.getHabits()
    return []
  })

  // Period Navigation State
  const initialDate = getCurrentYearAndMonth()
  const [periodMode, setPeriodMode] = useState<PeriodMode>('monthly')
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

  const [showAddModal, setShowAddModal] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitCategory, setNewHabitCategory] = useState('Kesehatan')

  useEffect(() => {
    const refresh = () => setHabits(Storage.getHabits())
    refresh()
    window.addEventListener('lifetime-data-change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('lifetime-data-change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const handleToggleHabit = (id: string) => {
    const updated = Storage.toggleHabit(id)
    setHabits(updated)
  }

  const handleEditHabit = (id: string, updates: Partial<Habit>) => {
    const updated = Storage.updateHabit(id, updates)
    setHabits(updated)
  }

  const handleDeleteHabit = (id: string) => {
    const updated = Storage.deleteHabit(id)
    setHabits(updated)
  }

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitName.trim()) return

    Storage.addHabit({
      name: newHabitName.trim(),
      category: newHabitCategory,
      icon: 'CircleCheck',
    })

    setHabits(Storage.getHabits())
    setNewHabitName('')
    setShowAddModal(false)
    showToast(`Habit "${newHabitName.trim()}" berhasil ditambahkan!`, 'success')
  }

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

  // Weeks and days for chosen month & year
  const weeksInMonth = getWeeksInMonth(selectedYear, selectedMonthIndex)
  const activeWeek =
    weeksInMonth.find((w) => w.weekNumber === selectedWeekNumber) || weeksInMonth[0]
  const allDaysInMonth = getDaysInMonth(selectedYear, selectedMonthIndex)

  // Construct displayed days depending on periodMode
  const todayStr = getTodayDateStr()
  const [ty, tm, td] = todayStr.split('-').map(Number)
  const todayDateObj = new Date(ty, (tm || 1) - 1, td || 1)
  const todayDayItem = {
    date: todayStr,
    dayNumber: td || 1,
    dayName: todayDateObj.toLocaleDateString('id-ID', { weekday: 'long' }),
    dayShort: todayDateObj.toLocaleDateString('id-ID', { weekday: 'short' }),
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

  // Calculate consistency level for each displayed day
  const daysGrid = displayedDays.map((d) => {
    let completedOnDay = 0
    for (const h of habits) {
      if (h.history && h.history[d.date]) {
        completedOnDay++
      } else if (d.isToday && h.completedToday) {
        completedOnDay++
      }
    }
    const ratio = habits.length > 0 ? completedOnDay / habits.length : 0
    let level = 0
    if (ratio >= 0.8) level = 4
    else if (ratio >= 0.5) level = 3
    else if (ratio > 0) level = 2
    else level = 1

    return {
      date: `${d.dayNumber} ${MONTH_NAMES_ID[parseInt(d.date.split('-')[1] || '10', 10) - 1]?.slice(0, 3)}`,
      fullDate: d.date,
      level,
      completedOnDay,
      totalHabits: habits.length,
      isToday: d.isToday,
    }
  })

  // Period overall compliance percentage
  const totalCompletedInPeriod = daysGrid.reduce((sum, d) => sum + d.completedOnDay, 0)
  const totalPossibleInPeriod = daysGrid.length * habits.length
  const periodComplianceRate =
    totalPossibleInPeriod > 0
      ? Math.round((totalCompletedInPeriod / totalPossibleInPeriod) * 100)
      : 85

  if (!mounted) {
    return (
      <DashboardLayout title="Habit Tracker" subtitle="Konsistensi rutinitas harian">
        <div className="flex items-center justify-center min-h-100">
          <div className="h-8 w-8 rounded-full border-2 border-navy border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  const completedTodayCount = habits.filter((h) => h.completedToday).length
  const longestStreak = Math.max(...habits.map((h) => h.streak), 0)

  return (
    <DashboardLayout title="Habits">
      <div className="space-y-6 pb-12">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Selesai Hari Ini"
            value={`${completedTodayCount} / ${habits.length}`}
            sublabel="Target rutinitas harian"
            icon={faListCheck}
            color={completedTodayCount === habits.length && habits.length > 0 ? 'sage' : 'navy'}
          />

          <StatCard
            label="Streak Terpanjang"
            value={`${longestStreak} Hari`}
            sublabel="Rutinitas konsisten tanpa putus"
            icon={faFire}
            color="warning"
            trend="Aktif"
            trendUp={true}
          />

          <StatCard
            label={`Kepatuhan ${periodMode === 'weekly' ? 'Mingguan' : periodMode === 'monthly' ? 'Bulanan' : 'Konsistensi'}`}
            value={`${periodComplianceRate}%`}
            sublabel={`${totalCompletedInPeriod} dari ${totalPossibleInPeriod} rutinitas`}
            icon={faCircleCheck}
            color="sage"
            trend={
              periodMode === 'weekly'
                ? activeWeek?.label.split('(')[0].trim() || 'Mingguan'
                : `${MONTH_NAMES_ID[selectedMonthIndex]} ${selectedYear}`
            }
            trendUp={periodComplianceRate >= 70}
          />
        </div>

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
              ? `Hari Ini (${todayStr})`
              : periodMode === 'monthly'
              ? `${MONTH_NAMES_ID[selectedMonthIndex]} ${selectedYear}`
              : `${activeWeek?.label || ''} (${selectedYear})`
          }
          badgeText={`Kepatuhan: ${periodComplianceRate}%`}
        />

        {/* Consistency Heatmap Card for Selected Period */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-navy/10 text-navy flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faCalendar} className="h-4 w-4 text-navy" />
              </div>
              <div>
                <h3 className="text-body font-heading font-bold text-navy">
                  Matriks Konsistensi {periodMode === 'today' ? `Hari Ini (${todayStr})` : periodMode === 'weekly' ? activeWeek?.label : `${MONTH_NAMES_ID[selectedMonthIndex]} ${selectedYear}`}
                </h3>
                <span className="text-caption text-slate">
                  GitHub-style habit completion matrix ({daysGrid.length} Hari)
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="gap-1.5 shadow-xs self-start sm:self-auto"
            >
              <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
              <span>+ Tambah Habit</span>
            </Button>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-10 lg:grid-cols-14 gap-2 pt-2">
            {daysGrid.map((day, i) => (
              <div
                key={i}
                className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all hover:scale-105 ${
                  day.isToday ? 'border-navy bg-navy/5 shadow-2xs font-bold' : 'border-border/60 bg-surface'
                }`}
                title={`${day.fullDate}: ${day.completedOnDay}/${day.totalHabits} habit selesai`}
              >
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold ${
                    day.level === 4
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : day.level === 3
                      ? 'bg-emerald-400 text-white'
                      : day.level === 2
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-[9px] text-slate mt-1 block truncate max-w-full font-mono">
                  {day.date}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-caption text-slate mt-4 pt-3 border-t border-border/60 flex-wrap gap-2">
            <span className="text-[11px] font-mono">
              Total Selesai: <strong>{totalCompletedInPeriod}</strong> dari <strong>{totalPossibleInPeriod}</strong> rutinitas
            </span>
            <div className="flex items-center gap-2 text-caption">
              <span>Rendah</span>
              <div className="h-3 w-3 rounded bg-slate-100" />
              <div className="h-3 w-3 rounded bg-emerald-200" />
              <div className="h-3 w-3 rounded bg-emerald-400" />
              <div className="h-3 w-3 rounded bg-emerald-600" />
              <span>Optimal</span>
            </div>
          </div>
        </Card>

        {/* Habits Widget */}
        <HabitsWidget
          habits={habits}
          onToggleHabit={handleToggleHabit}
          onEditHabit={handleEditHabit}
          onDeleteHabit={handleDeleteHabit}
        />

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-navy/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border shadow-2xl p-6 z-10 animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-h4 font-heading font-bold text-navy">
                  Tambah Habit Baru
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-8 w-8 rounded-lg text-slate hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  aria-label="Tutup"
                >
                  <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddHabit} className="space-y-4">
                <div>
                  <label className="block text-body-sm font-medium text-navy mb-1.5">
                    Nama Habit / Kebiasaan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Minum Air 2.5L, Baca Buku 15 Menit"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                  />
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-navy mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={newHabitCategory}
                    onChange={(e) => setNewHabitCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy cursor-pointer"
                  >
                    <option value="Kesehatan">Kesehatan & Fisik</option>
                    <option value="Produktivitas">Produktivitas & Kerja</option>
                    <option value="Ibadah">Ibadah & Spiritual</option>
                    <option value="Edukasi">Edukasi & Belajar</option>
                    <option value="Finansial">Finansial & Tabungan</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => setShowAddModal(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" variant="primary" size="md">
                    Simpan Habit
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
