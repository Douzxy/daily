'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import FinanceWidget, { formatRupiah } from '@/components/modules/FinanceWidget'
import PeriodFilterBar, { type PeriodMode } from '@/components/layout/PeriodFilterBar'
import { Card, Badge, ProgressBar, showToast, ConfirmModal, Button } from '@/components/ui'
import { Storage } from '@/lib/storage'
import type { Transaction, BudgetCategory, SavingsGoal } from '@/types'
import { formatDots, parseDots } from '@/lib/format'
import {
  MONTH_NAMES_ID,
  AVAILABLE_YEARS,
  getCurrentYearAndMonth,
  getWeeksInMonth,
  getTodayDateStr,
} from '@/lib/dateUtils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPiggyBank,
  faArrowTrendUp,
  faShieldHalved,
  faBullseye,
  faPlus,
  faPenToSquare,
  faTrashCan,
  faChevronLeft,
  faChevronRight,
  faCalendarDays,
  faXmark,
  faFilter,
} from '@fortawesome/free-solid-svg-icons'

export default function FinancePage() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window !== 'undefined') return Storage.getTransactions()
    return []
  })

  const [budgets, setBudgets] = useState<BudgetCategory[]>(() => {
    if (typeof window !== 'undefined') return Storage.getBudgets()
    return []
  })

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    if (typeof window !== 'undefined') return Storage.getSavingsGoals()
    return []
  })

  // Date & Period Filter State
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

  // Savings Goal Modal States
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [deleteConfirmGoal, setDeleteConfirmGoal] = useState<SavingsGoal | null>(null)
  const [goalTitle, setGoalTitle] = useState('')
  const [goalTargetStr, setGoalTargetStr] = useState('')
  const [goalCurrentStr, setGoalCurrentStr] = useState('')
  const [goalColor, setGoalColor] = useState<'sage' | 'navy' | 'info' | 'warning'>('sage')

  useEffect(() => {
    const refresh = () => {
      setTransactions(Storage.getTransactions())
      setBudgets(Storage.getBudgets())
      setSavingsGoals(Storage.getSavingsGoals())
    }
    refresh()
    window.addEventListener('lifetime-data-change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('lifetime-data-change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  // Weeks available in the chosen year & month
  const weeksInMonth = getWeeksInMonth(selectedYear, selectedMonthIndex)
  const activeWeek =
    weeksInMonth.find((w) => w.weekNumber === selectedWeekNumber) || weeksInMonth[0]

  // Filter transactions based on active period
  const todayStr = getTodayDateStr()
  const monthPrefix = `${selectedYear}-${String(selectedMonthIndex + 1).padStart(2, '0')}`
  const filteredTransactions = transactions.filter((t) => {
    if (periodMode === 'today') {
      return t.date === todayStr
    }
    if (periodMode === 'monthly') {
      return t.date?.startsWith(monthPrefix)
    }
    if (periodMode === 'weekly' && activeWeek) {
      return t.date >= activeWeek.startDate && t.date <= activeWeek.endDate
    }
    return true
  })

  // Transaction CRUD handlers
  const handleAddTransaction = (tx: Omit<Transaction, 'id'>) => {
    const saved = Storage.addTransaction(tx)
    setTransactions((prev) => [saved, ...prev])
  }

  const handleUpdateTransaction = (id: string, updatedTx: Partial<Transaction>) => {
    const updated = Storage.updateTransaction(id, updatedTx)
    setTransactions(updated)
  }

  const handleDeleteTransaction = (id: string) => {
    Storage.deleteTransaction(id)
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    showToast('Transaksi berhasil dihapus', 'info')
  }

  const handleClearAllTransactions = () => {
    Storage.clearAllTransactions()
    setTransactions([])
    setBudgets(Storage.getBudgets())
  }

  // Budget CRUD handlers
  const handleAddBudget = (b: Omit<BudgetCategory, 'id' | 'spent'>) => {
    Storage.addBudget(b)
    setBudgets(Storage.getBudgets())
  }

  const handleUpdateBudget = (id: string, b: Partial<BudgetCategory>) => {
    Storage.updateBudget(id, b)
    setBudgets(Storage.getBudgets())
  }

  const handleDeleteBudget = (id: string) => {
    Storage.deleteBudget(id)
    setBudgets(Storage.getBudgets())
  }

  // Savings Goal CRUD handlers
  const openAddGoalModal = () => {
    setEditingGoal(null)
    setGoalTitle('')
    setGoalTargetStr('')
    setGoalCurrentStr('')
    setGoalColor('sage')
    setShowGoalModal(true)
  }

  const openEditGoalModal = (g: SavingsGoal) => {
    setEditingGoal(g)
    setGoalTitle(g.title)
    setGoalTargetStr(formatDots(String(g.target)))
    setGoalCurrentStr(formatDots(String(g.current)))
    setGoalColor((g.color as any) || 'sage')
    setShowGoalModal(true)
  }

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault()
    const target = parseDots(goalTargetStr)
    const current = parseDots(goalCurrentStr)

    if (!goalTitle.trim()) {
      showToast('Masukkan judul target tabungan', 'error')
      return
    }
    if (!target || target <= 0) {
      showToast('Masukkan nominal target yang valid', 'error')
      return
    }

    if (editingGoal) {
      const updated = Storage.updateSavingsGoal(editingGoal.id, {
        title: goalTitle.trim(),
        target,
        current: current || 0,
        color: goalColor,
      })
      setSavingsGoals(updated)
      showToast(`Target "${goalTitle.trim()}" berhasil diperbarui!`, 'success')
    } else {
      const newGoal = Storage.addSavingsGoal({
        title: goalTitle.trim(),
        target,
        current: current || 0,
        color: goalColor,
      })
      setSavingsGoals(Storage.getSavingsGoals())
      showToast(`Target "${newGoal.title}" berhasil ditambahkan!`, 'success')
    }

    setShowGoalModal(false)
    setEditingGoal(null)
  }

  const handlePrevMonth = () => {
    if (selectedMonthIndex === 0) {
      setSelectedMonthIndex(11)
      setSelectedYear((y) => y - 1)
    } else {
      setSelectedMonthIndex((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonthIndex === 11) {
      setSelectedMonthIndex(0)
      setSelectedYear((y) => y + 1)
    } else {
      setSelectedMonthIndex((m) => m + 1)
    }
  }

  const handleResetToCurrentMonth = () => {
    const now = getCurrentYearAndMonth()
    setSelectedYear(now.year)
    setSelectedMonthIndex(now.monthIndex)
    showToast('Menampilkan bulan ini', 'info')
  }

  if (!mounted) {
    return (
      <DashboardLayout title="Keuangan" subtitle="Kelola cashflow & budgeting">
        <div className="flex items-center justify-center min-h-100">
          <div className="h-8 w-8 rounded-full border-2 border-navy border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  const getGoalIcon = (title: string) => {
    const t = title.toLowerCase()
    if (t.includes('darurat') || t.includes('aman') || t.includes('shield')) return faShieldHalved
    if (t.includes('invest') || t.includes('saham') || t.includes('rdn') || t.includes('crypto'))
      return faArrowTrendUp
    return faBullseye
  }

  return (
    <DashboardLayout title="Keuangan">
      <div className="space-y-6 pb-12">
        {/* Unified Navigation & Period Filter Bar */}
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
          badgeText={`${filteredTransactions.length} Transaksi`}
        />

        {/* Main Finance Widget (Cashflow + Budgets + Logger) */}
        <FinanceWidget
          transactions={filteredTransactions}
          budgets={budgets}
          onAddTransaction={handleAddTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onClearAllTransactions={handleClearAllTransactions}
          onAddBudget={handleAddBudget}
          onUpdateBudget={handleUpdateBudget}
          onDeleteBudget={handleDeleteBudget}
        />

        {/* Dynamic Savings Goals Section */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-navy/5 text-navy flex items-center justify-center">
                <FontAwesomeIcon icon={faPiggyBank} className="h-4 w-4 text-navy" />
              </div>
              <div>
                <h3 className="text-h4 font-heading font-bold text-navy">
                  Target Tabungan & Dana Darurat
                </h3>
                <p className="text-caption text-slate">
                  Alokasi aset untuk stabilitas finansial dan investasi jangka panjang
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={openAddGoalModal}
              className="gap-1.5 shadow-2xs"
            >
              <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
              <span>Tambah Target</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savingsGoals.length === 0 ? (
              <div className="col-span-full p-8 text-center text-caption text-slate border border-dashed border-border rounded-xl bg-slate-50/50">
                <p className="font-semibold text-navy">Belum ada target tabungan</p>
                <p className="text-[11px] text-slate mt-0.5">
                  Klik + Tambah Target untuk mulai membuat alokasi tabungan & dana darurat kamu
                </p>
              </div>
            ) : (
              savingsGoals.map((g) => {
                const pct =
                  g.target > 0 ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0
                const remaining = Math.max(0, g.target - g.current)

                return (
                  <Card key={g.id} className="relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-navy shrink-0">
                          <FontAwesomeIcon icon={getGoalIcon(g.title)} className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-body-sm font-heading font-bold text-navy truncate">
                          {g.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge
                          variant={pct >= 80 ? 'success' : 'default'}
                          className="text-[10px]"
                        >
                          {pct}%
                        </Badge>
                        <button
                          type="button"
                          onClick={() => openEditGoalModal(g)}
                          className="h-6 w-6 rounded text-slate-400 hover:text-navy hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                          title="Ubah target tabungan"
                          aria-label="Edit target tabungan"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="text-[11px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmGoal(g)}
                          className="h-6 w-6 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                          title="Hapus target tabungan ini"
                          aria-label="Hapus target tabungan"
                        >
                          <FontAwesomeIcon icon={faTrashCan} className="text-[11px]" />
                        </button>
                      </div>
                    </div>

                    <p className="text-h3 font-heading font-bold text-navy tabular-nums mb-1">
                      {formatRupiah(g.current)}
                    </p>
                    <span className="text-caption text-slate block mb-3 font-mono">
                      Target: {formatRupiah(g.target)}
                    </span>

                    <ProgressBar
                      value={g.current}
                      max={g.target}
                      color={(g.color as 'sage' | 'navy' | 'info' | 'warning' | 'error') || 'sage'}
                      size="md"
                      showLabel={false}
                    />

                    <div className="flex items-center justify-between text-[11px] text-slate mt-2 font-mono">
                      <span>Sisa: {formatRupiah(remaining)}</span>
                      <span className="text-sage font-medium">
                        {pct >= 100 ? 'Tercapai 🎉' : 'On track'}
                      </span>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </div>

        {/* Add / Edit Savings Goal Modal */}
        {showGoalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-navy/60 backdrop-blur-sm"
              onClick={() => setShowGoalModal(false)}
            />
            <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border shadow-2xl p-6 z-10 animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-h4 font-heading font-bold text-navy">
                  {editingGoal ? 'Ubah Target Tabungan' : 'Tambah Target Tabungan'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="h-8 w-8 rounded-lg text-slate hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  aria-label="Tutup"
                >
                  <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveGoal} className="space-y-4">
                <div>
                  <label className="text-caption font-medium text-navy block mb-1.5">
                    Judul Target / Rencana Tabungan
                  </label>
                  <input
                    type="text"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="Contoh: Dana Darurat, Investasi Saham, Sepatu Gym"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                    required
                  />
                </div>

                <div>
                  <label className="text-caption font-medium text-navy block mb-1.5">
                    Target Total yang Dibutuhkan (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-sm font-mono text-slate">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={goalTargetStr}
                      onChange={(e) => setGoalTargetStr(formatDots(e.target.value))}
                      placeholder="10.000.000"
                      className="w-full h-10 pl-10 pr-3 rounded-xl border border-border bg-surface text-body-sm font-mono font-bold text-navy focus:outline-none focus:border-navy"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-caption font-medium text-navy block mb-1.5">
                    Jumlah Terkumpul Saat Ini (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-sm font-mono text-slate">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={goalCurrentStr}
                      onChange={(e) => setGoalCurrentStr(formatDots(e.target.value))}
                      placeholder="2.500.000"
                      className="w-full h-10 pl-10 pr-3 rounded-xl border border-border bg-surface text-body-sm font-mono font-bold text-navy focus:outline-none focus:border-navy"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-caption font-medium text-navy block mb-1.5">
                    Tema Warna Progress Bar
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'sage', label: 'Sage (Hijau)' },
                      { id: 'navy', label: 'Navy (Biru)' },
                      { id: 'info', label: 'Cyan (Langit)' },
                      { id: 'warning', label: 'Amber (Emas)' },
                    ].map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setGoalColor(col.id as any)}
                        className={`h-9 rounded-xl border text-caption font-semibold transition-all cursor-pointer ${
                          goalColor === col.id
                            ? 'border-navy bg-navy text-white shadow-2xs font-bold'
                            : 'border-border bg-slate-50 text-slate hover:bg-slate-100'
                        }`}
                      >
                        {col.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => setShowGoalModal(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" variant="primary" size="md">
                    {editingGoal ? 'Simpan Perubahan' : 'Buat Target'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Savings Goal ConfirmModal */}
        <ConfirmModal
          isOpen={!!deleteConfirmGoal}
          onClose={() => setDeleteConfirmGoal(null)}
          onConfirm={() => {
            if (deleteConfirmGoal) {
              Storage.deleteSavingsGoal(deleteConfirmGoal.id)
              setSavingsGoals((prev) => prev.filter((g) => g.id !== deleteConfirmGoal.id))
              showToast(`Target "${deleteConfirmGoal.title}" berhasil dihapus`, 'info')
            }
          }}
          title="Hapus Target Tabungan"
          message={`Yakin ingin menghapus target tabungan "${deleteConfirmGoal?.title}"? Data target ini akan dihapus permanen.`}
          confirmText="Ya, Hapus"
          variant="danger"
        />
      </div>
    </DashboardLayout>
  )
}
