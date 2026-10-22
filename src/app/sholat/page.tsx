'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import SholatWidget from '@/components/modules/SholatWidget'
import { Card, StatCard, Badge } from '@/components/ui'
import { Storage } from '@/lib/storage'
import type { PrayerStatus, PrayerName } from '@/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMosque,
  faFire,
  faBookOpen,
  faCircleCheck,
  faCalendarWeek,
  faChartPie,
} from '@fortawesome/free-solid-svg-icons'

export default function SholatPage() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const [prayerStatus, setPrayerStatus] = useState<PrayerStatus>(() => {
    if (typeof window !== 'undefined') return Storage.getPrayerStatus()
    return {
      date: '',
      prayers: { subuh: false, dzuhur: false, ashar: false, maghrib: false, isya: false },
      streak: 14,
    }
  })
  const [history, setHistory] = useState<any[]>([])

  const fetchPrayers = async () => {
    try {
      const res = await fetch('/api/prayers')
      const json = await res.json()
      if (json && json.success) {
        if (json.today) setPrayerStatus(json.today)
        if (json.history) setHistory(json.history)
      }
    } catch (e) {
      console.warn('Failed to fetch prayers from DB:', e)
    }
  }

  useEffect(() => {
    fetchPrayers()
    window.addEventListener('lifetime-data-change', fetchPrayers)
    return () => window.removeEventListener('lifetime-data-change', fetchPrayers)
  }, [])

  const handleToggle = async (prayer: PrayerName) => {
    await Storage.syncBeforeAction()
    const updated = Storage.togglePrayer(prayer)
    setPrayerStatus(updated)
    fetchPrayers()
  }

  if (!mounted) {
    return (
      <DashboardLayout title="Sholat Tracker" subtitle="Pantau ibadah 5 waktu">
        <div className="flex items-center justify-center min-h-100">
          <div className="h-8 w-8 rounded-full border-2 border-navy border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  const doneCount = Object.values(prayerStatus.prayers).filter(Boolean).length

  // Calculate 7-day stats directly from database records
  const last7Days = history.slice(0, 7)
  let total7DaysDone = 0
  const breakdown = { subuh: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 }
  for (const day of last7Days) {
    if (day.subuh) { total7DaysDone++; breakdown.subuh++ }
    if (day.dzuhur) { total7DaysDone++; breakdown.dzuhur++ }
    if (day.ashar) { total7DaysDone++; breakdown.ashar++ }
    if (day.maghrib) { total7DaysDone++; breakdown.maghrib++ }
    if (day.isya) { total7DaysDone++; breakdown.isya++ }
  }
  const weeklyRate = last7Days.length > 0
    ? Math.round((total7DaysDone / (last7Days.length * 5)) * 100)
    : 100

  return (
    <DashboardLayout title="Sholat">
      <div className="space-y-6 pb-12">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Sholat Hari Ini"
            value={`${doneCount}/5`}
            sublabel={`${Math.round((doneCount / 5) * 100)}% terselesaikan`}
            icon={faMosque}
            color={doneCount === 5 ? 'sage' : 'navy'}
          />

          <StatCard
            label="Kepatuhan 7 Hari (Database)"
            value={`${weeklyRate}%`}
            sublabel={`${total7DaysDone} dari ${last7Days.length * 5} sholat tertunaikan`}
            icon={faChartPie}
            color="sage"
            trend="Data Real-Time DB"
            trendUp={true}
          />

          <StatCard
            label="Current Streak"
            value={`${prayerStatus.streak} Hari`}
            sublabel="Konsistensi ibadah tanpa putus"
            icon={faFire}
            color="warning"
            trend="Aktif"
            trendUp={true}
          />
        </div>

        {/* Sholat Widget Main */}
        <SholatWidget status={prayerStatus} onToggle={handleToggle} />

        {/* Weekly & Monthly Real-time Database Evaluation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-navy/10 text-navy flex items-center justify-center">
                  <FontAwesomeIcon icon={faCalendarWeek} className="h-4 w-4 text-navy" />
                </div>
                <div>
                  <h3 className="text-body-sm font-heading font-bold text-navy">
                    Laporan Mingguan Sholat (Database Neon)
                  </h3>
                  <span className="text-caption text-slate">Catatan riwayat sholat 7 hari terakhir</span>
                </div>
              </div>
              <Badge variant={weeklyRate >= 80 ? 'success' : 'warning'}>
                {weeklyRate}% Kepatuhan
              </Badge>
            </div>

            <div className="space-y-2.5">
              {last7Days.map((d) => {
                const dayDone = (d.subuh ? 1 : 0) + (d.dzuhur ? 1 : 0) + (d.ashar ? 1 : 0) + (d.maghrib ? 1 : 0) + (d.isya ? 1 : 0)
                const isToday = d.date === prayerStatus.date
                const dateObj = new Date(d.date)
                const dayLabel = isToday
                  ? `Hari Ini (${dateObj.toLocaleDateString('id-ID', { weekday: 'long' })})`
                  : dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })

                return (
                  <div key={d.date} className="flex items-center justify-between text-body-sm p-2.5 rounded-xl border border-border bg-slate-50/50">
                    <div>
                      <span className="font-heading font-bold text-navy block text-body-sm">{dayLabel}</span>
                      <div className="flex gap-1.5 mt-1 text-[10px] font-mono">
                        <span className={d.subuh ? 'text-emerald-700 font-bold' : 'text-slate-400'}>Subuh</span>
                        <span>•</span>
                        <span className={d.dzuhur ? 'text-emerald-700 font-bold' : 'text-slate-400'}>Dzuhur</span>
                        <span>•</span>
                        <span className={d.ashar ? 'text-emerald-700 font-bold' : 'text-slate-400'}>Ashar</span>
                        <span>•</span>
                        <span className={d.maghrib ? 'text-emerald-700 font-bold' : 'text-slate-400'}>Maghrib</span>
                        <span>•</span>
                        <span className={d.isya ? 'text-emerald-700 font-bold' : 'text-slate-400'}>Isya</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-navy text-caption">
                        {dayDone}/5
                      </span>
                      {dayDone === 5 ? (
                        <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4 text-sage" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-lg bg-navy/10 text-navy flex items-center justify-center">
                  <FontAwesomeIcon icon={faBookOpen} className="h-4 w-4 text-navy" />
                </div>
                <div>
                  <h3 className="text-body-sm font-heading font-bold text-navy">
                    Pengingat & Evaluasi Ibadah
                  </h3>
                  <span className="text-caption text-slate">Panduan kedisiplinan 5 waktu</span>
                </div>
              </div>

              <blockquote className="text-body-sm text-slate-700 leading-relaxed italic mb-4 p-3 rounded-xl bg-white border border-border">
                &quot;Sesungguhnya sholat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang beriman.&quot;
                <span className="block text-caption font-semibold font-mono text-slate-500 mt-1 not-italic">
                  — QS. An-Nisa: 103
                </span>
              </blockquote>

              <div className="p-3.5 rounded-xl bg-white border border-border text-caption text-navy space-y-2">
                <span className="font-bold text-navy uppercase tracking-wider block text-[11px]">
                  Rincian Kepatuhan 7 Hari:
                </span>
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-border">
                    <span className="text-[10px] text-slate block">Subuh</span>
                    <strong className="text-navy">{breakdown.subuh}/{last7Days.length}</strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-border">
                    <span className="text-[10px] text-slate block">Dzuhur</span>
                    <strong className="text-navy">{breakdown.dzuhur}/{last7Days.length}</strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-border">
                    <span className="text-[10px] text-slate block">Ashar</span>
                    <strong className="text-navy">{breakdown.ashar}/{last7Days.length}</strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-border">
                    <span className="text-[10px] text-slate block">Maghrib</span>
                    <strong className="text-navy">{breakdown.maghrib}/{last7Days.length}</strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-border">
                    <span className="text-[10px] text-slate block">Isya</span>
                    <strong className="text-navy">{breakdown.isya}/{last7Days.length}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-border flex items-center justify-between text-[11px] text-slate">
              <span>Tersimpan Permanen:</span>
              <strong className="text-navy font-mono">daily_prayers</strong>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
