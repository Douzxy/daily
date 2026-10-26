'use client'

import React, { useState } from 'react'
import type { TodoItem, TaskFlowStatus } from '@/types'
import TaskMascot from '@/components/ui/TaskMascot'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faPlus,
  faWandMagicSparkles,
  faPalette,
  faCamera,
  faBriefcase,
  faDumbbell,
  faMoon,
  faEllipsisVertical,
  faTrashCan,
  faBolt,
  faHourglassHalf,
  faCircleCheck,
  faPenToSquare,
  faBroom,
  faCircle,
} from '@fortawesome/free-solid-svg-icons'
import { showToast } from '@/components/ui'

interface TodayFlowWidgetProps {
  todos: TodoItem[]
  onAddTodo: (todo: Omit<TodoItem, 'id'>) => void
  onToggleTodo: (id: string) => void
  onUpdateTodo?: (id: string, updates: Partial<TodoItem>) => void
  onDeleteTodo: (id: string) => void
  className?: string
}

// Calculate days waiting from creation date
function calculateDaysWaiting(createdAt?: string): number {
  if (!createdAt) return 0
  try {
    const created = new Date(createdAt).getTime()
    const now = Date.now()
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  } catch {
    return 0
  }
}

export default function TodayFlowWidget({
  todos,
  onAddTodo,
  onToggleTodo,
  onUpdateTodo,
  onDeleteTodo,
  className = '',
}: TodayFlowWidgetProps) {
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null)
  const [editingNoteTaskId, setEditingNoteTaskId] = useState<string | null>(null)
  const [noteInput, setNoteInput] = useState('')

  // Inline quick add state
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddText, setQuickAddText] = useState('')
  const [quickAddCategory, setQuickAddCategory] = useState<string>('kerja')

  // Calculated totals
  const totalTasks = todos.length
  const completedTasks = todos.filter((t) => t.done || t.status === 'done').length

  // Dynamic motivational momentum copy based on progress
  const getMomentumCopy = () => {
    if (totalTasks === 0) return 'Belum ada tugas. Tambahkan 1 tugas untuk memulai hari!'
    if (completedTasks === 0) return '0 selesai · Pilih 1 tugas untuk menyalakan momentum hari ini!'
    if (completedTasks === 1 && totalTasks > 1) return '1 selesai · Langkah pertama tuntas. Momentum terbangun!'
    if (completedTasks === totalTasks) return `Semua ${totalTasks} tuntas! Hari yang luar biasa produktif!`
    return `${completedTasks}/${totalTasks} selesai · Progres terus bergulir, pertahankan ritme!`
  }

  // Handle Quick Add Submit
  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickAddText.trim()) return

    onAddTodo({
      text: quickAddText.trim(),
      done: false,
      category: quickAddCategory,
      status: 'todo',
      createdAt: new Date().toISOString(),
    })

    setQuickAddText('')
    setShowQuickAdd(false)
    showToast(`Tugas "${quickAddText.trim()}" ditambahkan ke Alur Hari Ini!`, 'success')
  }

  // Cycle task status: todo -> in_progress -> waiting -> done -> todo
  const handleCycleStatus = (task: TodoItem) => {
    if (!onUpdateTodo) {
      onToggleTodo(task.id)
      return
    }

    const current = task.status || (task.done ? 'done' : 'todo')
    let nextStatus: TaskFlowStatus = 'in_progress'

    if (current === 'todo') nextStatus = 'in_progress'
    else if (current === 'in_progress') nextStatus = 'waiting'
    else if (current === 'waiting') nextStatus = 'done'
    else nextStatus = 'todo'

    onUpdateTodo(task.id, {
      status: nextStatus,
      done: nextStatus === 'done',
    })

    if (nextStatus === 'in_progress') {
      showToast(`Tugas masuk status In Progress: "${task.text}"`, 'info')
    } else if (nextStatus === 'done') {
      showToast(`Tugas "${task.text}" berhasil diselesaikan!`, 'success')
    }
  }

  // Set explicit status
  const handleSetStatus = (id: string, status: TaskFlowStatus) => {
    if (onUpdateTodo) {
      onUpdateTodo(id, {
        status,
        done: status === 'done',
      })
    } else if (status === 'done') {
      onToggleTodo(id)
    }
    setActiveMenuTaskId(null)
  }

  // Save context note on task
  const handleSaveNote = (id: string) => {
    if (onUpdateTodo) {
      onUpdateTodo(id, { recentNote: noteInput.trim() })
    }
    setEditingNoteTaskId(null)
    setNoteInput('')
    showToast('Catatan progres diperbarui', 'info')
  }

  // Clear completed tasks
  const handleRemoveCompleted = () => {
    const doneTasks = todos.filter((t) => t.done || t.status === 'done')
    if (doneTasks.length === 0) return
    doneTasks.forEach((t) => onDeleteTodo(t.id))
    showToast(`${doneTasks.length} tugas selesai telah dibersihkan`, 'info')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Today's Flow Tasks List */}
      <div className="space-y-2.5">
        {todos.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-surface/50">
            <div className="inline-flex mb-3">
              <TaskMascot status="todo" daysWaiting={0} size="lg" />
            </div>
            <h4 className="text-body font-heading font-bold text-navy">
              Alur Hari Ini Masih Kosong
            </h4>
            <p className="text-caption text-slate max-w-sm mx-auto mt-1 mb-4">
              Tambahkan tugas atau rutinitas utama yang ingin Anda selesaikan hari ini untuk mengaktifkan maskot fokus!
            </p>
            <button
              type="button"
              onClick={() => setShowQuickAdd(true)}
              className="px-4 py-2 rounded-xl bg-navy text-white text-caption font-heading font-bold hover:bg-navy-hover transition-all shadow-xs"
            >
              + Buat Tugas Pertama
            </button>
          </div>
        ) : (
          todos.map((task) => {
            const daysWaiting = calculateDaysWaiting(task.createdAt)
            const currentStatus = task.status || (task.done ? 'done' : 'todo')
            const isDone = currentStatus === 'done'
            const isMenuOpen = activeMenuTaskId === task.id
            const isEditingNote = editingNoteTaskId === task.id
            const isInProgress = currentStatus === 'in_progress'

            return (
              <div
                key={task.id}
                className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
                  isDone
                    ? 'bg-slate-50/70 border-border/70 opacity-80'
                    : isInProgress
                    ? 'bg-white border-purple-400 shadow-sm ring-2 ring-purple-100'
                    : 'bg-white border-border shadow-2xs hover:border-slate/40'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Left: Dynamic Gamified Mascot */}
                  <div
                    onClick={() => handleCycleStatus(task)}
                    className="cursor-pointer transition-transform active:scale-90"
                    title="Klik maskot untuk mengganti status tugas"
                  >
                    <TaskMascot
                      status={currentStatus}
                      daysWaiting={daysWaiting}
                      size="md"
                      showTooltip
                    />
                  </div>

                  {/* Center: Title, Status Badge, Sub-Activity Note */}
                  <div className="min-w-0 flex-1">
                    {/* Top line: Title & quick actions */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        onClick={() => onToggleTodo(task.id)}
                        className={`text-body-sm sm:text-body font-heading font-bold cursor-pointer transition-all ${
                          isDone
                            ? 'line-through text-slate-400 font-medium'
                            : 'text-navy hover:text-navy-hover'
                        }`}
                      >
                        {task.text}
                      </span>

                      {/* Right Three-Dots Context Menu Button */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => setActiveMenuTaskId(isMenuOpen ? null : task.id)}
                          className="h-7 w-7 rounded-lg text-slate-400 hover:text-navy hover:bg-slate-100 flex items-center justify-center transition-colors"
                          aria-label="Opsi tugas"
                        >
                          <FontAwesomeIcon icon={faEllipsisVertical} className="h-3.5 w-3.5" />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div className="absolute right-0 top-8 z-30 w-48 rounded-xl bg-surface border border-border shadow-lg p-1.5 text-caption font-heading animate-fade-in">

                            <button
                              type="button"
                              onClick={() => {
                                setEditingNoteTaskId(task.id)
                                setNoteInput(task.recentNote || '')
                                setActiveMenuTaskId(null)
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-700 font-medium"
                            >
                              <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3" />
                              <span>{task.recentNote ? 'Edit Catatan Progres' : '+ Catatan Progres'}</span>
                            </button>

                            <div className="my-1 border-t border-border" />

                            <div className="px-2.5 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              Ubah Status
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSetStatus(task.id, 'todo')}
                              className="w-full text-left px-2.5 py-1 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-700"
                            >
                              <FontAwesomeIcon icon={faCircle} className="h-2.5 w-2.5 text-slate-400" />
                              <span>Belum Dimulai</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStatus(task.id, 'in_progress')}
                              className="w-full text-left px-2.5 py-1 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-purple-700"
                            >
                              <FontAwesomeIcon icon={faBolt} className="h-2.5 w-2.5 text-purple-500" />
                              <span>In Progress</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStatus(task.id, 'waiting')}
                              className="w-full text-left px-2.5 py-1 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-blue-700"
                            >
                              <FontAwesomeIcon icon={faHourglassHalf} className="h-2.5 w-2.5 text-blue-500" />
                              <span>Waiting / Tertunda</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStatus(task.id, 'done')}
                              className="w-full text-left px-2.5 py-1 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-emerald-700 font-semibold"
                            >
                              <FontAwesomeIcon icon={faCheck} className="h-2.5 w-2.5 text-emerald-500" />
                              <span>Tandai Selesai</span>
                            </button>

                            <div className="my-1 border-t border-border" />

                            <button
                              type="button"
                              onClick={() => {
                                onDeleteTodo(task.id)
                                setActiveMenuTaskId(null)
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
                              <span>Hapus Tugas</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Pill & Waiting Days Badge */}
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {currentStatus === 'in_progress' && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-heading font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <FontAwesomeIcon icon={faBolt} className="h-2.5 w-2.5 text-amber-500" />
                          <span>In Progress</span>
                        </span>
                      )}

                      {currentStatus === 'waiting' && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-heading font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          <FontAwesomeIcon icon={faHourglassHalf} className="h-2.5 w-2.5 text-blue-500" />
                          <span>Waiting</span>
                        </span>
                      )}

                      {currentStatus === 'done' && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-heading font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <FontAwesomeIcon icon={faCheck} className="h-2.5 w-2.5 text-emerald-600" />
                          <span>Done</span>
                        </span>
                      )}

                      {currentStatus === 'todo' && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-heading font-medium text-slate-500">
                          <FontAwesomeIcon icon={faCircle} className="h-1.5 w-1.5 text-slate-300" />
                          <span>
                            {daysWaiting === 0
                              ? 'Ditambahkan hari ini'
                              : `Menunggu ${daysWaiting} hari`}
                          </span>
                        </span>
                      )}

                      {task.category && (
                        <span className="text-[10px] font-heading font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {task.category}
                        </span>
                      )}

                      {task.focusMinutes ? (
                        <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                          ⏱ {task.focusMinutes}m fokus
                        </span>
                      ) : null}
                    </div>

                    {/* Sub-note / Context activity bubble */}
                    {task.recentNote && !isEditingNote && (
                      <div className="mt-2.5 p-2 px-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[12px] text-slate-700 flex items-center justify-between gap-2">
                        <span className="italic line-clamp-1">{task.recentNote}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteTaskId(task.id)
                            setNoteInput(task.recentNote || '')
                          }}
                          className="text-[10px] font-bold text-slate-400 hover:text-navy uppercase tracking-wider shrink-0"
                        >
                          Ubah
                        </button>
                      </div>
                    )}

                    {/* Inline Note Editor */}
                    {isEditingNote && (
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <input
                          type="text"
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="Tulis progres mikro (misal: review draft bab 1)..."
                          className="flex-1 px-3 py-1 text-caption rounded-lg border border-border bg-white text-navy focus:outline-hidden focus:border-navy"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveNote(task.id)
                            if (e.key === 'Escape') setEditingNoteTaskId(null)
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveNote(task.id)}
                          className="px-2.5 py-1 text-[11px] font-heading font-bold rounded-lg bg-navy text-white"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingNoteTaskId(null)}
                          className="px-2 py-1 text-[11px] font-heading text-slate-500 hover:text-navy"
                        >
                          Batal
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 3. Inline Quick Add Input */}
      {showQuickAdd && (
        <form
          onSubmit={handleQuickAddSubmit}
          className="p-3.5 rounded-2xl bg-white border border-navy/20 shadow-sm animate-fade-in space-y-2.5"
        >
          {/* Quick Idea Picker */}
          <div className="flex items-center gap-1.5 flex-wrap pb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
              <FontAwesomeIcon icon={faWandMagicSparkles} className="text-navy text-[10px]" />
              Rekomendasi Cepat:
            </span>
            {[
              { label: 'Edit Anime Visual', icon: faPalette, text: 'Edit visual anime aesthetic & poster typography', cat: 'kerja' },
              { label: 'Preset & Color Grading', icon: faCamera, text: 'Eksperimen preset color grading aesthetic pada foto', cat: 'kerja' },
              { label: 'Deep Work 45m', icon: faBriefcase, text: 'Sesi Deep Work 45 menit fokus tanpa distraksi HP', cat: 'kerja' },
              { label: 'Push Day Gym', icon: faDumbbell, text: 'Latihan Push Day: Bench press, shoulder & delts', cat: 'rutinitas' },
              { label: 'Tidur Jam 23:00', icon: faMoon, text: 'Screen-off jam 22:30 & tidur sebelum jam 23:00', cat: 'rutinitas' },
            ].map((idea, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuickAddText(idea.text)
                  setQuickAddCategory(idea.cat)
                }}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-navy/10 hover:text-navy text-slate-700 transition-colors cursor-pointer border border-border/70"
                title="Klik untuk mengisi teks otomatis"
              >
                <FontAwesomeIcon icon={idea.icon} className="text-[10px] mr-1 text-slate-500" />
                <span>{idea.label}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={quickAddText}
              onChange={(e) => setQuickAddText(e.target.value)}
              placeholder="Apa yang ingin Anda kerjakan hari ini?"
              className="flex-1 px-3.5 py-2 text-body-sm rounded-xl border border-border bg-bg text-navy placeholder:text-slate/60 focus:outline-hidden focus:border-navy"
              autoFocus
            />

            <select
              value={quickAddCategory}
              onChange={(e) => setQuickAddCategory(e.target.value)}
              className="px-3 py-2 text-caption rounded-xl border border-border bg-white text-navy font-heading font-medium"
            >
              <option value="kerja">Kerja</option>
              <option value="belajar">Belajar</option>
              <option value="pribadi">Pribadi</option>
              <option value="rutinitas">Rutinitas</option>
            </select>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-navy text-white text-caption font-heading font-bold hover:bg-navy-hover transition-all"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setShowQuickAdd(false)}
                className="px-3 py-2 text-caption font-heading text-slate hover:text-navy"
              >
                Batal
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 4. Bottom Momentum Bar & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-caption border-t border-border">
        {/* Dynamic Momentum copy */}
        <div className="flex items-center gap-2 text-slate-700 font-heading">
          <span className="font-bold text-navy">
            {completedTasks}/{totalTasks}
          </span>
          <span>•</span>
          <span className="text-[12px] font-medium text-slate-600">
            {getMomentumCopy()}
          </span>
        </div>

        {/* Buttons: Add Task & Remove Done */}
        <div className="flex items-center gap-3 shrink-0">
          {completedTasks > 0 && (
            <button
              type="button"
              onClick={handleRemoveCompleted}
              className="text-[12px] font-heading font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1.5 transition-colors"
            >
              <FontAwesomeIcon icon={faBroom} className="h-3 w-3" />
              <span>Bersihkan {completedTasks} Selesai</span>
            </button>
          )}

          {!showQuickAdd && (
            <button
              type="button"
              onClick={() => setShowQuickAdd(true)}
              className="text-[12px] font-heading font-bold text-navy hover:text-navy-hover flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
              <span>Tambah Tugas</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
