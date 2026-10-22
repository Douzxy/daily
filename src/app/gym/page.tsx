'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import GymWidget from '@/components/modules/GymWidget'
import { Card, Badge, StatCard } from '@/components/ui'
import { Storage } from '@/lib/storage'
import type { WorkoutSession } from '@/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDumbbell,
  faTrophy,
  faFire,
  faCalendar,
  faWeightScale,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons'

export default function GymPage() {
  const [mounted, setMounted] = useState(false)
  const [session, setSession] = useState<WorkoutSession>({
    id: 'ws-1',
    date: '',
    splitName: 'Push Day A (Chest, Shoulders & Triceps)',
    exercises: [],
    completed: false,
  })

  useEffect(() => {
    setMounted(true)
    setSession(Storage.getWorkoutSession())
  }, [])

  const handleToggleSet = (exerciseId: string, setNumber: number) => {
    const updated = Storage.toggleWorkoutSet(exerciseId, setNumber)
    setSession(updated)
  }

  if (!mounted) {
    return (
      <DashboardLayout title="Gym & Fitness" subtitle="Progressive overload tracker">
        <div className="flex items-center justify-center min-h-100">
          <div className="h-8 w-8 rounded-full border-2 border-navy border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  const personalRecords = [
    { exercise: 'Barbell Bench Press', weight: '82.5 kg', reps: '6 reps', date: '18 Okt 2026' },
    { exercise: 'Barbell Back Squat', weight: '110 kg', reps: '5 reps', date: '15 Okt 2026' },
    { exercise: 'Conventional Deadlift', weight: '140 kg', reps: '4 reps', date: '12 Okt 2026' },
    { exercise: 'Overhead Barbell Press', weight: '55 kg', reps: '6 reps', date: '10 Okt 2026' },
  ]

  const weeklySchedule = [
    { day: 'Senin', split: 'Push A (Chest focus)', status: 'Selesai' },
    { day: 'Selasa', split: 'Pull A (Lat & Biceps)', status: 'Selesai' },
    { day: 'Rabu', split: 'Rest & Mobility Recovery', status: 'Istirahat' },
    { day: 'Kamis', split: 'Legs A (Quad focus)', status: 'Hari Ini' },
    { day: 'Jumat', split: 'Upper Body B (Shoulders & Arms)', status: 'Terjadwal' },
    { day: 'Sabtu', split: 'Legs B / Full Body', status: 'Terjadwal' },
    { day: 'Minggu', split: 'Full Rest & Nutrition Prep', status: 'Istirahat' },
  ]

  return (
    <DashboardLayout
      title="Gym & Progressive Overload"
      subtitle="Catat beban latihan, set, repetisi, dan personal records untuk memastikan stimulasi pertumbuhan otot"
    >
      <div className="space-y-6 pb-12">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Berat Badan Saat Ini"
            value={`${session.bodyWeightKg ?? 73.4} kg`}
            sublabel="Target: 75 kg (Lean Bulk)"
            icon={faWeightScale}
            color="navy"
            trend="+0.3 kg minggu ini"
            trendUp={true}
          />

          <StatCard
            label="Frekuensi Mingguan"
            value="4 / 5 Sesi"
            sublabel="Konsistensi split PPL"
            icon={faFire}
            color="warning"
            trend="Sesuai rencana"
            trendUp={true}
          />

          <StatCard
            label="Total Volume Latihan"
            value="14.850 kg"
            sublabel="Akumulasi beban minggu ini"
            icon={faChartLine}
            color="sage"
            trend="+5% vs minggu lalu"
            trendUp={true}
          />
        </div>

        {/* Current Workout Logger */}
        <GymWidget session={session} onToggleSet={handleToggleSet} />

        {/* Personal Records & Weekly Split Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PR Showcase */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          {/* Weekly Split Schedule */}
          <Card>
            <div className="flex items-center gap-2.5 mb-4">
              <FontAwesomeIcon icon={faCalendar} className="h-4 w-4 text-navy" />
              <div>
                <h3 className="text-body-sm font-heading font-bold text-navy">
                  Jadwal Program Mingguan
                </h3>
                <span className="text-[11px] text-slate">Struktur periodisasi PPL (Push - Pull - Legs)</span>
              </div>
            </div>

            <div className="space-y-2">
              {weeklySchedule.map((s, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-body-sm transition-all ${
                    s.status === 'Hari Ini'
                      ? 'bg-navy text-white border-navy font-semibold'
                      : s.status === 'Selesai'
                      ? 'bg-emerald-50/60 text-navy border-emerald-200'
                      : 'bg-surface text-slate-700 border-border'
                  }`}
                >
                  <span className="font-mono font-bold w-16">{s.day}</span>
                  <span className="flex-1 truncate mx-2">{s.split}</span>
                  <Badge
                    variant={
                      s.status === 'Hari Ini'
                        ? 'navy'
                        : s.status === 'Selesai'
                        ? 'success'
                        : 'default'
                    }
                    className="text-[10px] py-0.5"
                  >
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
