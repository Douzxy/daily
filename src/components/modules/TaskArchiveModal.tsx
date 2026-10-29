'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBoxArchive,
  faCheck,
  faXmark,
  faPlus,
  faRotateLeft,
  faTrashCan,
  faCalendarDays,
  faClock,
  faMagnifyingGlass,
  faCalendarCheck,
} from '@fortawesome/free-solid-svg-icons'
import { TodoItem } from '@/types'
import { Storage } from '@/lib/storage'
import { showToast } from '@/components/ui/Toast'

interface TaskArchiveModalProps {
  isOpen: boolean
  onClose: () => void
  onTaskRestored?: () => void
}

type DateFilterType = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'

export default function TaskArchiveModal({
  isOpen,
  onClose,
  onTaskRestored,
}: TaskArchiveModalProps) {
  const [archivedTasks, setArchivedTasks] = useState<TodoItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all')
  const [customDate, setCustomDate] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Retroactive Quick Logger state
  const [showLogForm, setShowLogForm] = useState(false)
  const [logText, setLogText] = useState('')
  const [logCategory, setLogCategory] = useState('Kerja')
  const [logPriority, setLogPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [logDate, setLogDate] = useState('')
  const [logTime, setLogTime] = useState('')
  const [logNote, setLogNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get current date string in WIB
  const getWibDateStr = (d = new Date()) => {
    try {
      return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
    } catch {
      return d.toISOString().split('T')[0]
    }
  }

  const getWibTimeStr = (d = new Date()) => {
    try {
      return d.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    } catch {
      return '12:00'
    }
  }

  const todayStr = getWibDateStr()

  // Yesterday date string
  const yesterdayStr = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return getWibDateStr(d)
  }, [])

  // Two days ago date string
  const twoDaysAgoStr = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 2)
    return getWibDateStr(d)
  }, [])

  // Refresh data from storage
  const loadArchived = () => {
    const list = Storage.getArchivedTodos()
    setArchivedTasks(list)
  }

  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => {
      setArchivedTasks(Storage.getArchivedTodos())
      setLogDate(todayStr)
      setLogTime(getWibTimeStr())
    }, 0)

    const handleUpdate = () => {
      setArchivedTasks(Storage.getArchivedTodos())
    }
    window.addEventListener('lifetime-data-change', handleUpdate)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('lifetime-data-change', handleUpdate)
    }
  }, [isOpen, todayStr])

  // Stats calculation
  const stats = useMemo(() => {
    const total = archivedTasks.length
    let todayCount = 0
    let weekCount = 0
    let monthCount = 0

    const currentYearMonth = todayStr.substring(0, 7) // YYYY-MM
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = getWibDateStr(sevenDaysAgo)

    for (const t of archivedTasks) {
      const taskDate =
        t.completedDate ||
        (t.completedAt ? getWibDateStr(new Date(t.completedAt)) : '') ||
        (t.createdAt ? getWibDateStr(new Date(t.createdAt)) : '')

      if (taskDate === todayStr) todayCount++
      if (taskDate >= sevenDaysAgoStr && taskDate <= todayStr) weekCount++
      if (taskDate.startsWith(currentYearMonth)) monthCount++
    }

    return { total, todayCount, weekCount, monthCount }
  }, [archivedTasks, todayStr])

  // Unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>()
    archivedTasks.forEach((t) => {
      if (t.category) cats.add(t.category)
    })
    return Array.from(cats)
  }, [archivedTasks])

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = getWibDateStr(sevenDaysAgo)
    const currentYearMonth = todayStr.substring(0, 7)

    return archivedTasks.filter((t) => {
      // Search
      if (query) {
        const matchesTitle = t.text.toLowerCase().includes(query)
        const matchesNote = t.recentNote?.toLowerCase().includes(query)
        const matchesCategory = t.category?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesNote && !matchesCategory) return false
      }

      // Category
      if (categoryFilter !== 'all' && t.category !== categoryFilter) {
        return false
      }

      const taskDate =
        t.completedDate ||
        (t.completedAt ? getWibDateStr(new Date(t.completedAt)) : '') ||
        (t.createdAt ? getWibDateStr(new Date(t.createdAt)) : '')

      // Date filter
      if (dateFilter === 'today') {
        return taskDate === todayStr
      }
      if (dateFilter === 'yesterday') {
        return taskDate === yesterdayStr
      }
      if (dateFilter === 'week') {
        return taskDate >= sevenDaysAgoStr && taskDate <= todayStr
      }
      if (dateFilter === 'month') {
        return taskDate.startsWith(currentYearMonth)
      }
      if (dateFilter === 'custom' && customDate) {
        return taskDate === customDate
      }

      return true
    })
  }, [archivedTasks, searchQuery, dateFilter, customDate, categoryFilter, todayStr, yesterdayStr])

  // Group filtered tasks by Date
  const groupedTasks = useMemo(() => {
    const groups: { dateKey: string; displayLabel: string; items: TodoItem[] }[] = []
    const map = new Map<string, TodoItem[]>()

    filteredTasks.forEach((task) => {
      const dateKey =
        task.completedDate ||
        (task.completedAt ? getWibDateStr(new Date(task.completedAt)) : '') ||
        (task.createdAt ? getWibDateStr(new Date(task.createdAt)) : '') ||
        'Lainnya'

      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(task)
    })

    const sortedKeys = Array.from(map.keys()).sort((a, b) => b.localeCompare(a))

    for (const key of sortedKeys) {
      let displayLabel = key
      if (key === todayStr) {
        displayLabel = `Hari Ini (${formatDateIndo(key)})`
      } else if (key === yesterdayStr) {
        displayLabel = `Kemarin (${formatDateIndo(key)})`
      } else if (key !== 'Lainnya') {
        displayLabel = formatDateIndo(key)
      }

      groups.push({
        dateKey: key,
        displayLabel,
        items: map.get(key) || [],
      })
    }

    return groups
  }, [filteredTasks, todayStr, yesterdayStr])

  // Format date helper in Indonesian
  function formatDateIndo(dateStr: string) {
    try {
      const [y, m, d] = dateStr.split('-').map(Number)
      const dateObj = new Date(y, m - 1, d)
      return dateObj.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  // Format time helper
  function formatTime(isoOrStr?: string) {
    if (!isoOrStr) return ''
    try {
      const d = new Date(isoOrStr)
      if (isNaN(d.getTime())) return ''
      return (
        d.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }) + ' WIB'
      )
    } catch {
      return ''
    }
  }

  // Handle Log Finished Task Submit
  const handleSaveCompletedTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!logText.trim()) return

    setIsSubmitting(true)
    try {
      const targetDate = logDate || todayStr
      const targetTime = logTime || getWibTimeStr()
      const [h, m] = targetTime.split(':').map(Number)
      const [year, month, day] = targetDate.split('-').map(Number)
      const completeDateObj = new Date(year, (month || 1) - 1, day || 1, h || 12, m || 0)

      Storage.addCompletedTodo({
        text: logText.trim(),
        category: logCategory,
        priority: logPriority,
        done: true,
        isArchived: true,
        status: 'archived',
        completedDate: targetDate,
        completedAt: completeDateObj.toISOString(),
        recentNote: logNote.trim() || undefined,
      })

      showToast(`Pekerjaan "${logText.trim()}" dicatat ke riwayat ${targetDate}!`, 'success')
      setLogText('')
      setLogNote('')
      setShowLogForm(false)
      loadArchived()
    } catch (err) {
      showToast('Gagal mencatat pekerjaan', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Restore task back to active Today's Flow
  const handleRestoreTask = (task: TodoItem) => {
    Storage.unarchiveTodo(task.id)
    loadArchived()
    if (onTaskRestored) onTaskRestored()
    showToast(`Tugas "${task.text}" dikembalikan ke Alur Hari Ini`, 'success')
  }

  // Delete from archive
  const handleDeleteArchivedTask = (task: TodoItem) => {
    if (confirm(`Hapus permanen riwayat tugas "${task.text}"?`)) {
      Storage.deleteArchivedTodo(task.id)
      loadArchived()
      showToast('Tugas dihapus dari riwayat', 'info')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-surface rounded-2xl sm:rounded-3xl shadow-2xl border border-border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border bg-slate-50/50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <FontAwesomeIcon icon={faBoxArchive} className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-body font-heading font-bold text-navy sm:text-lg">
                    Riwayat & Log Tugas Selesai
                  </h3>
                  <span className="text-[11px] font-heading font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {stats.total} Tuntas
                  </span>
                </div>
                <p className="text-caption text-slate mt-0.5 line-clamp-1">
                  Arsip pekerjaan yang telah Anda selesaikan berdasarkan tanggal kalender.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLogForm((prev) => !prev)}
                className={`text-[12px] font-heading font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                  showLogForm
                    ? 'bg-navy text-white border-navy shadow-xs'
                    : 'bg-surface text-navy hover:bg-slate-100 border-border'
                }`}
              >
                <FontAwesomeIcon icon={showLogForm ? faXmark : faPlus} className="h-3 w-3" />
                <span>{showLogForm ? 'Tutup Input' : 'Catat Pekerjaan Selesai'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-xl text-slate hover:text-navy hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Tutup modal"
              >
                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4">
            <div className="p-2.5 sm:p-3 rounded-xl bg-surface border border-border shadow-2xs">
              <span className="text-[11px] font-heading text-slate font-medium block">Hari Ini</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-heading font-bold text-navy">{stats.todayCount}</span>
                <span className="text-[11px] text-slate-500 font-medium">tugas</span>
              </div>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-surface border border-border shadow-2xs">
              <span className="text-[11px] font-heading text-slate font-medium block">7 Hari Terakhir</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-heading font-bold text-navy">{stats.weekCount}</span>
                <span className="text-[11px] text-slate-500 font-medium">tugas</span>
              </div>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-surface border border-border shadow-2xs">
              <span className="text-[11px] font-heading text-slate font-medium block">Bulan Ini</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-heading font-bold text-navy">{stats.monthCount}</span>
                <span className="text-[11px] text-slate-500 font-medium">tugas</span>
              </div>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
              <span className="text-[11px] font-heading text-emerald-800 font-semibold block">Total Sepanjang Waktu</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-heading font-bold text-emerald-900">{stats.total}</span>
                <span className="text-[11px] text-emerald-700 font-medium">tuntas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Form: Catat Pekerjaan Selesai (Retroactive Entry) */}
        {showLogForm && (
          <div className="p-4 sm:p-5 bg-slate-50/90 border-b border-border animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <FontAwesomeIcon icon={faCalendarCheck} className="h-4 w-4 text-emerald-600" />
              <h4 className="text-body-sm font-heading font-bold text-navy">
                Catat Pekerjaan yang Sudah Selesai
              </h4>
              <span className="text-[11px] text-slate font-medium">
                (Bisa memilih tanggal selesai hari ini, kemarin, atau tanggal lalu)
              </span>
            </div>

            <form onSubmit={handleSaveCompletedTask} className="space-y-3">
              <div>
                <label className="text-[11px] font-heading font-bold text-slate-700 block mb-1">
                  Apa yang telah Anda selesaikan?
                </label>
                <input
                  type="text"
                  required
                  value={logText}
                  onChange={(e) => setLogText(e.target.value)}
                  placeholder="Misal: Backup VPS dan database, review PR tim, perbaiki bug..."
                  className="w-full px-3.5 py-2 text-body-sm rounded-xl border border-border bg-white text-navy focus:outline-hidden focus:border-navy focus:ring-1 focus:ring-navy font-heading"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Date Picker & Quick Date Chips */}
                <div>
                  <label className="text-[11px] font-heading font-bold text-slate-700 block mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    required
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-body-sm rounded-xl border border-border bg-white text-navy font-heading"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setLogDate(todayStr)}
                      className={`text-[10px] font-heading font-semibold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                        logDate === todayStr
                          ? 'bg-navy text-white border-navy'
                          : 'bg-white text-slate hover:text-navy border-border'
                      }`}
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogDate(yesterdayStr)}
                      className={`text-[10px] font-heading font-semibold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                        logDate === yesterdayStr
                          ? 'bg-navy text-white border-navy'
                          : 'bg-white text-slate hover:text-navy border-border'
                      }`}
                    >
                      Kemarin
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogDate(twoDaysAgoStr)}
                      className={`text-[10px] font-heading font-semibold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                        logDate === twoDaysAgoStr
                          ? 'bg-navy text-white border-navy'
                          : 'bg-white text-slate hover:text-navy border-border'
                      }`}
                    >
                      2 Hari Lalu
                    </button>
                  </div>
                </div>

                {/* Category & Priority */}
                <div>
                  <label className="text-[11px] font-heading font-bold text-slate-700 block mb-1">
                    Kategori & Prioritas
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={logCategory}
                      onChange={(e) => setLogCategory(e.target.value)}
                      className="px-2.5 py-1.5 text-body-sm rounded-xl border border-border bg-white text-navy font-heading"
                    >
                      <option value="Kerja">Kerja</option>
                      <option value="Belajar">Belajar</option>
                      <option value="Pribadi">Pribadi</option>
                      <option value="Rutinitas">Rutinitas</option>
                      <option value="Proyek">Proyek</option>
                      <option value="Umum">Umum</option>
                    </select>

                    <select
                      value={logPriority}
                      onChange={(e) => setLogPriority(e.target.value as any)}
                      className="px-2.5 py-1.5 text-body-sm rounded-xl border border-border bg-white text-navy font-heading"
                    >
                      <option value="high">Tinggi</option>
                      <option value="medium">Sedang</option>
                      <option value="low">Rendah</option>
                    </select>
                  </div>
                </div>

                {/* Time Finished */}
                <div>
                  <label className="text-[11px] font-heading font-bold text-slate-700 block mb-1">
                    Jam Selesai (Opsional)
                  </label>
                  <input
                    type="time"
                    value={logTime}
                    onChange={(e) => setLogTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-body-sm rounded-xl border border-border bg-white text-navy font-heading"
                  />
                </div>
              </div>

              {/* Note / Progres context */}
              <div>
                <label className="text-[11px] font-heading font-bold text-slate-700 block mb-1">
                  Catatan Ringkas / Hasil (Opsional)
                </label>
                <input
                  type="text"
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  placeholder="Misal: Sudah dikirim ke email atasan / hasil test aman 100%"
                  className="w-full px-3 py-1.5 text-body-sm rounded-xl border border-border bg-white text-navy focus:outline-hidden focus:border-navy font-heading"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="px-3.5 py-1.5 text-caption font-heading font-semibold text-slate hover:text-navy cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !logText.trim()}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-caption font-heading font-bold hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan ke Riwayat'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="p-3 sm:px-6 sm:py-3 border-b border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Date Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setDateFilter('all')
                setCustomDate('')
              }}
              className={`text-[12px] font-heading font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                dateFilter === 'all'
                  ? 'bg-navy text-white border-navy'
                  : 'bg-surface text-slate hover:text-navy border-border'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => {
                setDateFilter('today')
                setCustomDate('')
              }}
              className={`text-[12px] font-heading font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                dateFilter === 'today'
                  ? 'bg-navy text-white border-navy'
                  : 'bg-surface text-slate hover:text-navy border-border'
              }`}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => {
                setDateFilter('yesterday')
                setCustomDate('')
              }}
              className={`text-[12px] font-heading font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                dateFilter === 'yesterday'
                  ? 'bg-navy text-white border-navy'
                  : 'bg-surface text-slate hover:text-navy border-border'
              }`}
            >
              Kemarin
            </button>
            <button
              type="button"
              onClick={() => {
                setDateFilter('week')
                setCustomDate('')
              }}
              className={`text-[12px] font-heading font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                dateFilter === 'week'
                  ? 'bg-navy text-white border-navy'
                  : 'bg-surface text-slate hover:text-navy border-border'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              type="button"
              onClick={() => {
                setDateFilter('month')
                setCustomDate('')
              }}
              className={`text-[12px] font-heading font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                dateFilter === 'month'
                  ? 'bg-navy text-white border-navy'
                  : 'bg-surface text-slate hover:text-navy border-border'
              }`}
            >
              Bulan Ini
            </button>

            {/* Custom Date Picker */}
            <div className="relative shrink-0">
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value)
                  if (e.target.value) setDateFilter('custom')
                }}
                className={`text-[11px] font-heading font-semibold px-2 py-1 rounded-lg border transition-colors ${
                  dateFilter === 'custom' && customDate
                    ? 'border-navy text-navy bg-navy/5 font-bold'
                    : 'border-border text-slate bg-surface'
                }`}
                title="Pilih tanggal khusus"
              />
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari riwayat..."
                className="w-full pl-8 pr-3 py-1 text-[12px] rounded-lg border border-border bg-slate-50 text-navy font-heading focus:bg-white focus:outline-hidden focus:border-navy"
              />
            </div>

            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-[12px] font-heading px-2 py-1 rounded-lg border border-border bg-surface text-navy"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Scrollable Content: Grouped by Date */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {groupedTasks.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border bg-slate-50/50">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
                <FontAwesomeIcon icon={faBoxArchive} className="h-6 w-6" />
              </div>
              <h4 className="text-body font-heading font-bold text-navy">
                Tidak Ada Riwayat Tugas Selesai
              </h4>
              <p className="text-caption text-slate max-w-sm mx-auto mt-1 mb-4">
                {searchQuery || dateFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Tidak ada tugas yang cocok dengan filter atau pencarian Anda.'
                  : 'Belum ada tugas yang diarsipkan ke riwayat. Anda dapat mencatat pekerjaan yang telah selesai atau membersihkan tugas dari alur hari ini.'}
              </p>
              {searchQuery || dateFilter !== 'all' || categoryFilter !== 'all' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setDateFilter('all')
                    setCategoryFilter('all')
                    setCustomDate('')
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-border bg-white text-navy text-caption font-heading font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Reset Filter
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowLogForm(true)}
                  className="px-4 py-2 rounded-xl bg-navy text-white text-caption font-heading font-bold hover:bg-navy-hover transition-colors shadow-2xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                  <span>Catat Pekerjaan Selesai Sekarang</span>
                </button>
              )}
            </div>
          ) : (
            groupedTasks.map((group) => (
              <div key={group.dateKey} className="space-y-2.5">
                {/* Date Group Header */}
                <div className="flex items-center justify-between gap-3 sticky top-0 bg-surface/90 backdrop-blur-xs py-1 z-10">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarDays} className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-body-sm font-heading font-bold text-navy">
                      {group.displayLabel}
                    </span>
                  </div>
                  <span className="text-[11px] font-heading font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {group.items.length} selesai
                  </span>
                </div>

                {/* Items in this date */}
                <div className="space-y-2">
                  {group.items.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 sm:p-3.5 rounded-xl bg-white border border-border hover:border-slate-300 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Completed Checkmark Icon */}
                        <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                          <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
                        </div>

                        {/* Title & Context */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-body-sm font-heading font-semibold text-navy">
                              {task.text}
                            </span>

                            {task.category && (
                              <span className="text-[10px] font-heading font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                {task.category}
                              </span>
                            )}

                            {task.priority === 'high' && (
                              <span className="text-[10px] font-heading font-bold px-1.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                                Tinggi
                              </span>
                            )}
                          </div>

                          {/* Progress Note if exists */}
                          {task.recentNote && (
                            <p className="text-[12px] text-slate-600 bg-slate-50 border border-slate-200/60 rounded-lg px-2.5 py-1 mt-1.5 font-sans">
                              <span className="font-semibold text-slate-700">Catatan:</span> {task.recentNote}
                            </p>
                          )}

                          {/* Completed Timestamp */}
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-1">
                            {task.completedAt && (
                              <span className="flex items-center gap-1">
                                <FontAwesomeIcon icon={faClock} className="h-2.5 w-2.5" />
                                <span>{formatTime(task.completedAt)}</span>
                              </span>
                            )}
                            {task.focusMinutes ? (
                              <span>• Fokus: {task.focusMinutes} menit</span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons: Restore & Delete */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 opacity-90 sm:opacity-75 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleRestoreTask(task)}
                          className="text-[11px] font-heading font-semibold px-2.5 py-1 rounded-lg border border-border bg-surface text-navy hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Kembalikan tugas ini ke Alur Hari Ini"
                        >
                          <FontAwesomeIcon icon={faRotateLeft} className="h-3 w-3 text-blue-600" />
                          <span>Pulihkan ke Hari Ini</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteArchivedTask(task)}
                          className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                          title="Hapus dari riwayat"
                        >
                          <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-6 sm:py-3.5 border-t border-border bg-slate-50 flex items-center justify-between text-caption font-heading">
          <div className="text-[12px] text-slate font-medium">
            Menampilkan <span className="font-bold text-navy">{filteredTasks.length}</span> dari{' '}
            <span className="font-bold text-navy">{stats.total}</span> tugas selesai
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-navy text-white font-bold hover:bg-navy-hover transition-colors shadow-2xs cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  )
}
