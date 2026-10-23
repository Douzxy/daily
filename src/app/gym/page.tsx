'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import GymWidget from '@/components/modules/GymWidget'
import NutritionBulkingWidget from '@/components/modules/NutritionBulkingWidget'
import PeriodFilterBar, { type PeriodMode } from '@/components/layout/PeriodFilterBar'
import { Card, Badge, StatCard, showToast, ConfirmModal } from '@/components/ui'
import { Storage } from '@/lib/storage'
import type { WorkoutSession, WeeklyWeightLog, MealLog, NutritionTarget } from '@/types'
import {
  MONTH_NAMES_ID,
  getCurrentYearAndMonth,
  getWeeksInMonth,
  getTodayDateStr,
} from '@/lib/dateUtils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDumbbell,
  faTrophy,
  faFire,
  faCalendar,
  faWeightScale,
  faChartLine,
  faPlus,
  faArrowTrendUp,
  faPenToSquare,
  faTrashCan,
  faXmark,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons'

// Split template mapping for the days of a week
const SPLIT_DAYS_TEMPLATE = [
  { dayIndex: 1, dayName: 'Senin', split: 'Push Day (Dada, Bahu & Triceps)', isRest: false },
  { dayIndex: 2, dayName: 'Selasa', split: 'Pull Day (Punggung & Biceps)', isRest: false },
  { dayIndex: 3, dayName: 'Rabu', split: 'Rest & Muscle Recovery', isRest: true },
  { dayIndex: 4, dayName: 'Kamis', split: 'Legs Day (Quad, Calves & Core)', isRest: false },
  { dayIndex: 5, dayName: 'Jumat', split: 'Push Day (Chest Upper & Shoulders)', isRest: false },
  { dayIndex: 6, dayName: 'Sabtu', split: 'Pull Day (Rear Delts, Traps & Arms)', isRest: false },
  { dayIndex: 0, dayName: 'Minggu', split: 'Rest & Clean Bulk Meal Prep', isRest: true },
]

export default function GymPage() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const [session, setSession] = useState<WorkoutSession>(() => {
    if (typeof window !== 'undefined') {
      return Storage.getWorkoutSession()
    }
    return {
      id: 'ws-1',
      date: '',
      splitName: 'Push Day (Dada & Triceps)',
      exercises: [],
      completed: false,
    }
  })

  // Period Navigators state (Month, Year, Week, Mode)
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

  // Nutrition & Meal Logs state (Clean Bulking)
  const [meals, setMeals] = useState<MealLog[]>(() => {
    if (typeof window !== 'undefined') return Storage.getMealLogs()
    return []
  })
  const [nutritionTarget, setNutritionTarget] = useState<NutritionTarget>(() => {
    if (typeof window !== 'undefined') return Storage.getNutritionTarget()
    return { targetCalories: 2500, targetProtein: 115 }
  })

  // Weekly bodyweight logs state
  const [weightLogs, setWeightLogs] = useState<WeeklyWeightLog[]>(() => {
    if (typeof window !== 'undefined') return Storage.getWeeklyWeightLogs()
    return []
  })
  const [newWeightInput, setNewWeightInput] = useState('57.8')

  // Edit / Add Custom Weight Log Modal state
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [editingWeightLog, setEditingWeightLog] = useState<WeeklyWeightLog | null>(null)
  const [deleteConfirmWeightLog, setDeleteConfirmWeightLog] = useState<{ id: string; label: string } | null>(null)
  const [modalWeekLabel, setModalWeekLabel] = useState('')
  const [modalWeightKg, setModalWeightKg] = useState('')
  const [modalDate, setModalDate] = useState('')
  const [modalNotes, setModalNotes] = useState('')

  useEffect(() => {
    const refresh = () => {
      setSession(Storage.getWorkoutSession())
      setWeightLogs(Storage.getWeeklyWeightLogs())
      setMeals(Storage.getMealLogs())
      setNutritionTarget(Storage.getNutritionTarget())
    }
    refresh()
    window.addEventListener('lifetime-data-change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('lifetime-data-change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  // Calculate dynamic weeks for chosen year & month
  const weeksInMonth = getWeeksInMonth(selectedYear, selectedMonthIndex)
  const activeWeek =
    weeksInMonth.find((w) => w.weekNumber === selectedWeekNumber) || weeksInMonth[0]

  // Dynamic schedule for the active week & nutrition date
  const todayStr = getTodayDateStr()
  const [selectedDayOverride, setSelectedDayOverride] = useState<string | null>(null)

  const effectiveNutritionDate = (() => {
    if (selectedDayOverride && (activeWeek?.days || []).some((d) => d.date === selectedDayOverride)) {
      return selectedDayOverride
    }
    const hasToday = (activeWeek?.days || []).some((d) => d.date === todayStr)
    if (hasToday) return todayStr
    return activeWeek?.startDate || todayStr
  })()

  const activeWeekSchedule = (activeWeek?.days || []).map((d) => {
    const template = SPLIT_DAYS_TEMPLATE.find((t) => t.dayName === d.dayName) || {
      split: 'Workout PPL',
      isRest: false,
    }
    let status = 'Terjadwal'
    if (template.isRest) {
      status = 'Istirahat'
    } else if (d.isToday) {
      status = session.completed ? 'Selesai' : 'Hari Ini'
    } else if (d.date < todayStr) {
      status = 'Selesai'
    }

    return {
      date: d.date,
      day: d.dayName,
      dayShort: d.dayShort,
      dayNumber: d.dayNumber,
      split: template.split,
      status,
      isToday: d.isToday,
      isRest: template.isRest,
    }
  })

  const completedSessionsInWeek = activeWeekSchedule.filter((s) => s.status === 'Selesai').length

  // Calculate monthly stats from weight logs for the selected month/year
  const monthPrefix = `${selectedYear}-${String(selectedMonthIndex + 1).padStart(2, '0')}`
  const monthName = MONTH_NAMES_ID[selectedMonthIndex]
  const logsInMonth = weightLogs.filter(
    (l) =>
      (l.date && l.date.startsWith(monthPrefix)) ||
      (l.weekLabel && l.weekLabel.toLowerCase().includes(monthName.toLowerCase().slice(0, 3)))
  )

  const avgWeightInMonth =
    logsInMonth.length > 0
      ? (logsInMonth.reduce((acc, curr) => acc + curr.weightKg, 0) / logsInMonth.length).toFixed(1)
      : (session.bodyWeightKg ?? 57.5).toFixed(1)

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

  // Nutrition Handlers
  const handleAddMeal = (newMeal: Omit<MealLog, 'id'>) => {
    const added = Storage.addMealLog(newMeal)
    setMeals(Storage.getMealLogs())
  }

  const handleUpdateMeal = (id: string, updates: Partial<MealLog>) => {
    const updated = Storage.updateMealLog(id, updates)
    setMeals(updated)
  }

  const handleDeleteMeal = (id: string) => {
    const updated = Storage.deleteMealLog(id)
    setMeals(updated)
  }

  const handleUpdateNutritionTarget = (target: NutritionTarget) => {
    Storage.saveNutritionTarget(target)
    setNutritionTarget(target)
  }

  // Weight Log Handlers
  const handleSaveWeeklyWeight = (e: React.FormEvent) => {
    e.preventDefault()
    const numeric = parseFloat(newWeightInput)
    if (isNaN(numeric) || numeric <= 0) {
      showToast('Masukkan angka berat badan yang valid', 'error')
      return
    }
    const currentWeekLabel = activeWeek?.label || `Minggu ${selectedWeekNumber}`
    const targetDate = activeWeek?.startDate || todayStr
    const updated = Storage.addOrUpdateWeeklyWeight(
      currentWeekLabel,
      numeric,
      'Catatan progresif clean bulk',
      targetDate
    )
    setWeightLogs(updated)
    setSession(Storage.getWorkoutSession())
    showToast(`BB ${currentWeekLabel} (${numeric} kg) berhasil disimpan!`, 'success')
  }

  const openEditWeightModal = (log: WeeklyWeightLog) => {
    setEditingWeightLog(log)
    setModalWeekLabel(log.weekLabel)
    setModalWeightKg(String(log.weightKg))
    setModalDate(log.date || todayStr)
    setModalNotes(log.notes || '')
    setShowWeightModal(true)
  }

  const openAddWeightModal = () => {
    setEditingWeightLog(null)
    const label = activeWeek?.label || `Minggu ${selectedWeekNumber} (${monthName})`
    setModalWeekLabel(label)
    setModalWeightKg(String(session.bodyWeightKg ?? 57.8))
    setModalDate(activeWeek?.startDate || todayStr)
    setModalNotes('Catatan progresif clean bulk')
    setShowWeightModal(true)
  }

  const handleModalSaveWeight = (e: React.FormEvent) => {
    e.preventDefault()
    const numeric = parseFloat(modalWeightKg)
    if (isNaN(numeric) || numeric <= 0) {
      showToast('Masukkan angka berat badan yang valid', 'error')
      return
    }

    if (editingWeightLog) {
      const updated = Storage.updateWeeklyWeightLog(editingWeightLog.id, {
        weekLabel: modalWeekLabel.trim(),
        weightKg: numeric,
        date: modalDate,
        notes: modalNotes.trim(),
      })
      setWeightLogs(updated)
      setSession(Storage.getWorkoutSession())
      showToast(`Data ${modalWeekLabel} berhasil diperbarui!`, 'success')
    } else {
      const updated = Storage.addOrUpdateWeeklyWeight(
        modalWeekLabel.trim(),
        numeric,
        modalNotes.trim(),
        modalDate
      )
      setWeightLogs(updated)
      setSession(Storage.getWorkoutSession())
      showToast(`Data ${modalWeekLabel} (${numeric} kg) berhasil ditambahkan!`, 'success')
    }

    setShowWeightModal(false)
  }

  const handleDeleteWeightLog = (id: string, label: string) => {
    setDeleteConfirmWeightLog({ id, label })
  }

  if (!mounted) {
    return (
      <DashboardLayout title="Gym" subtitle="Progressive overload tracker">
        <div className="flex items-center justify-center min-h-100">
          <div className="h-8 w-8 rounded-full border-2 border-navy border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Gym & Kebugaran">
      <div className="space-y-6 pb-12">
        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Berat Badan Saat Ini"
            value={`${session.bodyWeightKg ?? 57.5} kg`}
            sublabel="Target Clean Bulk: 68.0 kg (TB 168 cm)"
            icon={faWeightScale}
            color="navy"
            trend="+0.3 kg progresif"
            trendUp={true}
          />

          <StatCard
            label="Frekuensi Minggu Ini"
            value={`${completedSessionsInWeek} / 5 Sesi`}
            sublabel="Split Push - Pull - Legs"
            icon={faFire}
            color="warning"
            trend="Konsisten"
            trendUp={true}
          />

          <StatCard
            label="Target Berat Badan"
            value="68.0 kg"
            sublabel="Sisa: +10.2 kg (Clean Bulk)"
            icon={faChartLine}
            color="sage"
            trend="Menuju 68.0 kg"
            trendUp={true}
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
              ? `${monthName} ${selectedYear}`
              : `${activeWeek?.label || ''} (${selectedYear})`
          }
          badgeText={`${completedSessionsInWeek} Sesi Latihan Selesai`}
        />

        {/* Clean Bulking Nutrition & Meal/Snack Tracker */}
        <NutritionBulkingWidget
          selectedDate={effectiveNutritionDate}
          meals={meals}
          nutritionTarget={nutritionTarget}
          onAddMeal={handleAddMeal}
          onUpdateMeal={handleUpdateMeal}
          onDeleteMeal={handleDeleteMeal}
          onUpdateTarget={handleUpdateNutritionTarget}
        />

        {/* Current Workout Logger with PPL & Rest Day Toggle */}
        <GymWidget
          session={session}
          onToggleCompleted={() => {
            const updated = Storage.toggleWorkoutCompleted()
            setSession(updated)
          }}
        />

        {/* 1. Weekly Progression & 7-Day Schedule with Dynamic Dates */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-navy text-white flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faCalendar} className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-body font-heading font-bold text-navy">
                  Jadwal & Evaluasi {activeWeek?.label}
                </h3>
                <span className="text-caption text-slate">
                  Navigasi perkembangan latihan dari minggu ke minggu
                </span>
              </div>
            </div>

            <Badge variant="default" className="self-start sm:self-auto font-mono text-caption">
              {completedSessionsInWeek} Sesi Terselesaikan
            </Badge>
          </div>

          {/* 7-Day Schedule List */}
          <div className="space-y-2">
            {activeWeekSchedule.map((item, idx) => {
              const isToday = item.status === 'Hari Ini'
              const isDone = item.status === 'Selesai'
              const isRest = item.status === 'Istirahat'
              const isSelectedDay = item.date === effectiveNutritionDate

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDayOverride(item.date)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-body-sm transition-all cursor-pointer ${
                    isSelectedDay
                      ? 'ring-2 ring-amber-500 bg-amber-500/10 border-amber-400 font-semibold shadow-xs'
                      : isToday
                      ? 'bg-navy text-white border-navy font-semibold shadow-xs'
                      : isDone
                      ? 'bg-emerald-50/70 text-navy border-emerald-300 hover:border-slate'
                      : isRest
                      ? 'bg-slate-50 text-slate border-border hover:border-slate'
                      : 'bg-surface text-navy border-border hover:border-slate'
                  }`}
                  title="Klik untuk melihat & mencatat nutrisi pada tanggal ini"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono font-bold w-20 text-caption shrink-0">
                      {item.day}, {item.dayNumber} {monthName.slice(0, 3)}
                    </span>
                    <span className="truncate font-medium">{item.split}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        isToday
                          ? 'bg-white text-navy font-bold'
                          : isDone
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isRest
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-slate-100 text-slate'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* 2. Weekly Body Weight Progression ("minggu ini bb brp, minggu depan bb brp") */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-navy/10 text-navy flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faWeightScale} className="h-4 w-4 text-navy" />
                </div>
                <div>
                  <h3 className="text-body font-heading font-bold text-navy">
                    Log Berat Badan Mingguan
                  </h3>
                  <span className="text-caption text-slate">
                    Pantau & ubah BB per minggu menuju target 68 kg
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={openAddWeightModal}
                className="h-8 px-2.5 rounded-lg border border-border bg-white hover:bg-slate-100 text-navy text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Tambah catatan riwayat minggu lain"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                <span>Tambah Log</span>
              </button>
            </div>

            {/* Quick Record Weight Form */}
            <form
              onSubmit={handleSaveWeeklyWeight}
              className="p-3.5 mb-4 rounded-xl bg-slate-50 border border-border flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <label className="text-[11px] font-bold uppercase text-slate block mb-1">
                  Catat BB {activeWeek?.label.split('(')[0].trim() || 'Minggu Ini'} (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeightInput}
                  onChange={(e) => setNewWeightInput(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-body-sm font-mono font-bold text-navy focus:outline-none focus:border-navy"
                  placeholder="57.8"
                />
              </div>
              <button
                type="submit"
                className="h-10 mt-5 px-4 rounded-xl bg-navy text-white hover:bg-navy-hover font-heading font-bold text-caption active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                Simpan BB
              </button>
            </form>

            {/* List of Weekly Weights */}
            <div className="space-y-2">
              {weightLogs.map((log, idx) => {
                const prev = idx > 0 ? weightLogs[idx - 1] : null
                const diff = prev ? (log.weightKg - prev.weightKg).toFixed(1) : null

                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface hover:border-slate/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1 mr-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-body-sm font-heading font-bold text-navy">
                          {log.weekLabel}
                        </span>
                        {log.date && (
                          <span className="text-[10px] text-slate font-mono bg-slate-100 px-1.5 py-0.2 rounded">
                            {log.date}
                          </span>
                        )}
                      </div>
                      <span className="text-caption text-slate block truncate mt-0.5">
                        {log.notes || 'Catatan progresif clean bulk'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-body font-mono font-bold text-navy block tabular-nums">
                          {log.weightKg.toFixed(1)} kg
                        </span>
                        {diff && (
                          <span
                            className={`text-[11px] font-mono font-semibold ${
                              Number(diff) >= 0 ? 'text-sage' : 'text-red-600'
                            }`}
                          >
                            {Number(diff) >= 0 ? `+${diff}` : diff} kg
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditWeightModal(log)}
                          className="h-7 w-7 rounded-lg text-slate-400 hover:text-navy hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                          title="Ubah data berat badan & tanggal minggu ini"
                          aria-label="Edit log berat badan"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteWeightLog(log.id, log.weekLabel)}
                          className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                          title="Hapus log minggu ini"
                          aria-label="Hapus log berat badan"
                        >
                          <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* 3. Monthly Monitoring & Progression with Dynamic Evaluation */}
          <Card>
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-sage/10 text-sage flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faArrowTrendUp} className="h-4 w-4 text-sage" />
                </div>
                <div>
                  <h3 className="text-body font-heading font-bold text-navy">
                    Monitoring Perkembangan Bulanan
                  </h3>
                  <span className="text-caption text-slate">
                    Evaluasi komprehensif {monthName} {selectedYear}
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-heading font-bold text-navy px-2.5 py-1 bg-slate-100 border border-border rounded-lg">
                {monthName} {selectedYear}
              </span>
            </div>

            {/* Monthly Key Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-border text-center">
                <span className="text-[11px] text-slate block uppercase font-medium">
                  Rata-Rata BB Bulan Ini
                </span>
                <span className="text-h3 font-bold text-navy font-mono">
                  {avgWeightInMonth} kg
                </span>
                <span className="text-[10px] text-sage font-semibold block">
                  {logsInMonth.length} Catatan Mingguan
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-border text-center">
                <span className="text-[11px] text-slate block uppercase font-medium">
                  Total Minggu dalam Bulan
                </span>
                <span className="text-h3 font-bold text-navy font-mono">
                  {weeksInMonth.length} Minggu
                </span>
                <span className="text-[10px] text-slate font-semibold block">
                  Target Clean Bulk 68.0 kg
                </span>
              </div>
            </div>

            <p className="text-caption text-slate bg-slate-50 p-3 rounded-xl border border-border leading-relaxed">
              Program Clean Bulk {monthName} {selectedYear}: Surplus kalori konsisten 250 - 300 kkal/hari dengan target protein 115 - 120 gram per hari. Konsistensi progressive overload pada Flat Bench Press, Pull-Up, dan Squat.
            </p>
          </Card>
        </div>

        {/* 4. Milestone & Target Clean Bulk */}
        <Card>
          <div className="flex items-center gap-2.5 mb-4">
            <FontAwesomeIcon icon={faTrophy} className="h-4 w-4 text-amber-500" />
            <div>
              <h3 className="text-body-sm font-heading font-bold text-navy">
                Milestone & Target Clean Bulk Menuju 68.0 kg
              </h3>
              <span className="text-[11px] text-slate">Tahapan kenaikan massa tubuh terukur</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { phase: 'Tahap 1 (Awal)', target: '58.0 kg', status: 'On Track', date: 'Bulan Ini' },
              { phase: 'Tahap 2 (Progres)', target: '62.0 kg', status: 'Fase Berikutnya', date: 'Bulan Depan' },
              { phase: 'Tahap 3 (Konsolidasi)', target: '65.0 kg', status: 'Masa Otot', date: 'Q1 2027' },
              { phase: 'Target Utama', target: '68.0 kg', status: 'Clean Bulk Goal', date: 'Target Akhir' },
            ].map((m, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-colors ${
                  idx === 3
                    ? 'border-navy bg-navy/5 shadow-2xs'
                    : 'border-border bg-slate-50/70 hover:bg-slate-50'
                }`}
              >
                <span className="text-[11px] font-medium text-slate uppercase tracking-wider block">
                  {m.phase}
                </span>
                <p className="text-h3 font-heading font-bold text-navy mt-1 tabular-nums">
                  {m.target}
                </p>
                <div className="flex items-center justify-between text-caption text-slate mt-1.5 font-mono">
                  <span className={idx === 3 ? 'text-navy font-bold' : 'text-sage font-medium'}>
                    {m.status}
                  </span>
                  <span className="text-[10px] text-slate">{m.date}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Edit / Add Weight Log Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm"
            onClick={() => setShowWeightModal(false)}
          />
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border shadow-2xl p-6 z-10 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faWeightScale} className="h-4 w-4 text-navy" />
                <h3 className="text-h4 font-heading font-bold text-navy">
                  {editingWeightLog ? 'Ubah Log Berat Badan' : 'Tambah Log Riwayat BB'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWeightModal(false)}
                className="h-8 w-8 rounded-lg text-slate hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                aria-label="Tutup"
              >
                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleModalSaveWeight} className="space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Label Periode / Minggu
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Minggu 1 (6 - 12 Okt)"
                  value={modalWeekLabel}
                  onChange={(e) => setModalWeekLabel(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Tanggal Pencatatan (Bisa Pilih Tanggal Lewat)
                </label>
                <input
                  type="date"
                  required
                  value={modalDate}
                  onChange={(e) => setModalDate(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface font-mono text-body-sm text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Berat Badan (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="57.8"
                  value={modalWeightKg}
                  onChange={(e) => setModalWeightKg(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface font-mono font-bold text-body text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Catatan Progresif / Evaluasi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Surplus konsisten, protein 115g tercapai"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="px-4 py-2 rounded-lg text-body-sm text-slate hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-navy text-white hover:bg-navy-hover font-semibold text-body-sm cursor-pointer"
                >
                  {editingWeightLog ? 'Simpan Perubahan' : 'Tambah Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Weight Log Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmWeightLog}
        onClose={() => setDeleteConfirmWeightLog(null)}
        onConfirm={() => {
          if (deleteConfirmWeightLog) {
            const updated = Storage.deleteWeeklyWeightLog(deleteConfirmWeightLog.id)
            setWeightLogs(updated)
            showToast(`Log ${deleteConfirmWeightLog.label} berhasil dihapus`, 'info')
          }
        }}
        title="Hapus Log Berat Badan"
        message={`Yakin ingin menghapus catatan berat badan "${deleteConfirmWeightLog?.label}"? Data riwayat ini akan dihapus permanen.`}
        confirmText="Ya, Hapus"
        variant="danger"
      />
    </DashboardLayout>
  )
}
