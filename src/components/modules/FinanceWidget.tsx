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
  faFilm,
  faGasPump,
  faMugHot,
  faBolt,
  faLightbulb,
  faCircleExclamation,
  faCircleCheck,
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

export function isBudgetMatch(b: BudgetCategory, t: Transaction): boolean {
  if (t.type !== 'expense') return false
  const cat = (t.category || '').trim().toLowerCase()
  const desc = (t.description || '').trim().toLowerCase()
  const bName = b.name.trim().toLowerCase()

  // 1. Exact match
  if (cat === bName) return true

  // 2. Substring match
  if (cat.includes(bName) || bName.includes(cat)) return true

  // 3. Keyword / Alias rules
  // Transport & Kendaraan
  if (/transport|kendaraan|bensin|bbm|pertamax|pertalite|solar|motor|mobil/i.test(bName)) {
    if (
      /transport|kendaraan|bensin|bbm|pertamax|pertalite|solar|xabre|motor|mobil|parkir|tol|ojol|grab|gojek/i.test(cat) ||
      /pertamax|pertalite|bensin|bbm|solar|xabre|isi bensin|parkir|tol|tambal ban/i.test(desc)
    ) {
      return true
    }
  }

  // Makanan & Nutrisi / Kuliner / Kopi
  if (/makan|kuliner|nutrisi|kopi|food/i.test(bName)) {
    if (
      /makan|kuliner|nutrisi|kopi|cafe|warteg|resto|geprek|snack|jajan/i.test(cat) ||
      /makan|geprek|ayam|bakso|mie|nasi|kebab|roti|warteg|padang|soto|pecel|siang|malam|sarapan|jajan/i.test(desc)
    ) {
      return true
    }
  }

  // Belanja Pokok & Protein / Belanja Bulanan
  if (/belanja|pokok|protein|bulanan/i.test(bName)) {
    if (
      /belanja|pokok|protein|bulanan|sembako|pasar|supermarket/i.test(cat) ||
      /uht|susu|telur|galon|aqua|beras|minyak|indomaret|alfamart|belanja/i.test(desc)
    ) {
      return true
    }
  }

  // Gym, Suplemen & Nutrisi
  if (/gym|suplemen|fitness/i.test(bName)) {
    if (
      /gym|suplemen|fitness|workout/i.test(cat) ||
      /gym|fitness|whey|creatine|suplemen|bcaa|member gym/i.test(desc)
    ) {
      return true
    }
  }

  // Hiburan & Refreshing
  if (/hiburan|refreshing|langganan|santai/i.test(bName)) {
    if (
      /hiburan|refreshing|langganan|santai|game|nonton/i.test(cat) ||
      /bioskop|cinema|film|netflix|spotify|game|steam|nongkrong|ngopi/i.test(desc)
    ) {
      return true
    }
  }

  // Upgrade Diri & Kreatif
  if (/upgrade|kreatif|skill|belajar/i.test(bName)) {
    if (
      /upgrade|kreatif|skill|belajar|buku|kursus/i.test(cat) ||
      /buku|kursus|course|preset|tools edit|asset visual|udemy|belajar/i.test(desc)
    ) {
      return true
    }
  }

  return false
}

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Makanan & Nutrisi',
  'Transport & Kendaraan',
  'Belanja Pokok & Protein',
  'Gym, Suplemen & Nutrisi',
  'Hiburan & Refreshing',
  'Upgrade Diri & Kreatif',
  'Lainnya',
]

export const INCOME_CATEGORIES = [
  'Gaji Pokok',
  'Freelance & Side Project',
  'Investasi / Passive Income',
  'Bonus & Hadiah',
  'Pemasukan Lainnya',
]

export const CATEGORY_OPTIONS = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES,
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

  // Dynamically compute category options based on type and current budgets
  const activeExpenseCategories = Array.from(
    new Set([
      ...budgets.map((b) => b.name),
      ...DEFAULT_EXPENSE_CATEGORIES,
    ])
  )

  // Form states
  const [type, setType] = useState<TransactionType>('expense')
  const [amountStr, setAmountStr] = useState('')
  const [category, setCategory] = useState(activeExpenseCategories[0] || 'Makanan & Nutrisi')
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [date, setDate] = useState(getTodayDateStr())
  const [description, setDescription] = useState('')

  const categoryOptions = type === 'expense' ? activeExpenseCategories : INCOME_CATEGORIES

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0)

  // Smart Advisory Computations for Hiburan & Upgrade Diri
  const hiburanBudget = budgets.find((b) => /hiburan|refreshing|langganan/i.test(b.name))
  const hiburanSpent = transactions
    .filter((t) => hiburanBudget ? isBudgetMatch(hiburanBudget, t) : (t.type === 'expense' && /hiburan|refreshing|langganan/i.test(t.category || '')))
    .reduce((sum, t) => sum + t.amount, 0)
  const hiburanLimit = hiburanBudget ? hiburanBudget.limit : 0
  const hiburanSisa = Math.max(0, hiburanLimit - hiburanSpent)

  const upgradeBudget = budgets.find((b) => /upgrade|kreatif|skill|belajar/i.test(b.name))
  const upgradeSpent = transactions
    .filter((t) => upgradeBudget ? isBudgetMatch(upgradeBudget, t) : (t.type === 'expense' && /upgrade|kreatif|skill|belajar/i.test(t.category || '')))
    .reduce((sum, t) => sum + t.amount, 0)
  const upgradeLimit = upgradeBudget ? upgradeBudget.limit : 0
  const upgradeSisa = Math.max(0, upgradeLimit - upgradeSpent)

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const netBalance = totalIncome - totalExpense

  const openAddModal = () => {
    setEditingTx(null)
    setType('expense')
    setAmountStr('')
    setCategory(activeExpenseCategories[0] || 'Makanan & Nutrisi')
    setPaymentMethod(PAYMENT_METHODS[0])
    setDate(getTodayDateStr())
    setDescription('')
    setShowAddModal(true)
  }

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx)
    setType(tx.type)
    setAmountStr(formatDots(String(tx.amount)))
    setCategory(tx.category || (tx.type === 'income' ? 'Gaji Pokok' : activeExpenseCategories[0]))
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
          <p
            className={`text-h3 font-mono font-bold mt-1 tabular-nums ${
              netBalance < 0 ? 'text-rose-600' : 'text-navy'
            }`}
          >
            {formatRupiah(netBalance)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-caption">
            {netBalance >= 0 ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <FontAwesomeIcon icon={faArrowTrendUp} className="h-3 w-3" />
                <span>Cashflow Positif</span>
              </span>
            ) : (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <FontAwesomeIcon icon={faCircleExclamation} className="h-3 w-3" />
                <span>Defisit / Belum ada pemasukan</span>
              </span>
            )}
          </div>
          {totalIncome === 0 && onAddTransaction && (
            <button
              type="button"
              onClick={() => {
                onAddTransaction({
                  type: 'income',
                  amount: 2800000,
                  category: 'Gaji Pokok',
                  date: getTodayDateStr(),
                  description: 'Gaji Bulanan Edo',
                  paymentMethod: 'BCA',
                })
                showToast('Pemasukan gaji Rp 2.800.000 berhasil dicatat!', 'success')
              }}
              className="mt-2.5 text-[11px] font-heading font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
              <span>+ Catat Gaji Masuk (Rp 2.800.000)</span>
            </button>
          )}
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

      {/* Smart Budget Advisory: Rekomendasi Hiburan & Upgrade Diri */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/20 to-slate-50 border border-border/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-navy text-white flex items-center justify-center shrink-0 shadow-2xs">
              <FontAwesomeIcon icon={faLightbulb} className="text-xs text-white" />
            </div>
            <div>
              <h4 className="text-body-sm font-heading font-bold text-navy">
                Rekomendasi Cek Budget: Hiburan & Upgrade Diri
              </h4>
              <p className="text-[11px] text-slate">
                Visibilitas real-time ketersediaan dana hiburan dan kuota belajar/kreatif bulan ini
              </p>
            </div>
          </div>

          {(!hiburanBudget || !upgradeBudget) && onAddBudget && (
            <button
              type="button"
              onClick={() => {
                if (!hiburanBudget) {
                  onAddBudget({
                    name: 'Hiburan & Refreshing',
                    limit: 200000,
                    icon: 'Film',
                    color: 'info',
                  })
                }
                if (!upgradeBudget) {
                  onAddBudget({
                    name: 'Upgrade Diri & Kreatif',
                    limit: 200000,
                    icon: 'Sparkles',
                    color: 'sage',
                  })
                }
                showToast('Kategori Hiburan & Upgrade Diri berhasil ditambahkan ke budget!', 'success')
              }}
              className="text-[11px] font-heading font-bold text-navy bg-white hover:bg-slate-100 border border-navy/30 px-3 py-1.5 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              + Aktifkan Budget Hiburan & Upgrade Diri
            </button>
          )}
        </div>

        {/* 2 Advisory Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 1. Hiburan & Refreshing */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            hiburanBudget
              ? hiburanSisa > 0
                ? 'bg-emerald-50/60 border-emerald-200'
                : 'bg-red-50/60 border-red-200'
              : 'bg-white border-border/80'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faFilm} className={hiburanBudget && hiburanSisa > 0 ? 'text-emerald-700 text-xs' : 'text-navy text-xs'} />
                <span className="text-caption font-heading font-bold text-navy">
                  Budget Hiburan & Santai
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                !hiburanBudget
                  ? 'bg-slate-100 text-slate-700'
                  : hiburanSisa > 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {!hiburanBudget ? 'Belum Diatur' : hiburanSisa > 0 ? `Sisa ${formatRupiah(hiburanSisa)}` : 'Habis / Over'}
              </span>
            </div>

            <p className="text-[12px] text-slate-700 leading-relaxed mb-2 font-body">
              {!hiburanBudget ? (
                'Batas budget hiburan belum dibuat. Klik tombol di atas untuk alokasi Rp 200.000 agar pengeluaran santai tidak bocor.'
              ) : hiburanSisa > 0 ? (
                <span><FontAwesomeIcon icon={faCircleCheck} className="text-emerald-600 text-xs mr-1" /><strong>Ada sisa budget hiburan!</strong> Tersisa <strong>{formatRupiah(hiburanSisa)}</strong> dari batas {formatRupiah(hiburanLimit)}. Kamu aman untuk nonton, ngopi, atau jajan santai minggu ini.</span>
              ) : (
                <span><FontAwesomeIcon icon={faCircleExclamation} className="text-rose-600 text-xs mr-1" /><strong>Budget hiburan habis!</strong> Sudah terpakai <strong>{formatRupiah(hiburanSpent)}</strong>. Disarankan menahan pengeluaran hiburan sampai bulan depan ya!</span>
              )}
            </p>

            {hiburanBudget && (
              <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${hiburanSisa > 0 ? 'bg-emerald-600' : 'bg-red-600'}`}
                  style={{ width: `${Math.min(100, Math.round((hiburanSpent / (hiburanLimit || 1)) * 100))}%` }}
                />
              </div>
            )}
          </div>

          {/* 2. Upgrade Diri & Kreatif */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            upgradeBudget
              ? upgradeSisa > 0
                ? 'bg-indigo-50/60 border-indigo-200'
                : 'bg-amber-50/60 border-amber-200'
              : 'bg-white border-border/80'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faLightbulb} className="text-indigo-700 text-xs" />
                <span className="text-caption font-heading font-bold text-navy">
                  Budget Upgrade Diri & Tools Edit
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                !upgradeBudget
                  ? 'bg-slate-100 text-slate-700'
                  : upgradeSisa > 0
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {!upgradeBudget ? 'Belum Diatur' : upgradeSisa > 0 ? `Sisa ${formatRupiah(upgradeSisa)}` : 'Terpakai Penuh'}
              </span>
            </div>

            <p className="text-[12px] text-slate-700 leading-relaxed mb-2 font-body">
              {!upgradeBudget ? (
                'Alokasikan budget untuk tools edit foto, preset visual, asset anime, atau buku skill baru.'
              ) : upgradeSisa > 0 ? (
                <span><FontAwesomeIcon icon={faLightbulb} className="text-indigo-600 text-xs mr-1" /><strong>Ada alokasi belanja kreatif!</strong> Tersisa <strong>{formatRupiah(upgradeSisa)}</strong> dari {formatRupiah(upgradeLimit)}. Bisa dipakai beli preset foto, tools edit, atau asset visual anime.</span>
              ) : (
                <span><FontAwesomeIcon icon={faCircleExclamation} className="text-amber-600 text-xs mr-1" /><strong>Alokasi upgrade skill bulan ini sudah penuh</strong> (terpakai {formatRupiah(upgradeSpent)}).</span>
              )}
            </p>

            {upgradeBudget && (
              <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((upgradeSpent / (upgradeLimit || 1)) * 100))}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Quick Expense Presets (Sekali Tap Masuk) */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-border/80">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-caption font-bold text-navy">
            <FontAwesomeIcon icon={faBolt} className="text-amber-500 text-xs" />
            <span>Catat Pengeluaran Cepat (1-Tap Langsung Masuk):</span>
          </div>
          <span className="text-[10px] text-slate font-mono">Bypass modal form</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {[
            { label: 'Bensin Pertamax', icon: faGasPump, amount: 50000, category: 'Transport & Kendaraan', desc: 'Pertamax Xabre' },
            { label: 'Bensin Pertalite', icon: faGasPump, amount: 20000, category: 'Transport & Kendaraan', desc: 'Isi Pertalite motor' },
            { label: 'Makan Ayam Geprek', icon: faUtensils, amount: 16000, category: 'Makanan & Nutrisi', desc: 'Makan ayam geprek' },
            { label: 'Susu UHT / Protein', icon: faDumbbell, amount: 23000, category: 'Belanja Pokok & Protein', desc: 'Susu UHT 1 Lt' },
            { label: 'Kebab / Jajan', icon: faUtensils, amount: 12000, category: 'Makanan & Nutrisi', desc: 'Kebab' },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (onAddTransaction) {
                  onAddTransaction({
                    type: 'expense',
                    amount: item.amount,
                    category: item.category,
                    date: getTodayDateStr(),
                    description: item.desc,
                    paymentMethod: 'BCA',
                  })
                  showToast(`+${item.label} (${formatRupiah(item.amount)}) berhasil dicatat!`, 'success')
                }
              }}
              className="p-2 rounded-lg bg-white border border-border hover:border-navy hover:bg-navy/5 text-left transition-all cursor-pointer shadow-2xs group"
            >
              <span className="text-caption font-bold text-navy flex items-center gap-1.5 truncate group-hover:text-navy">
                <FontAwesomeIcon icon={item.icon} className="text-[11px] text-slate-500 group-hover:text-navy" />
                <span>{item.label}</span>
              </span>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate mt-0.5">
                <span className="text-rose-600 font-bold">-{formatRupiah(item.amount)}</span>
                <span className="text-[9px] text-slate-400">BCA</span>
              </div>
            </button>
          ))}
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
                // Dynamic spent calculation from filtered transactions using alias & keyword matching
                const computedSpent = transactions
                  .filter((t) => isBudgetMatch(b, t))
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
                  onClick={() => {
                    setType('expense')
                    setCategory(activeExpenseCategories[0] || 'Makanan & Nutrisi')
                  }}
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
                  onClick={() => {
                    setType('income')
                    setCategory(INCOME_CATEGORIES[0] || 'Gaji Pokok')
                  }}
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
                  {categoryOptions.map((opt) => (
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
