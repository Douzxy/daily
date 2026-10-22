'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import GymWidget from '@/components/modules/GymWidget'
import { Card, Badge, StatCard, showToast } from '@/components/ui'
import { Storage } from '@/lib/storage'
import type { WorkoutSession, WeeklyWeightLog } from '@/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDumbbell,
  faTrophy,
  faFire,
  faCalendar,
  faWeightScale,
  faChartLine,
  faChevronLeft,
  faChevronRight,
  faCheck,
  faBed,
  faPlus,
  faArrowTrendUp,
} from '@fortawesome/free-solid-svg-icons'

// Sample weeks data for navigation
const WEEKS_DATA = [
  {
    weekIndex: 0,
    label: 'Minggu 1 (6 - 12 Okt 2026)',
    weightKg: 56.8,
    sessionsCount: 4,
    schedule: [
      { day: 'Senin', split: 'Push Day (Chest & Triceps)', status: 'Selesai' },
      { day: 'Selasa', split: 'Pull Day (Back & Biceps)', status: 'Selesai' },
      { day: 'Rabu', split: 'Rest & Recovery', status: 'Istirahat' },
      { day: 'Kamis', split: 'Legs Day (Quad focus)', status: 'Selesai' },
      { day: 'Jumat', split: 'Push Day (Shoulders focus)', status: 'Selesai' },
      { day: 'Sabtu', split: 'Rest & Foam Rolling', status: 'Istirahat' },
      { day: 'Minggu', split: 'Rest & Clean Bulk Meal Prep', status: 'Istirahat' },
    ],
  },
  {
    weekIndex: 1,
    label: 'Minggu 2 (13 - 19 Okt 2026)',
    weightKg: 57.2,
    sessionsCount: 5,
    schedule: [
      { day: 'Senin', split: 'Push Day (Chest & Triceps)', status: 'Selesai' },
      { day: 'Selasa', split: 'Pull Day (Back & Biceps)', status: 'Selesai' },
      { day: 'Rabu', split: 'Rest & Recovery', status: 'Istirahat' },
      { day: 'Kamis', split: 'Legs Day (Quad & Calves)', status: 'Selesai' },
      { day: 'Jumat', split: 'Pull Day (Rear Delts & Biceps)', status: 'Selesai' },
      { day: 'Sabtu', split: 'Push Day (Bench PR 52.5kg)', status: 'Selesai' },
      { day: 'Minggu', split: 'Rest & Recovery', status: 'Istirahat' },
    ],
  },
  {
    weekIndex: 2,
    label: 'Minggu 3: 20 - 26 Okt 2026 (Minggu Ini)',
    weightKg: 57.5,
    sessionsCount: 3,
    schedule: [
      { day: 'Senin', split: 'Push Day (Bench 50kg)', status: 'Selesai' },
      { day: 'Selasa', split: 'Pull Day (Lat Pulldown 45kg)', status: 'Selesai' },
      { day: 'Rabu', split: 'Rest & Muscle Recovery', status: 'Istirahat' },
      { day: 'Kamis', split: 'Legs Day (Squat & RDL)', status: 'Hari Ini' },
      { day: 'Jumat', split: 'Push Day (Incline DB & Lateral)', status: 'Terjadwal' },
      { day: 'Sabtu', split: 'Pull Day (Rows & Biceps)', status: 'Terjadwal' },
      { day: 'Minggu', split: 'Rest Day', status: 'Istirahat' },
    ],
  },
  {
    weekIndex: 3,
    label: 'Minggu 4 (27 Okt - 2 Nov 2026)',
    weightKg: 57.9,
    sessionsCount: 0,
    schedule: [
      { day: 'Senin', split: 'Push Day', status: 'Terjadwal' },
      { day: 'Selasa', split: 'Pull Day', status: 'Terjadwal' },
      { day: 'Rabu', split: 'Rest Day', status: 'Istirahat' },
      { day: 'Kamis', split: 'Legs Day', status: 'Terjadwal' },
      { day: 'Jumat', split: 'Push Day', status: 'Terjadwal' },
      { day: 'Sabtu', split: 'Pull Day', status: 'Terjadwal' },
      { day: 'Minggu', split: 'Rest Day', status: 'Istirahat' },
    ],
  },
]

// Monthly data for navigation
const MONTHS_DATA = [
  {
    monthIndex: 0,
    label: 'September 2026',
    avgWeight: 56.6,
    weightGain: '+0.5 kg',
    totalSessions: 15,
    complianceRate: '83%',
    totalVolume: '28.400 kg',
    summary: 'Awal program Clean Bulk. Adaptasi beban dan konsistensi split Push/Pull/Legs.',
  },
  {
    monthIndex: 1,
    label: 'Oktober 2026 (Bulan Ini)',
    avgWeight: 57.3,
    weightGain: '+0.7 kg',
    totalSessions: 16,
    complianceRate: '89%',
    totalVolume: '32.150 kg',
    summary: 'Progresif overload stabil. Bench Press naik ke 52.5kg, konsumsi kalori surplus 250 kkal/hari konsisten.',
  },
  {
    monthIndex: 2,
    label: 'November 2026 (Target)',
    avgWeight: 58.2,
    weightGain: '+0.9 kg (Target)',
    totalSessions: 18,
    complianceRate: '90%',
    totalVolume: '35.000 kg',
    summary: 'Rencana periodisasi: fokus penambahan intensitas Squat 80kg dan Bench 55kg menuju BB 62kg.',
  },
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

  // Period Navigators state
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(2) // Default Minggu 3 (Minggu ini)
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(1) // Default Oktober 2026

  // Weekly bodyweight logs state
  const [weightLogs, setWeightLogs] = useState<WeeklyWeightLog[]>(() => {
    if (typeof window !== 'undefined') return Storage.getWeeklyWeightLogs()
    return []
  })
  const [newWeightInput, setNewWeightInput] = useState('57.5')

  useEffect(() => {
    const refresh = () => {
      setSession(Storage.getWorkoutSession())
      setWeightLogs(Storage.getWeeklyWeightLogs())
    }
    refresh()
    window.addEventListener('lifetime-data-change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('lifetime-data-change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const handleToggleSet = (exerciseId: string, setNumber: number) => {
    const updated = Storage.toggleWorkoutSet(exerciseId, setNumber)
    setSession(updated)
  }

  const handleSaveWeeklyWeight = (e: React.FormEvent) => {
    e.preventDefault()
    const numeric = parseFloat(newWeightInput)
    if (isNaN(numeric) || numeric <= 0) {
      showToast('Masukkan angka berat badan yang valid', 'error')
      return
    }
    const currentWeekLabel = WEEKS_DATA[selectedWeekIndex].label
    const updated = Storage.addOrUpdateWeeklyWeight(currentWeekLabel, numeric)
    setWeightLogs(updated)
    setSession(Storage.getWorkoutSession())
    showToast(`BB ${currentWeekLabel} (${numeric} kg) berhasil disimpan!`, 'success')
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

  const currentWeek = WEEKS_DATA[selectedWeekIndex]
  const currentMonth = MONTHS_DATA[selectedMonthIndex]

  const personalRecords = [
    { exercise: 'Barbell Bench Press', weight: '52.5 kg', reps: '6 reps', date: '18 Okt 2026' },
    { exercise: 'Barbell Back Squat', weight: '75.0 kg', reps: '5 reps', date: '15 Okt 2026' },
    { exercise: 'Conventional Deadlift', weight: '95.0 kg', reps: '4 reps', date: '12 Okt 2026' },
    { exercise: 'Overhead Barbell Press', weight: '35.0 kg', reps: '6 reps', date: '10 Okt 2026' },
  ]

  return (
    <DashboardLayout title="Gym & Kebugaran">
      <div className="space-y-6 pb-12">
        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Berat Badan Saat Ini"
            value={`${session.bodyWeightKg ?? 57.5} kg`}
            sublabel="Target Clean Bulk: 62.0 kg (TB 168 cm)"
            icon={faWeightScale}
            color="navy"
            trend="+0.3 kg minggu ini"
            trendUp={true}
          />

          <StatCard
            label="Frekuensi Minggu Ini"
            value={`${currentWeek.sessionsCount} / 5 Sesi`}
            sublabel="Split Push - Pull - Legs"
            icon={faFire}
            color="warning"
            trend="Konsisten"
            trendUp={true}
          />

          <StatCard
            label="Total Volume Angkat"
            value="7.850 kg"
            sublabel="Akumulasi beban minggu ini"
            icon={faChartLine}
            color="sage"
            trend="+5.2% vs minggu lalu"
            trendUp={true}
          />
        </div>

        {/* Current Workout Logger with PPL & Rest Day Toggle */}
        <GymWidget session={session} onToggleSet={handleToggleSet} />

        {/* 1. Weekly Progression & 7-Day Schedule with Period Navigation */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-navy text-white flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faCalendar} className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-body font-heading font-bold text-navy">
                  Jadwal & Evaluasi Mingguan (Senin - Minggu)
                </h3>
                <span className="text-caption text-slate">
                  Navigasi perkembangan latihan dari minggu ke minggu
                </span>
              </div>
            </div>

            {/* Week Period Navigator Controls */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                disabled={selectedWeekIndex === 0}
                onClick={() => {
                  setSelectedWeekIndex((prev) => Math.max(0, prev - 1))
                  showToast('Menampilkan data minggu sebelumnya', 'info')
                }}
                className="h-8.5 px-3 rounded-lg border border-border bg-white hover:bg-slate-100 text-navy text-caption font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                <span>Minggu Lalu</span>
              </button>

              <span className="text-caption font-mono font-bold text-navy px-2.5 py-1 rounded-lg bg-slate-100 border border-border">
                {currentWeek.label}
              </span>

              <button
                type="button"
                disabled={selectedWeekIndex === WEEKS_DATA.length - 1}
                onClick={() => {
                  setSelectedWeekIndex((prev) => Math.min(WEEKS_DATA.length - 1, prev + 1))
                  showToast('Menampilkan data minggu berikutnya', 'info')
                }}
                className="h-8.5 px-3 rounded-lg border border-border bg-white hover:bg-slate-100 text-navy text-caption font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <span>Minggu Depan</span>
                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
              </button>
            </div>
          </div>

          {/* 7-Day Schedule List */}
          <div className="space-y-2">
            {currentWeek.schedule.map((item, idx) => {
              const isToday = item.status === 'Hari Ini'
              const isDone = item.status === 'Selesai'
              const isRest = item.status === 'Istirahat'

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-xl border text-body-sm transition-all ${
                    isToday
                      ? 'bg-navy text-white border-navy font-semibold shadow-xs'
                      : isDone
                      ? 'bg-emerald-50/70 text-navy border-emerald-300'
                      : isRest
                      ? 'bg-slate-50 text-slate border-border'
                      : 'bg-surface text-navy border-border'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono font-bold w-16 text-caption shrink-0">
                      {item.day}
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
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-xl bg-navy/10 text-navy flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faWeightScale} className="h-4 w-4 text-navy" />
              </div>
              <div>
                <h3 className="text-body font-heading font-bold text-navy">
                  Log Berat Badan Mingguan
                </h3>
                <span className="text-caption text-slate">
                  Pantau BB minggu ini vs minggu lalu menuju target 62 kg
                </span>
              </div>
            </div>

            {/* Quick Record Weight Form */}
            <form onSubmit={handleSaveWeeklyWeight} className="p-3.5 mb-4 rounded-xl bg-slate-50 border border-border flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <label className="text-[11px] font-bold uppercase text-slate block mb-1">
                  Catat BB {currentWeek.label.split('(')[0].trim()} (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeightInput}
                  onChange={(e) => setNewWeightInput(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-body-sm font-mono font-bold text-navy focus:outline-none focus:border-navy"
                  placeholder="57.5"
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
                    <div>
                      <span className="text-body-sm font-heading font-bold text-navy block">
                        {log.weekLabel}
                      </span>
                      <span className="text-caption text-slate block">
                        {log.notes || 'Catatan progresif clean bulk'}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-body font-mono font-bold text-navy block tabular-nums">
                        {log.weightKg.toFixed(1)} kg
                      </span>
                      {diff && (
                        <span className={`text-[11px] font-mono font-semibold ${Number(diff) >= 0 ? 'text-sage' : 'text-red-600'}`}>
                          {Number(diff) >= 0 ? `+${diff}` : diff} kg
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* 3. Monthly Monitoring & Progression ("mantau perkembangan bulanan") */}
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
                    Evaluasi komprehensif periode bulanan
                  </span>
                </div>
              </div>

              {/* Month Navigator Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={selectedMonthIndex === 0}
                  onClick={() => {
                    setSelectedMonthIndex((prev) => Math.max(0, prev - 1))
                    showToast('Menampilkan data bulan sebelumnya', 'info')
                  }}
                  className="h-8 w-8 rounded-lg border border-border bg-white hover:bg-slate-100 flex items-center justify-center text-navy disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Bulan Sebelumnya"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                </button>
                <span className="text-[11px] font-heading font-bold text-navy px-2 py-1 bg-slate-100 rounded-lg">
                  {currentMonth.label}
                </span>
                <button
                  type="button"
                  disabled={selectedMonthIndex === MONTHS_DATA.length - 1}
                  onClick={() => {
                    setSelectedMonthIndex((prev) => Math.min(MONTHS_DATA.length - 1, prev + 1))
                    showToast('Menampilkan data bulan berikutnya', 'info')
                  }}
                  className="h-8 w-8 rounded-lg border border-border bg-white hover:bg-slate-100 flex items-center justify-center text-navy disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Bulan Berikutnya"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                </button>
              </div>
            </div>

            {/* Monthly Key Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-border text-center">
                <span className="text-[11px] text-slate block uppercase font-medium">Rata-Rata BB</span>
                <span className="text-h3 font-heading font-bold text-navy font-mono">
                  {currentMonth.avgWeight} kg
                </span>
                <span className="text-[10px] text-sage font-semibold block">{currentMonth.weightGain}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-border text-center">
                <span className="text-[11px] text-slate block uppercase font-medium">Sesi Latihan</span>
                <span className="text-h3 font-heading font-bold text-navy font-mono">
                  {currentMonth.totalSessions} Sesi
                </span>
                <span className="text-[10px] text-slate font-semibold block">Kepatuhan: {currentMonth.complianceRate}</span>
              </div>
            </div>

            <p className="text-caption text-slate bg-slate-50 p-3 rounded-xl border border-border leading-relaxed">
              {currentMonth.summary}
            </p>
          </Card>
        </div>

        {/* 4. Personal Records (PR) */}
        <Card>
          <div className="flex items-center gap-2.5 mb-4">
            <FontAwesomeIcon icon={faTrophy} className="h-4 w-4 text-amber-500" />
            <div>
              <h3 className="text-body-sm font-heading font-bold text-navy">
                Personal Records (PR)
              </h3>
              <span className="text-[11px] text-slate">Beban maksimum terverifikasi</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {personalRecords.map((pr, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-border bg-slate-50/70 hover:bg-slate-50 transition-colors"
              >
                <span className="text-[11px] font-medium text-slate uppercase tracking-wider block">
                  {pr.exercise}
                </span>
                <p className="text-h3 font-heading font-bold text-navy mt-1 tabular-nums">
                  {pr.weight}
                </p>
                <div className="flex items-center justify-between text-caption text-slate mt-1.5 font-mono">
                  <span>{pr.reps}</span>
                  <span className="text-[10px] text-slate-light">{pr.date}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
