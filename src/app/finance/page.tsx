'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import FinanceWidget, { formatRupiah } from '@/components/modules/FinanceWidget'
import { Card, Badge, ProgressBar, showToast } from '@/components/ui'
import { Storage } from '@/lib/storage'
import type { Transaction, BudgetCategory } from '@/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPiggyBank,
  faArrowTrendUp,
  faShieldHalved,
  faBullseye,
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

  useEffect(() => {
    const refresh = () => {
      setTransactions(Storage.getTransactions())
      setBudgets(Storage.getBudgets())
    }
    refresh()
    window.addEventListener('lifetime-data-change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('lifetime-data-change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const handleAddTransaction = (tx: Omit<Transaction, 'id'>) => {
    const saved = Storage.addTransaction(tx)
    setTransactions((prev) => [saved, ...prev])
  }

  const handleDeleteTransaction = (id: string) => {
    Storage.deleteTransaction(id)
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    showToast('Transaksi berhasil dihapus', 'info')
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

  // Savings goals tailored to Rp 2.800.000 salary
  const savingsGoals = [
    {
      id: 'sg-1',
      title: 'Dana Darurat (6x Operasional)',
      target: 12000000,
      current: 4500000,
      icon: faShieldHalved,
      color: 'sage' as const,
    },
    {
      id: 'sg-2',
      title: 'Investasi Saham & RDN Q4',
      target: 5000000,
      current: 2200000,
      icon: faArrowTrendUp,
      color: 'navy' as const,
    },
    {
      id: 'sg-3',
      title: 'Sepatu Gym & Sabuk Angkat Beban',
      target: 750000,
      current: 550000,
      icon: faBullseye,
      color: 'info' as const,
    },
  ]

  return (
    <DashboardLayout title="Keuangan">
      <div className="space-y-6 pb-12">
        {/* Main Finance Widget (Cashflow + Budgets + Logger) */}
        <FinanceWidget
          transactions={transactions}
          budgets={budgets}
          onAddTransaction={handleAddTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />

        {/* Savings Goals Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savingsGoals.map((g) => {
              const pct = Math.round((g.current / g.target) * 100)
              const remaining = g.target - g.current

              return (
                <Card key={g.id} className="relative overflow-hidden">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-navy">
                        <FontAwesomeIcon icon={g.icon} className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-body-sm font-heading font-bold text-navy line-clamp-1">
                        {g.title}
                      </span>
                    </div>
                    <Badge variant={pct >= 80 ? 'success' : 'default'} className="text-[10px]">
                      {pct}%
                    </Badge>
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
                    color={g.color}
                    size="md"
                    showLabel={false}
                  />

                  <div className="flex items-center justify-between text-[11px] text-slate mt-2 font-mono">
                    <span>Sisa: {formatRupiah(remaining)}</span>
                    <span className="text-sage font-medium">On track</span>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
