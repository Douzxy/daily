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
} from '@fortawesome/free-solid-svg-icons'
import { Card, Badge, Button, ProgressBar } from '@/components/ui'
import type { Transaction, BudgetCategory, TransactionType } from '@/types'

interface FinanceWidgetProps {
  transactions: Transaction[]
  budgets: BudgetCategory[]
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void
  onDeleteTransaction?: (id: string) => void
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

const CATEGORY_OPTIONS = [
  'Makanan & Kopi',
  'Gym & Suplemen',
  'Belanja Bulanan',
  'Transport & Bensin',
  'Gaji Pokok',
  'Freelance & Side Project',
  'Langganan & Hiburan',
  'Lainnya',
]

export default function FinanceWidget({
  transactions,
  budgets,
  onAddTransaction,
}: FinanceWidgetProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [type, setType] = useState<TransactionType>('expense')
  const [amountStr, setAmountStr] = useState('')
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0])
  const [description, setDescription] = useState('')

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const netBalance = totalIncome - totalExpense

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numericAmount = parseFloat(amountStr.replace(/[^0-9]/g, ''))
    if (!numericAmount || isNaN(numericAmount)) return

    onAddTransaction({
      type,
      amount: numericAmount,
      category,
      description: description.trim() || category,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cashless',
    })

    setAmountStr('')
    setDescription('')
    setShowAddModal(false)
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
                Cashflow Sehat
              </Badge>
            </div>
            <p className="text-caption text-slate mt-0.5 truncate sm:whitespace-normal">
              Alokasi batas budget dan monitoring arus kas harian
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="gap-1.5 self-start sm:self-auto shrink-0 shadow-xs"
        >
          <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
          <span>Tambah</span>
        </Button>
      </div>

      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* Total Saldo */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs">
          <span className="text-caption font-medium uppercase tracking-wider text-slate">
            Total Saldo Bersih
          </span>
          <p className="text-h3 font-heading font-bold text-navy mt-1 tabular-nums">
            {formatRupiah(netBalance)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-caption text-sage font-medium">
            <FontAwesomeIcon icon={faArrowTrendUp} className="h-3 w-3" />
            <span>Rasio tabungan 78%</span>
          </div>
        </div>

        {/* Pemasukan */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium uppercase tracking-wider text-slate">
              Pemasukan Bulan Ini
            </span>
            <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3" />
            </div>
          </div>
          <p className="text-h3 font-heading font-bold text-sage mt-1 tabular-nums">
            +{formatRupiah(totalIncome)}
          </p>
          <span className="text-[11px] text-slate mt-2 block">
            Gaji dan kontrak aktif tercatat
          </span>
        </div>

        {/* Pengeluaran */}
        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium uppercase tracking-wider text-slate">
              Pengeluaran Bulan Ini
            </span>
            <div className="h-5 w-5 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3" />
            </div>
          </div>
          <p className="text-h3 font-heading font-bold text-navy mt-1 tabular-nums">
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
            <h4 className="text-body-sm font-heading font-bold text-navy">
              Alokasi Budget Bulanan
            </h4>
            <span className="text-caption text-slate">Batas Maksimum</span>
          </div>

          <div className="space-y-3">
            {budgets.map((b) => {
              const pct = Math.min(Math.round((b.spent / b.limit) * 100), 100)
              const remaining = Math.max(0, b.limit - b.spent)
              return (
                <div
                  key={b.id}
                  className="p-3 rounded-lg border border-border/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between text-body-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate p-1.5 rounded bg-white border border-border flex items-center justify-center w-6 h-6">
                        <FontAwesomeIcon icon={getCategoryIcon(b.name)} className="text-[11px]" />
                      </span>
                      <span className="font-medium text-navy">{b.name}</span>
                    </div>
                    <span className="font-mono text-caption text-slate">
                      {formatRupiah(b.spent)} / {formatRupiah(b.limit)}
                    </span>
                  </div>
                  <ProgressBar
                    value={b.spent}
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
            })}
          </div>
        </div>

        {/* Right: Recent Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-body-sm font-heading font-bold text-navy">
              Transaksi Terkini
            </h4>
            <span className="text-caption text-slate">Aktivitas Terakhir</span>
          </div>

          <div className="space-y-2.5 max-h-70 overflow-y-auto pr-1">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-surface hover:border-slate/30 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
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
                    <span className="text-caption text-slate block truncate">
                      {tx.category} • {tx.paymentMethod ?? 'BCA'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <p
                    className={`text-body-sm font-mono font-bold ${
                      tx.type === 'income' ? 'text-sage' : 'text-navy'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatRupiah(tx.amount)}
                  </p>
                  <span className="text-[10px] text-slate-light block">
                    {tx.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border shadow-2xl p-6 z-10 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faReceipt} className="h-4 w-4 text-navy" />
                <h3 className="text-h4 font-heading font-bold text-navy">
                  Catat Transaksi Baru
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
                <input
                  type="number"
                  required
                  placeholder="Contoh: 75000"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface font-mono text-body text-navy focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
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
                  placeholder="Contoh: Menu makan siang dada ayam fillet"
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
                  Simpan Transaksi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  )
}
