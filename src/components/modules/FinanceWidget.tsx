'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faWallet,
  faArrowUp,
  faArrowDown,
  faArrowTrendUp,
  faPlus,
  faXmark,
  faUtensils,
  faDumbbell,
  faCartShopping,
  faCar,
  faReceipt,
  faTrashCan,
  faPenToSquare,
  faRotateLeft,
  faCreditCard,
  faCalendarDays,
} from '@fortawesome/free-solid-svg-icons'
import { Card, Badge, Button, ProgressBar, showToast, ConfirmModal } from '@/components/ui'
import type { Transaction, BudgetCategory, TransactionType } from '@/types'
import { formatDots, parseDots, formatRupiah as formatRupiahUtil } from '@/lib/format'

interface FinanceWidgetProps {
  transactions: Transaction[]
  budgets: BudgetCategory[]
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void
  onUpdateTransaction?: (id: string, tx: Partial<Transaction>) => void
  onDeleteTransaction?: (id: string) => void
  onClearAllTransactions?: () => void
  onAddBudget?: (budget: Omit<BudgetCategory, 'id' | 'spent'>) => void
  onUpdateBudget?: (id: string, budget: Partial<BudgetCategory>) => void
  onDeleteBudget?: (id: string) => void
}

export function formatRupiah(amount: number | string): string {
  return formatRupiahUtil(amount)
}

export const CATEGORY_OPTIONS = [
  'Makanan & Kopi',
  'Gym & Suplemen',
  'Belanja Bulanan',
  'Transport & Bensin',
  'Gaji Pokok',
  'Freelance & Side Project',
  'Langganan & Hiburan',
  'Lainnya',
]

export const PAYMENT_METHODS = [
  'BCA',
  'Mandiri',
  'BRI',
  'BNI',
  'BSI',
  'Bank Jago',
  'SeaBank',
  'QRIS',
  'Tunai / Cash',
  'GoPay',
  'OVO',
  'DANA',
  'ShopeePay',
  'Kartu Debit/Kredit',
  'Lainnya',
]

const getTodayDateStr = () => {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

export default function FinanceWidget({
  transactions,
  budgets,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onClearAllTransactions,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget,
}: FinanceWidgetProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [deleteConfirmTx, setDeleteConfirmTx] = useState<Transaction | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Budget modal states
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetCategory | null>(null)
  const [deleteConfirmBudget, setDeleteConfirmBudget] = useState<BudgetCategory | null>(null)
  const [budgetName, setBudgetName] = useState('')
  const [budgetLimitStr, setBudgetLimitStr] = useState('')

  // Form states
  const [type, setType] = useState<TransactionType>('expense')
  const [amountStr, setAmountStr] = useState('')
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0])
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [date, setDate] = useState(getTodayDateStr())
  const [description, setDescription] = useState('')

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const netBalance = totalIncome - totalExpense

  const openAddModal = () => {
    setEditingTx(null)
    setType('expense')
    setAmountStr('')
    setCategory(CATEGORY_OPTIONS[0])
    setPaymentMethod(PAYMENT_METHODS[0])
    setDate(getTodayDateStr())
    setDescription('')
    setShowAddModal(true)
  }

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx)
    setType(tx.type)
    setAmountStr(formatDots(String(tx.amount)))
    setCategory(tx.category || CATEGORY_OPTIONS[0])
    setPaymentMethod(tx.paymentMethod || PAYMENT_METHODS[0])
    setDate(tx.date || getTodayDateStr())
    setDescription(tx.description || '')
    setShowAddModal(true)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numericAmount = parseDots(amountStr)
    if (!numericAmount || numericAmount <= 0) {
      showToast('Masukkan nominal transaksi yang valid', 'error')
      return
    }

    if (editingTx && onUpdateTransaction) {
      onUpdateTransaction(editingTx.id, {
        type,
        amount: numericAmount,
        category,
        description: description.trim() || category,
        date: date || getTodayDateStr(),
        paymentMethod,
      })
      showToast(`Transaksi berhasil diperbarui!`, 'success')
    } else {
      onAddTransaction({
        type,
        amount: numericAmount,
        category,
        description: description.trim() || category,
        date: date || getTodayDateStr(),
        paymentMethod,
      })
      showToast(`Transaksi ${formatRupiah(numericAmount)} berhasil disimpan!`, 'success')
    }

    setShowAddModal(false)
    setEditingTx(null)
  }

  const handleClearAll = () => {
    setShowClearConfirm(true)
  }

  const openAddBudgetModal = () => {
    setEditingBudget(null)
    setBudgetName('')
    setBudgetLimitStr('')
    setShowBudgetModal(true)
  }

  const openEditBudgetModal = (b: BudgetCategory) => {
    setEditingBudget(b)
    setBudgetName(b.name)
    setBudgetLimitStr(formatDots(String(b.limit)))
    setShowBudgetModal(true)
  }

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numericLimit = parseDots(budgetLimitStr)
    if (!numericLimit || numericLimit <= 0) {
      showToast('Masukkan nominal batas budget yang valid', 'error')
      return
    }
    if (!budgetName.trim()) {
      showToast('Masukkan nama kategori budget', 'error')
      return
    }

    if (editingBudget && onUpdateBudget) {
      onUpdateBudget(editingBudget.id, {
        name: budgetName.trim(),
        limit: numericLimit,
      })
      showToast(`Budget "${budgetName.trim()}" berhasil diperbarui!`, 'success')
    } else if (onAddBudget) {
      onAddBudget({
        name: budgetName.trim(),
        limit: numericLimit,
        icon: 'Coffee',
        color: 'sage',
      })
      showToast(`Budget "${budgetName.trim()}" berhasil ditambahkan!`, 'success')
    }

    setShowBudgetModal(false)
    setEditingBudget(null)
  }

  const getCategoryIcon = (name: string) => {
    if (name.includes('Makan') || name.includes('Kopi')) return faUtensils
    if (name.includes('Gym') || name.includes('Suplemen')) return faDumbbell
    if (name.includes('Belanja')) return faCartShopping
    if (name.includes('Transport')) return faCar
    return faReceipt
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-sage/10 text-sage">
            <FontAwesomeIcon icon={faWallet} className="h-4 w-4 sm:h-5 sm:w-5 text-sage" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-body-lg sm:text-h4 font-heading font-bold text-navy truncate">
                Ringkasan Keuangan
              </h3>
              <Badge variant="success" className="text-[10px] py-0.5 px-2 shrink-0">
                Cashflow Real-Time
              </Badge>
            </div>
            <p className="text-caption text-slate mt-0.5 truncate sm:whitespace-normal">
              Kelola pencatatan pengeluaran, pemasukan, bank & metode pembayaran
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          {onClearAllTransactions && transactions.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="h-8.5 px-2.5 rounded-lg border border-border text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Kosongkan semua riwayat transaksi untuk mulai baru"
            >
              <FontAwesomeIcon icon={faRotateLeft} className="text-xs" />
              <span>Kosongkan Data</span>
            </button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={openAddModal}
            className="gap-1.5 shadow-xs"
          >
            <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
            <span>Tambah</span>
          </Button>
        </div>
      </div>

      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* Total Saldo */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs">
          <span className="text-caption font-medium uppercase tracking-wider text-slate">
            Total Saldo Bersih
          </span>
          <p className="text-h3 font-mono font-bold text-navy mt-1 tabular-nums">
            {formatRupiah(netBalance)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-caption text-emerald-700 font-semibold">
            <FontAwesomeIcon icon={faArrowTrendUp} className="h-3 w-3" />
            <span>{netBalance >= 0 ? 'Cashflow Positif' : 'Pengeluaran Melampaui'}</span>
          </div>
        </div>

        {/* Pemasukan */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-caption font-bold uppercase tracking-wider text-slate">
              Pemasukan Bulan Ini
            </span>
            <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3" />
            </div>
          </div>
          <p className="text-h3 font-mono font-bold text-emerald-700 mt-1 tabular-nums">
            +{formatRupiah(totalIncome)}
          </p>
          <span className="text-[11px] text-slate-600 font-medium mt-2 block">
            Gaji & transfer tercatat
          </span>
        </div>

        {/* Pengeluaran */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-caption font-bold uppercase tracking-wider text-slate">
              Pengeluaran Bulan Ini
            </span>
            <div className="h-5 w-5 rounded-full bg-red-100 text-red-800 flex items-center justify-center">
              <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3" />
            </div>
          </div>
          <p className="text-h3 font-mono font-bold text-red-700 mt-1 tabular-nums">
            -{formatRupiah(totalExpense)}
          </p>
          <span className="text-[11px] text-slate mt-2 block">
            Terkendali dalam batas alokasi
          </span>
        </div>
      </div>

      {/* 2-Columns: Budget Tracking & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2 border-t border-border">
        {/* Left: Category Budgets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-body-sm font-heading font-bold text-navy">
                Alokasi Budget Bulanan
              </h4>
              <span className="text-caption text-slate">Batas Maksimum</span>
            </div>
            {onAddBudget && (
              <button
                type="button"
                onClick={openAddBudgetModal}
                className="h-7 px-2.5 rounded-lg border border-border bg-white hover:bg-slate-100 text-navy text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Tambah kategori budget baru"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs text-navy" />
                <span>Tambah Budget</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {budgets.length === 0 ? (
              <div className="p-5 text-center text-caption text-slate border border-dashed border-border rounded-xl bg-slate-50/50">
                <p className="font-semibold text-navy">Belum ada alokasi budget</p>
                <p className="text-[11px] text-slate mt-0.5">Klik + Tambah Budget untuk menentukan batas pengeluaran kategori kamu</p>
              </div>
            ) : (
              budgets.map((b) => {
                // Dynamic spent calculation from filtered transactions
                const computedSpent = transactions
                  .filter(
                    (t) =>
                      t.type === 'expense' &&
                      (t.category?.toLowerCase().includes(b.name.toLowerCase()) ||
                        b.name.toLowerCase().includes(t.category?.toLowerCase() || ''))
                  )
                  .reduce((sum, t) => sum + t.amount, 0)
                const actualSpent = computedSpent > 0 ? computedSpent : b.spent
                const pct = b.limit > 0 ? Math.min(Math.round((actualSpent / b.limit) * 100), 100) : 0
                const remaining = Math.max(0, b.limit - actualSpent)

                return (
                  <div
                    key={b.id}
                    className="p-3 rounded-lg border border-border/80 bg-slate-50/50 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between text-body-sm mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-slate p-1.5 rounded bg-white border border-border flex items-center justify-center w-6 h-6 shrink-0">
                          <FontAwesomeIcon icon={getCategoryIcon(b.name)} className="text-[11px]" />
                        </span>
                        <span className="font-medium text-navy truncate">{b.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-caption text-slate">
                          {formatRupiah(actualSpent)} / {formatRupiah(b.limit)}
                        </span>
                        <div className="flex items-center gap-1">
                          {onUpdateBudget && (
                            <button
                              type="button"
                              onClick={() => openEditBudgetModal(b)}
                              className="h-6 w-6 rounded text-slate-400 hover:text-navy hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
                              title="Ubah nominal batas budget"
                              aria-label="Edit budget"
                            >
                              <FontAwesomeIcon icon={faPenToSquare} className="text-[11px]" />
                            </button>
                          )}
                          {onDeleteBudget && (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmBudget(b)}
                              className="h-6 w-6 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                              title="Hapus kategori budget ini"
                              aria-label="Hapus budget"
                            >
                              <FontAwesomeIcon icon={faTrashCan} className="text-[11px]" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <ProgressBar
                      value={actualSpent}
                      max={b.limit}
                      color={pct > 90 ? 'error' : pct > 75 ? 'warning' : 'sage'}
                      size="sm"
                      showLabel={false}
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate mt-1.5 font-mono">
                      <span>Terpakai {pct}%</span>
                      <span className="text-navy font-medium">Sisa: {formatRupiah(remaining)}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right: Recent Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-body-sm font-heading font-bold text-navy">
              Daftar Transaksi ({transactions.length})
            </h4>
            <span className="text-caption text-slate">Riwayat Keuangan</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {transactions.length === 0 ? (
              <div className="p-6 text-center text-caption text-slate border border-dashed border-border rounded-xl bg-slate-50/40">
                <FontAwesomeIcon icon={faReceipt} className="text-slate-300 text-2xl mb-2 block mx-auto" />
                <p className="font-medium text-navy">Belum ada transaksi</p>
                <p className="text-[11px] text-slate mt-0.5">Mulai catat transaksi pertama kamu dengan tombol + Tambah</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="group flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-surface hover:border-slate/30 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`h-8.5 w-8.5 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={tx.type === 'income' ? faArrowDown : faArrowUp}
                        className="text-xs"
                      />
                    </div>
                    <div className="truncate">
                      <p className="text-body-sm font-medium text-navy truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-caption text-slate flex-wrap">
                        <span className="truncate">{tx.category}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] font-semibold text-navy">
                          {tx.paymentMethod || 'QRIS'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <div className="text-right">
                      <p
                        className={`text-body-sm font-mono font-bold ${
                          tx.type === 'income' ? 'text-sage' : 'text-navy'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatRupiah(tx.amount)}
                      </p>
                      <span className="text-[10px] text-slate font-mono block">
                        {tx.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditModal(tx)
                        }}
                        className="h-7 w-7 rounded-lg text-slate-400 hover:text-navy hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                        title="Edit transaksi ini (nominal, tanggal, bank, dll)"
                        aria-label="Edit transaksi"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3" />
                      </button>

                      {/* Delete Button */}
                      {onDeleteTransaction && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteConfirmTx(tx)
                          }}
                          className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                          title="Hapus transaksi ini"
                          aria-label="Hapus transaksi"
                        >
                          <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border shadow-2xl p-6 z-10 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={editingTx ? faPenToSquare : faReceipt} className="h-4 w-4 text-navy" />
                <h3 className="text-h4 font-heading font-bold text-navy">
                  {editingTx ? 'Ubah Transaksi' : 'Catat Transaksi Baru'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="h-8 w-8 rounded-lg text-slate hover:bg-slate-100 flex items-center justify-center"
                aria-label="Tutup"
              >
                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 text-body-sm font-medium rounded-md transition-all ${
                    type === 'expense'
                      ? 'bg-surface text-navy shadow-xs font-semibold'
                      : 'text-slate hover:text-navy'
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 text-body-sm font-medium rounded-md transition-all ${
                    type === 'income'
                      ? 'bg-sage text-white shadow-xs font-semibold'
                      : 'text-slate hover:text-navy'
                  }`}
                >
                  Pemasukan
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Nominal (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate text-body-sm">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="Contoh: 75.000 atau 100.000"
                    value={amountStr}
                    onChange={(e) => setAmountStr(formatDots(e.target.value))}
                    className="w-full h-11 pl-11 pr-3.5 rounded-lg border border-border bg-surface font-mono font-bold text-body text-navy focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
                  />
                </div>
              </div>

              {/* Metode Pembayaran / Bank / Sumber Dana */}
              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Metode Pembayaran / Nama Bank / QRIS
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal Transaksi (Memungkinkan Ubah Tanggal Lewat) */}
              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Tanggal Transaksi (Bisa Pilih Tanggal Yang Sudah Lewat)
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface font-mono text-body-sm text-navy focus:outline-none focus:border-navy"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Deskripsi / Keterangan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Makan siang ayam dada fillet / isi Pertalite"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                />
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
                  {editingTx ? 'Simpan Perubahan' : 'Simpan Transaksi'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Single Transaction Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmTx}
        onClose={() => setDeleteConfirmTx(null)}
        onConfirm={() => {
          if (deleteConfirmTx && onDeleteTransaction) {
            onDeleteTransaction(deleteConfirmTx.id)
            showToast(`Transaksi "${deleteConfirmTx.description}" berhasil dihapus`, 'info')
          }
        }}
        title="Hapus Transaksi"
        message={`Yakin ingin menghapus transaksi "${deleteConfirmTx?.description}" sebesar ${deleteConfirmTx ? formatRupiah(deleteConfirmTx.amount) : ''}? Data transaksi ini akan dihapus permanen.`}
        confirmText="Ya, Hapus"
        variant="danger"
      />

      {/* Confirm Clear All Transactions Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          if (onClearAllTransactions) {
            onClearAllTransactions()
          }
          showToast('Semua transaksi berhasil dikosongkan. Mulai bersih hari ini!', 'info')
        }}
        title="Kosongkan Semua Transaksi"
        message="Yakin ingin mengosongkan SEMUA data transaksi keuangan dan mereset dari nol untuk hari ini? Seluruh saldo dan riwayat transaksi akan dihapus bersih."
        confirmText="Ya, Kosongkan Semua"
        variant="danger"
      />

      {/* Add / Edit Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm"
            onClick={() => setShowBudgetModal(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-surface border border-border shadow-2xl p-6 z-10 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-h4 font-heading font-bold text-navy">
                {editingBudget ? 'Ubah Budget Kategori' : 'Tambah Budget Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowBudgetModal(false)}
                className="h-8 w-8 rounded-lg text-slate hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                aria-label="Tutup"
              >
                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              <div>
                <label className="text-caption font-medium text-navy block mb-1.5">
                  Nama Kategori Budget
                </label>
                <input
                  type="text"
                  list="budgetSuggestions"
                  value={budgetName}
                  onChange={(e) => setBudgetName(e.target.value)}
                  placeholder="Contoh: Makanan & Nutrisi, Transport"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                  required
                />
                <datalist id="budgetSuggestions">
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-caption font-medium text-navy block mb-1.5">
                  Batas Maksimal Bulanan (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-sm font-mono text-slate">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={budgetLimitStr}
                    onChange={(e) => setBudgetLimitStr(formatDots(e.target.value))}
                    placeholder="1.000.000"
                    className="w-full h-10 pl-10 pr-3 rounded-xl border border-border bg-surface text-body-sm font-mono font-bold text-navy focus:outline-none focus:border-navy"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setShowBudgetModal(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="md">
                  {editingBudget ? 'Simpan Perubahan' : 'Tambah Budget'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Budget Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmBudget}
        onClose={() => setDeleteConfirmBudget(null)}
        onConfirm={() => {
          if (deleteConfirmBudget && onDeleteBudget) {
            onDeleteBudget(deleteConfirmBudget.id)
            showToast(`Budget "${deleteConfirmBudget.name}" berhasil dihapus`, 'info')
          }
        }}
        title="Hapus Budget Kategori"
        message={`Yakin ingin menghapus batas alokasi budget "${deleteConfirmBudget?.name}"? Transaksi pengeluaran tetap aman dan tidak akan hilang.`}
        confirmText="Ya, Hapus"
        variant="danger"
      />
    </Card>
  )
}
