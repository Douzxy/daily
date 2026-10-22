'use client'

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChartPie,
  faCalendarWeek,
  faCalendarDays,
  faMosque,
  faWallet,
  faDumbbell,
  faListCheck,
  faArrowTrendUp,
  faCheckDouble,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons'
import { Card, Badge, ProgressBar } from '@/components/ui'
import { formatRupiah } from './FinanceWidget'

interface AnalyticsData {
  sholat: {
    today: any
    weeklyDone: number
    weeklyTotal: number
    weeklyRate: number
    monthlyRate: number
    breakdown: { subuh: number; dzuhur: number; ashar: number; maghrib: number; isya: number }
    history: any[]
  }
  finance: {
    monthlyIncome: number
    monthlyExpense: number
    weeklyExpense: number
    netSavings: number
    savingsRate: number
    categoryTotals: Record<string, number>
    totalTransactions: number
  }
  todos: {
    total: number
    completed: number
    completionRate: number
  }
  gym: {
    currentWeight: number
    targetWeight: number
    remainingKg: string
    weightLogs: any[]
  }
}

export default function PeriodicEvaluationWidget() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics')
      const json = await res.json()
      if (json && json.success && json.evaluation) {
        setData(json.evaluation)
      }
    } catch (e) {
      console.warn('Failed to fetch analytics:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    const handleDataChange = () => fetchAnalytics()
    window.addEventListener('lifetime-data-change', handleDataChange)
    return () => window.removeEventListener('lifetime-data-change', handleDataChange)
  }, [])

  if (loading && !data) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-7 w-7 rounded-full border-2 border-navy border-t-transparent animate-spin" />
        </div>
      </Card>
    )
  }

  if (!data) return null

  const isWeekly = period === 'weekly'

  // Sholat values
  const prayerRate = isWeekly ? data.sholat.weeklyRate : data.sholat.monthlyRate
  const prayerDoneCount = isWeekly ? data.sholat.weeklyDone : Math.round((data.sholat.monthlyRate / 100) * 150)
  const prayerTotalCount = isWeekly ? (data.sholat.weeklyTotal || 35) : 150

  // Finance values
  const currentExpense = isWeekly ? data.finance.weeklyExpense : data.finance.monthlyExpense
  const netSavings = isWeekly ? (data.finance.monthlyIncome / 4) - data.finance.weeklyExpense : data.finance.netSavings
  const savingsRate = isWeekly
    ? Math.max(0, Math.round((netSavings / (data.finance.monthlyIncome / 4)) * 100))
    : data.finance.savingsRate

  return (
    <Card className="relative overflow-hidden border-navy/20 shadow-sm">
      {/* Header & Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-navy text-white flex items-center justify-center shrink-0 shadow-xs">
            <FontAwesomeIcon icon={faChartPie} className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-body-lg sm:text-h4 font-heading font-bold text-navy">
                Laporan & Evaluasi Berkala
              </h3>
              <Badge variant="navy" className="text-[10px]">
                {isWeekly ? '7 Hari Terakhir' : 'Bulan Berjalan'}
              </Badge>
            </div>
            <p className="text-caption text-slate">
              Monitoring performa ibadah, cashflow, produktivitas & kebugaran
            </p>
          </div>
        </div>

        {/* Switcher Buttons */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-border self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setPeriod('weekly')}
            className={`px-3.5 py-1.5 rounded-lg text-caption font-heading font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isWeekly
                ? 'bg-navy text-white shadow-xs'
                : 'text-slate hover:text-navy hover:bg-white/80'
            }`}
          >
            <FontAwesomeIcon icon={faCalendarWeek} className="text-xs" />
            <span>Laporan Mingguan</span>
          </button>
          <button
            type="button"
            onClick={() => setPeriod('monthly')}
            className={`px-3.5 py-1.5 rounded-lg text-caption font-heading font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              !isWeekly
                ? 'bg-navy text-white shadow-xs'
                : 'text-slate hover:text-navy hover:bg-white/80'
            }`}
          >
            <FontAwesomeIcon icon={faCalendarDays} className="text-xs" />
            <span>Laporan Bulanan</span>
          </button>
        </div>
      </div>

      {/* Grid of 4 Core Evaluations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Evaluasi Ibadah / Sholat */}
        <div className="p-4 rounded-xl bg-surface border border-border hover:border-slate/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-navy/10 text-navy flex items-center justify-center">
                  <FontAwesomeIcon icon={faMosque} className="h-3.5 w-3.5 text-navy" />
                </div>
                <h4 className="text-body-sm font-heading font-bold text-navy">
                  Evaluasi Sholat 5 Waktu
                </h4>
              </div>
              <Badge variant={prayerRate >= 80 ? 'success' : prayerRate >= 50 ? 'warning' : 'default'}>
                {prayerRate}% Tertunaikan
              </Badge>
            </div>

            <p className="text-caption text-slate mb-3">
              Total {prayerDoneCount} dari {prayerTotalCount} waktu sholat tercatat tertunaikan.
            </p>

            <ProgressBar
              value={prayerRate}
              max={100}
              color={prayerRate >= 80 ? 'sage' : 'navy'}
              size="sm"
              showLabel={false}
            />

            {/* Prayer Breakdown Pills */}
            <div className="grid grid-cols-5 gap-1.5 mt-3 text-center">
              {[
                { label: 'Subuh', count: data.sholat.breakdown.subuh },
                { label: 'Dzuhur', count: data.sholat.breakdown.dzuhur },
                { label: 'Ashar', count: data.sholat.breakdown.ashar },
                { label: 'Maghrib', count: data.sholat.breakdown.maghrib },
                { label: 'Isya', count: data.sholat.breakdown.isya },
              ].map((p) => (
                <div key={p.label} className="p-1.5 rounded-lg bg-slate-50 border border-border/70">
                  <span className="text-[10px] text-slate block">{p.label}</span>
                  <span className="text-caption font-mono font-bold text-navy">
                    {p.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-[11px] text-slate">
            <span>Streak Konsisten: <strong>14 Hari</strong></span>
            <span className="text-sage font-semibold">Tercatat di Database</span>
          </div>
        </div>

        {/* 2. Evaluasi Keuangan & Cashflow */}
        <div className="p-4 rounded-xl bg-surface border border-border hover:border-slate/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FontAwesomeIcon icon={faWallet} className="h-3.5 w-3.5 text-emerald-800" />
                </div>
                <h4 className="text-body-sm font-heading font-bold text-navy">
                  Evaluasi Cashflow & Tabungan
                </h4>
              </div>
              <Badge variant={savingsRate >= 50 ? 'success' : 'warning'}>
                Tabungan: {savingsRate}%
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2.5">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-border">
                <span className="text-[10px] text-slate block uppercase font-medium">
                  {isWeekly ? 'Pengeluaran Minggu Ini' : 'Pengeluaran Bulan Ini'}
                </span>
                <span className="text-body-sm font-heading font-bold text-navy font-mono">
                  {formatRupiah(currentExpense)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-border">
                <span className="text-[10px] text-slate block uppercase font-medium">
                  Sisa Bersih dari Gaji
                </span>
                <span className="text-body-sm font-heading font-bold text-emerald-700 font-mono">
                  {formatRupiah(Math.max(0, netSavings))}
                </span>
              </div>
            </div>

            <ProgressBar
              value={savingsRate}
              max={100}
              color="sage"
              size="sm"
              showLabel={false}
            />
          </div>

          <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-[11px] text-slate">
            <span>Gaji Pokok: <strong>Rp 2.800.000</strong></span>
            <span className="text-emerald-700 font-semibold">Cashflow Terkendali</span>
          </div>
        </div>

        {/* 3. Evaluasi Produktivitas & To-Do List */}
        <div className="p-4 rounded-xl bg-surface border border-border hover:border-slate/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-navy/10 text-navy flex items-center justify-center">
                  <FontAwesomeIcon icon={faListCheck} className="h-3.5 w-3.5 text-navy" />
                </div>
                <h4 className="text-body-sm font-heading font-bold text-navy">
                  Evaluasi Produktivitas Agenda
                </h4>
              </div>
              <Badge variant="navy">
                {data.todos.completionRate}% Tuntas
              </Badge>
            </div>

            <p className="text-caption text-slate mb-3">
              Total {data.todos.completed} dari {data.todos.total} rencana agenda hari ini selesai.
            </p>

            <ProgressBar
              value={data.todos.completionRate}
              max={100}
              color={data.todos.completionRate >= 70 ? 'sage' : 'navy'}
              size="sm"
              showLabel={false}
            />

            <div className="p-2.5 rounded-lg bg-slate-50 border border-border mt-3 text-caption text-slate flex items-center justify-between">
              <span>Status Agenda:</span>
              <strong className="text-navy">
                {data.todos.total === 0 ? 'Semua tugas bersih' : `${data.todos.total - data.todos.completed} tugas antrean`}
              </strong>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-[11px] text-slate">
            <span>Disinkronkan Atomik:</span>
            <span className="text-navy font-semibold font-mono">daily_todos</span>
          </div>
        </div>

        {/* 4. Evaluasi Kebugaran & Berat Badan Menuju 68.0 kg */}
        <div className="p-4 rounded-xl bg-surface border border-border hover:border-slate/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <FontAwesomeIcon icon={faDumbbell} className="h-3.5 w-3.5 text-amber-800" />
                </div>
                <h4 className="text-body-sm font-heading font-bold text-navy">
                  Evaluasi Clean Bulk Menuju 68 kg
                </h4>
              </div>
              <Badge variant="warning">
                Target 68.0 kg
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2.5">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-border">
                <span className="text-[10px] text-slate block uppercase font-medium">BB Saat Ini</span>
                <span className="text-body-sm font-heading font-bold text-navy font-mono">
                  {data.gym.currentWeight.toFixed(1)} kg
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-border">
                <span className="text-[10px] text-slate block uppercase font-medium">Sisa Target</span>
                <span className="text-body-sm font-heading font-bold text-navy font-mono">
                  +{data.gym.remainingKg} kg
                </span>
              </div>
            </div>

            <ProgressBar
              value={Math.round(((data.gym.currentWeight - 55) / (data.gym.targetWeight - 55)) * 100)}
              max={100}
              color="navy"
              size="sm"
              showLabel={false}
            />
          </div>

          <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-[11px] text-slate">
            <span>Program: <strong>Push / Pull / Legs</strong></span>
            <span className="text-sage font-semibold">Progres Terpantau</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
