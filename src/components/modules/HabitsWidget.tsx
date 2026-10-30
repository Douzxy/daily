'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faFire,
  faCheck,
  faGlassWater,
  faMosque,
  faDumbbell,
  faBookOpen,
  faClock,
  faCircleCheck,
  faPlus,
  faPenToSquare,
  faTrashCan,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { Card, Button, showToast, ConfirmModal } from '@/components/ui'
import type { Habit } from '@/types'
import { DAY_NAMES_ID, MONTH_NAMES_ID, getTodayDateStr } from '@/lib/dateUtils'

interface HabitsWidgetProps {
  habits: Habit[]
  loading?: boolean
  onToggleHabit: (id: string) => void
  onToggleDate?: (id: string, date: string) => void
  onAddHabit: (name: string, category: string) => void
  onEditHabit: (id: string, updates: Partial<Habit>) => void
  onDeleteHabit: (id: string) => void
}

export const HABIT_CATEGORIES = [
  'Kesehatan',
  'Ibadah',
  'Fitness',
  'Mindset',
  'Nutrisi',
  'Recovery',
  'Produktivitas',
]

const pad = (n: number) => String(n).padStart(2, '0')

/** Last 7 calendar days ending today (oldest first). */
function getLast7Days(todayStr: string) {
  const [y, m, d] = todayStr.split('-').map(Number)
  const days: { date: string; dayNumber: number; label: string; isToday: boolean }[] = []
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(y, (m || 1) - 1, (d || 1) - i, 12)
    const date = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
    days.push({
      date,
      dayNumber: dt.getDate(),
      label: `${DAY_NAMES_ID[dt.getDay()]}, ${dt.getDate()} ${MONTH_NAMES_ID[dt.getMonth()]}`,
      isToday: i === 0,
    })
  }
  return days
}

function getHabitIcon(name: string): IconDefinition {
  const lower = name.toLowerCase()
  if (lower.includes('air') || lower.includes('minum')) return faGlassWater
  if (lower.includes('sholat') || lower.includes('ibadah') || lower.includes('quran')) return faMosque
  if (lower.includes('workout') || lower.includes('gym') || lower.includes('lari')) return faDumbbell
  if (lower.includes('buku') || lower.includes('baca')) return faBookOpen
  if (lower.includes('tidur') || lower.includes('jam') || lower.includes('bangun')) return faClock
  return faCircleCheck
}

export default function HabitsWidget({
  habits,
  loading = false,
  onToggleHabit,
  onToggleDate,
  onAddHabit,
  onEditHabit,
  onDeleteHabit,
}: HabitsWidgetProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [habitName, setHabitName] = useState('')
  const [habitCategory, setHabitCategory] = useState(HABIT_CATEGORIES[0])

  const week = getLast7Days(getTodayDateStr())

  const openAdd = () => {
    setEditingHabit(null)
    setHabitName('')
    setHabitCategory(HABIT_CATEGORIES[0])
    setShowModal(true)
  }

  const openEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setHabitName(habit.name)
    setHabitCategory(habit.category || HABIT_CATEGORIES[0])
    setShowModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = habitName.trim()
    if (!name) return
    if (editingHabit) {
      onEditHabit(editingHabit.id, { name, category: habitCategory })
      showToast('Habit diperbarui', 'success')
    } else {
      onAddHabit(name, habitCategory)
      showToast(`"${name}" ditambahkan`, 'success')
    }
    setShowModal(false)
    setEditingHabit(null)
    setHabitName('')
  }

  return (
    <Card className="p-0! sm:p-0! overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-border">
        <div className="min-w-0">
          <h2 className="text-body-lg font-heading font-bold text-navy">Daftar habit</h2>
          <p className="text-caption text-slate">Tap kotak untuk hari ini, tap tanggal untuk hari sebelumnya</p>
        </div>
        <Button id="habit-add-button" variant="primary" size="sm" onClick={openAdd} className="shrink-0">
          <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
          <span>Tambah</span>
        </Button>
      </div>

      {loading ? (
        <div className="p-4 sm:p-5 space-y-2.5" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-body-sm font-semibold text-navy">Belum ada habit</p>
          <p className="text-caption text-slate mt-1">Tambahkan satu kebiasaan kecil yang mau kamu jaga tiap hari.</p>
          <Button variant="secondary" size="sm" onClick={openAdd} className="mt-4">
            <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
            Tambah habit pertama
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {habits.map((habit) => {
            const done = habit.completedToday
            return (
              <li
                key={habit.id}
                className={`group flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-5 py-3.5 transition-colors ${
                  done ? 'bg-emerald-50/50' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    id={`habit-toggle-${habit.id}`}
                    onClick={() => onToggleHabit(habit.id)}
                    aria-pressed={done}
                    aria-label={done ? `Batalkan ${habit.name} hari ini` : `Tandai ${habit.name} selesai hari ini`}
                    className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center border-2 transition-all duration-150 active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-navy/20 ${
                      done
                        ? 'bg-sage border-sage text-white shadow-xs'
                        : 'bg-white border-slate-300 text-slate-300 hover:border-sage hover:text-sage'
                    }`}
                  >
                    <FontAwesomeIcon icon={done ? faCheck : getHabitIcon(habit.name)} className="h-3.5 w-3.5" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className={`text-body-sm font-semibold wrap-break-word ${done ? 'text-slate' : 'text-navy'}`}>
                      {habit.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate">{habit.category}</span>
                      {habit.streak > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                          <FontAwesomeIcon icon={faFire} className="h-2.5 w-2.5 text-amber-500" />
                          {habit.streak} hari
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0 sm:hidden">
                    <button
                      type="button"
                      onClick={() => openEdit(habit)}
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-navy hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                      aria-label={`Ubah ${habit.name}`}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: habit.id, name: habit.name })}
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                      aria-label={`Hapus ${habit.name}`}
                    >
                      <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-12 sm:pl-0">
                  <div className="flex items-center gap-1" role="group" aria-label={`7 hari terakhir: ${habit.name}`}>
                    {week.map((day) => {
                      const dayDone = Boolean(habit.history?.[day.date])
                      return (
                        <button
                          key={day.date}
                          type="button"
                          title={`${day.label}${dayDone ? ' — selesai' : ''}`}
                          aria-label={`${day.label}: ${dayDone ? 'selesai' : 'belum'}`}
                          aria-pressed={dayDone}
                          onClick={() =>
                            day.isToday || !onToggleDate
                              ? onToggleHabit(habit.id)
                              : onToggleDate(habit.id, day.date)
                          }
                          className={`h-7 w-7 rounded-full text-[10px] font-semibold tabular-nums flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30 ${
                            dayDone
                              ? 'bg-sage text-white'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          } ${day.isToday ? 'ring-2 ring-offset-1 ring-navy/70' : ''}`}
                        >
                          {day.dayNumber}
                        </button>
                      )
                    })}
                  </div>

                  <div className="hidden sm:flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => openEdit(habit)}
                      className="h-8 w-8 rounded-lg text-slate-500 hover:text-navy hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                      aria-label={`Ubah ${habit.name}`}
                      title="Ubah"
                    >
                      <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: habit.id, name: habit.name })}
                      className="h-8 w-8 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                      aria-label={`Hapus ${habit.name}`}
                      title="Hapus"
                    >
                      <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-surface border border-border shadow-2xl p-5 z-10 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-body-lg font-heading font-bold text-navy">
                {editingHabit ? 'Ubah habit' : 'Habit baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="h-8 w-8 rounded-lg text-slate hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                aria-label="Tutup"
              >
                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="habit-name-input" className="block text-body-sm font-medium text-navy mb-1.5">
                  Nama
                </label>
                <input
                  id="habit-name-input"
                  type="text"
                  required
                  autoFocus
                  maxLength={80}
                  placeholder="Contoh: Jalan kaki 20 menit"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy focus:ring-3 focus:ring-navy/10"
                />
              </div>

              <div>
                <span className="block text-body-sm font-medium text-navy mb-1.5">Kategori</span>
                <div className="flex flex-wrap gap-1.5">
                  {HABIT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setHabitCategory(cat)}
                      aria-pressed={habitCategory === cat}
                      className={`h-8 px-3 rounded-full text-caption font-medium border transition-colors cursor-pointer ${
                        habitCategory === cat
                          ? 'bg-navy text-white border-navy'
                          : 'bg-surface text-slate-700 border-border hover:border-navy/40'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" size="md" onClick={() => setShowModal(false)}>
                  Batal
                </Button>
                <Button id="habit-save-button" type="submit" variant="primary" size="md">
                  {editingHabit ? 'Simpan' : 'Tambah habit'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteHabit(deleteTarget.id)
            showToast(`"${deleteTarget.name}" dihapus`, 'info')
          }
        }}
        title="Hapus habit"
        message={`Hapus "${deleteTarget?.name}"? Riwayat dan streak-nya ikut hilang.`}
        confirmText="Hapus"
        variant="danger"
      />
    </Card>
  )
}
