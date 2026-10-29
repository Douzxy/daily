'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import FinanceWidget from '@/components/modules/FinanceWidget'
import AccountsWidget from '@/components/modules/AccountsWidget'
import PeriodFilterBar, { type PeriodMode } from '@/components/layout/PeriodFilterBar'
import { showToast } from '@/components/ui'
import { Storage } from '@/lib/storage'
import type { Transaction, BudgetCategory } from '@/types'
import {
  MONTH_NAMES_ID,
  getCurrentYearAndMonth,
  getWeeksInMonth,
  getTodayDateStr,
} from '@/lib/dateUtils'

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

  useEffect(() => {
    const refresh = () => {
      setTransactions(Storage.getTransactions())
      setBudgets(Storage.getBudgets())
    }
    refresh()
    Storage.syncFromDatabase()
      .then((changed) => {
        if (changed) refresh()
      })
      .catch(() => {})

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

  const handleResetToCurrentMonth = () => {
    const now = getCurrentYearAndMonth()
    setSelectedYear(now.year)
    setSelectedMonthIndex(now.monthIndex)
    showToast('Menampilkan bulan ini', 'info')
  }

  if (!mounted) {
    return (
      <DashboardLayout title="Keuangan" subtitle="Kelola cashflow & posisi saldo riil">
        <div className="flex items-center justify-center min-h-100">
          <div className="h-8 w-8 rounded-full border-2 border-navy border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Keuangan" subtitle="Kelola cashflow & posisi saldo riil">
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

        {/* Posisi Uang & Rekening Riil Saat Ini (Disertai Target Tabungan Terintegrasi) */}
        <AccountsWidget />

        {/* Main Finance Widget (Cashflow + Budgets + Quick Presets + Logger) */}
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
      </div>
    </DashboardLayout>
  )
}
