'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faListCheck,
  faFire,
  faCheck,
  faGlassWater,
  faMosque,
  faDumbbell,
  faBookOpen,
  faBed,
  faClock,
  faCircleCheck,
  faPlus,
  faPenToSquare,
  faTrashCan,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { Card, Badge, ProgressBar, Button, showToast, ConfirmModal, TaskMascot } from '@/components/ui'
import type { Habit } from '@/types'
import { Storage } from '@/lib/storage'

interface HabitsWidgetProps {
  habits: Habit[]
  onToggleHabit: (id: string) => void
  onAddHabit?: (name: string, category: string) => void
  onEditHabit?: (id: string, updates: Partial<Habit>) => void
  onDeleteHabit?: (id: string) => void
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

export default function HabitsWidget({
  habits,
  onToggleHabit,
  onAddHabit,
  onEditHabit,
  onDeleteHabit,
}: HabitsWidgetProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [deleteConfirmHabit, setDeleteConfirmHabit] = useState<{ id: string; name: string } | null>(null)
  const [habitName, setHabitName] = useState('')
  const [habitCategory, setHabitCategory] = useState(HABIT_CATEGORIES[0])

  const completedCount = habits.filter((h) => h.completedToday).length
  const totalHabits = habits.length
  const pct = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0

  const getHabitIcon = (name: string): IconDefinition => {
    const lower = name.toLowerCase()
    if (lower.includes('air') || lower.includes('minum')) return faGlassWater
    if (lower.includes('sholat') || lower.includes('ibadah') || lower.includes('quran')) return faMosque
    if (lower.includes('workout') || lower.includes('gym') || lower.includes('lari')) return faDumbbell
    if (lower.includes('buku') || lower.includes('baca')) return faBookOpen
    if (lower.includes('tidur') || lower.includes('jam') || lower.includes('bangun')) return faClock
    return faCircleCheck
  }

  const handleOpenAdd = () => {
    setEditingHabit(null)
    setHabitName('')
    setHabitCategory(HABIT_CATEGORIES[0])
    setShowAddModal(true)
  }

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setHabitName(habit.name)
    setHabitCategory(habit.category || HABIT_CATEGORIES[0])
    setShowAddModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!habitName.trim()) return

    if (editingHabit) {
      if (onEditHabit) {
        onEditHabit(editingHabit.id, {
          name: habitName.trim(),
          category: habitCategory,
        })
      } else {
        Storage.updateHabit(editingHabit.id, {
          name: habitName.trim(),
          category: habitCategory,
        })
      }
      showToast(`Kebiasaan "${habitName.trim()}" berhasil diperbarui!`, 'success')
    } else {
      if (onAddHabit) {
        onAddHabit(habitName.trim(), habitCategory)
      } else {
        Storage.addHabit({
          name: habitName.trim(),
          category: habitCategory,
          icon: 'CircleCheck',
        })
      }
      showToast(`Kebiasaan "${habitName.trim()}" berhasil ditambahkan!`, 'success')
    }

    setShowAddModal(false)
    setEditingHabit(null)
    setHabitName('')
  }

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirmHabit({ id, name })
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy">
            <FontAwesomeIcon icon={faListCheck} className="h-4 w-4 sm:h-5 sm:w-5 text-navy" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-body-lg sm:text-h4 font-heading font-bold text-navy truncate">
                Habit Rutinitas Harian
              </h3>
              <Badge variant="navy" className="text-[10px] py-0.5 px-2 shrink-0">
                Atomic Habits
              </Badge>
            </div>
            <p className="text-caption text-slate mt-0.5 truncate sm:whitespace-normal">
              Konsistensi harian penentu pembentukan kebiasaan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            className="gap-1.5 shadow-xs"
          >
            <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
            <span>Tambah</span>
          </Button>
        </div>
      </div>

      <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-border/80 flex items-center gap-3">
        <div className="shrink-0">
          <TaskMascot
            state={pct === 100 && totalHabits > 0 ? 'done' : pct > 0 ? 'in_progress' : 'added_today'}
            size={38}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-caption font-mono font-bold text-navy mb-1.5">
            <span>{completedCount} / {totalHabits} Selesai</span>
            <span className="text-slate font-medium">{pct}% hari ini</span>
          </div>
          <ProgressBar
            value={completedCount}
            max={totalHabits}
            color={pct === 100 ? 'sage' : 'navy'}
            size="sm"
            showLabel={false}
          />
        </div>
      </div>

      {/* Habit items */}
      <div className="space-y-2">
        {habits.length === 0 ? (
          <div className="p-6 text-center text-caption text-slate border border-dashed border-border rounded-xl bg-slate-50/40">
            <p className="font-medium text-navy">Belum ada kebiasaan</p>
            <p className="text-[11px] text-slate mt-0.5">Klik tombol + Tambah di atas untuk membuat habit baru</p>
          </div>
        ) : (
          habits.map((habit) => (
            <div
              key={habit.id}
              className={`
                group flex items-center justify-between p-3 rounded-xl border
                transition-all duration-150 select-none
                ${
                  habit.completedToday
                    ? 'bg-emerald-50/60 border-emerald-300/70 text-navy'
                    : 'bg-surface border-border hover:border-slate/30 hover:bg-slate-50/50'
                }
              `}
            >
              <div
                onClick={() => onToggleHabit(habit.id)}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              >
                <div
                  className={`h-5 w-5 rounded-md flex items-center justify-center transition-all shrink-0 ${
                    habit.completedToday
                      ? 'bg-navy text-white shadow-2xs'
                      : 'border-1.5 border-slate-300 bg-white hover:border-navy'
                  }`}
                >
                  {habit.completedToday && (
                    <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                  )}
                </div>

                <div className="flex items-center gap-2 truncate">
                  <span className="p-1 rounded bg-white/80 border border-border/60 flex items-center justify-center w-6 h-6 shrink-0">
                    <FontAwesomeIcon
                      icon={getHabitIcon(habit.name)}
                      className="text-[11px] text-navy"
                    />
                  </span>
                  <div className="truncate">
                    <span
                      className={`text-body-sm font-medium block truncate ${
                        habit.completedToday ? 'line-through text-slate' : 'text-navy'
                      }`}
                    >
                      {habit.name}
                    </span>
                    <span className="text-[10px] text-slate block leading-tight">
                      {habit.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                <div className="flex items-center gap-1.5 text-caption font-semibold font-mono text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/50">
                  <FontAwesomeIcon icon={faFire} className="text-xs text-amber-500" />
                  <span>{habit.streak}d</span>
                </div>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenEdit(habit)
                  }}
                  className="h-7 w-7 rounded-lg text-slate-400 hover:text-navy hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                  title="Ubah nama / kategori kebiasaan"
                  aria-label="Edit kebiasaan"
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3" />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(habit.id, habit.name)
                  }}
                  className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                  title="Hapus kebiasaan ini"
                  aria-label="Hapus kebiasaan"
                >
                  <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border shadow-2xl p-6 z-10 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-h4 font-heading font-bold text-navy">
                {editingHabit ? 'Ubah Kebiasaan' : 'Tambah Habit Baru'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="h-8 w-8 rounded-lg text-slate hover:bg-slate-100 flex items-center justify-center"
                aria-label="Tutup"
              >
                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Nama Kebiasaan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jalan Kaki 7.000 Langkah / Baca 10 Halaman"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Kategori
                </label>
                <select
                  value={habitCategory}
                  onChange={(e) => setHabitCategory(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                >
                  {HABIT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
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
                  {editingHabit ? 'Simpan Perubahan' : 'Simpan Habit'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Habit Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmHabit}
        onClose={() => setDeleteConfirmHabit(null)}
        onConfirm={() => {
          if (deleteConfirmHabit) {
            if (onDeleteHabit) {
              onDeleteHabit(deleteConfirmHabit.id)
            } else {
              Storage.deleteHabit(deleteConfirmHabit.id)
            }
            showToast(`Kebiasaan "${deleteConfirmHabit.name}" berhasil dihapus`, 'info')
          }
        }}
        title="Hapus Kebiasaan"
        message={`Yakin ingin menghapus kebiasaan "${deleteConfirmHabit?.name}"? Data streak rutinitas ini akan dihapus permanen.`}
        confirmText="Ya, Hapus"
        variant="danger"
      />
    </Card>
  )
}
