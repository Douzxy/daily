'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import HabitsWidget from '@/components/modules/HabitsWidget'
import { Card, Button, StatCard } from '@/components/ui'
import { Storage } from '@/lib/storage'
import type { Habit } from '@/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faListCheck,
  faFire,
  faCircleCheck,
  faCalendar,
  faPlus,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

export default function HabitsPage() {
  const [mounted, setMounted] = useState(false)
  const [habits, setHabits] = useState<Habit[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitCategory, setNewHabitCategory] = useState('Kesehatan')

  useEffect(() => {
    setMounted(true)
    setHabits(Storage.getHabits())
  }, [])

  const handleToggleHabit = (id: string) => {
    const updated = Storage.toggleHabit(id)
    setHabits(updated)
  }

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitName.trim()) return

    const newH: Habit = {
      id: `h-${Date.now()}`,
      name: newHabitName.trim(),
      category: newHabitCategory,
      icon: 'CircleCheck',
      streak: 1,
      completedToday: true,
      history: {},
    }

    const updated = [...habits, newH]
    Storage.saveHabits(updated)
    setHabits(updated)
    setNewHabitName('')
    setShowAddModal(false)
  }

  if (!mounted) {
    return (
      <DashboardLayout title="Habit Tracker" subtitle="Konsistensi rutinitas harian">
        <div className="flex items-center justify-center min-h-100">
          <div className="h-8 w-8 rounded-full border-2 border-navy border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  const completedCount = habits.filter((h) => h.completedToday).length
  const longestStreak = Math.max(...habits.map((h) => h.streak), 0)

  // Generate 28 days for consistency heatmap
  const daysGrid = Array.from({ length: 28 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (27 - i))
    const level = (i % 5 === 0) ? 2 : (i % 7 === 0) ? 1 : (i % 3 === 0) ? 4 : 3
    return {
      date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      level,
    }
  })

  return (
    <DashboardLayout
      title="Habit & Rutinitas Harian"
      subtitle="Kembangkan kebiasaan mikro terukur melalui konsistensi dan streak harian"
    >
      <div className="space-y-6 pb-12">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Selesai Hari Ini"
            value={`${completedCount} / ${habits.length}`}
            sublabel="Target harian kamu"
            icon={faListCheck}
            color={completedCount === habits.length ? 'sage' : 'navy'}
          />

          <StatCard
            label="Streak Terpanjang"
            value={`${longestStreak} Hari`}
            sublabel="Rutinitas konsisten"
            icon={faFire}
            color="warning"
            trend="Tertinggi"
            trendUp={true}
          />

          <StatCard
            label="Tingkat Kepatuhan 30 Hari"
            value="89%"
            sublabel="Konsistensi bulan berjalan"
            icon={faCircleCheck}
            color="sage"
          />
        </div>

        {/* 28-Day Heatmap Card */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendar} className="h-4 w-4 text-navy" />
              <div>
                <h3 className="text-body-sm font-heading font-bold text-navy">
                  Matriks Konsistensi 28 Hari Terakhir
                </h3>
                <span className="text-[11px] text-slate">GitHub-style habit completion matrix</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="gap-1.5"
            >
              <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
              <span>Tambah</span>
            </Button>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-2">
            {daysGrid.map((day, i) => (
              <div
                key={i}
                className="group relative flex flex-col items-center justify-center p-2 rounded-lg border border-border/60 transition-all hover:scale-105"
              >
                <div
                  className={`h-7 w-7 rounded-md flex items-center justify-center font-mono text-[10px] font-bold ${
                    day.level === 4
                      ? 'bg-emerald-600 text-white'
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

          <div className="flex items-center justify-end gap-2 text-caption text-slate mt-4 pt-3 border-t border-border/60">
            <span>Rendah</span>
            <div className="h-3 w-3 rounded-xs bg-slate-100" />
            <div className="h-3 w-3 rounded-xs bg-emerald-200" />
            <div className="h-3 w-3 rounded-xs bg-emerald-400" />
            <div className="h-3 w-3 rounded-xs bg-emerald-600" />
            <span>Optimal</span>
          </div>
        </Card>

        {/* Habits Widget */}
        <HabitsWidget habits={habits} onToggleHabit={handleToggleHabit} />

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
                  onClick={() => setShowAddModal(false)}
                  className="h-8 w-8 rounded-lg text-slate hover:bg-slate-100 flex items-center justify-center"
                  aria-label="Tutup"
                >
                  <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddHabit} className="space-y-4">
                <div>
                  <label className="block text-body-sm font-medium text-navy mb-1.5">
                    Nama Kebiasaan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jalan Kaki 7.000 Langkah"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                  />
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-navy mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={newHabitCategory}
                    onChange={(e) => setNewHabitCategory(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                  >
                    <option value="Kesehatan">Kesehatan</option>
                    <option value="Ibadah">Ibadah</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Mindset">Mindset</option>
                    <option value="Nutrisi">Nutrisi</option>
                    <option value="Recovery">Recovery</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
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
