'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import SholatWidget from '@/components/modules/SholatWidget'
import { Card, StatCard } from '@/components/ui'
import { Storage } from '@/lib/storage'
import type { PrayerStatus, PrayerName } from '@/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMosque,
  faClock,
  faFire,
  faCalendar,
  faBookOpen,
  faCircleCheck,
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

  useEffect(() => {
    const refresh = () => setPrayerStatus(Storage.getPrayerStatus())
    refresh()
    window.addEventListener('lifetime-data-change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('lifetime-data-change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const handleToggle = (prayer: PrayerName) => {
    const updated = Storage.togglePrayer(prayer)
    setPrayerStatus(updated)
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

  return (
    <DashboardLayout
      title="Sholat Tracker"
      subtitle="Jaga kedisiplinan dan ketenangan batin lewat sholat fardhu tepat waktu"
    >
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
            label="Current Streak"
            value={`${prayerStatus.streak} Hari`}
            sublabel="Konsistensi tanpa putus"
            icon={faFire}
            color="warning"
            trend="+1 hari ini"
            trendUp={true}
          />

          <StatCard
            label="Akurasi Waktu"
            value="94%"
            sublabel="Rata-rata tepat waktu awal sholat"
            icon={faClock}
            color="info"
          />
        </div>

        {/* Sholat Widget Main */}
        <SholatWidget status={prayerStatus} onToggle={handleToggle} />

        {/* Monthly Calendar Overview & Spiritual Reflection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center gap-2.5 mb-4">
              <FontAwesomeIcon icon={faCalendar} className="h-4 w-4 text-navy" />
              <h3 className="text-body-sm font-heading font-bold text-navy">
                Konsistensi 7 Hari Terakhir
              </h3>
            </div>

            <div className="space-y-3">
              {[
                { day: 'Hari Ini (Kamis)', count: doneCount, target: 5 },
                { day: 'Rabu, 21 Okt', count: 5, target: 5 },
                { day: 'Selasa, 20 Okt', count: 5, target: 5 },
                { day: 'Senin, 19 Okt', count: 5, target: 5 },
                { day: 'Minggu, 18 Okt', count: 4, target: 5 },
                { day: 'Sabtu, 17 Okt', count: 5, target: 5 },
                { day: 'Jumat, 16 Okt', count: 5, target: 5 },
              ].map((d, i) => (
                <div key={i} className="flex items-center justify-between text-body-sm py-1 border-b border-border/50 last:border-0">
                  <span className="font-medium text-navy">{d.day}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-caption text-slate">
                      {d.count}/{d.target}
                    </span>
                    {d.count === 5 ? (
                      <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4 text-sage" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-amber-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5 mb-4">
              <FontAwesomeIcon icon={faBookOpen} className="h-4 w-4 text-navy" />
              <h3 className="text-body-sm font-heading font-bold text-navy">
                Pengingat & Refleksi Sholat
              </h3>
            </div>

            <blockquote className="text-body-sm text-slate-700 leading-relaxed italic mb-4">
              &quot;Sesungguhnya sholat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang beriman.&quot;
              <span className="block text-caption font-semibold font-mono text-slate-500 mt-1 not-italic">
                — QS. An-Nisa: 103
              </span>
            </blockquote>

            <div className="p-3.5 rounded-xl bg-white border border-border text-caption text-navy space-y-1.5">
              <p className="font-semibold text-navy">Panduan Kedisiplinan Waktu:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Persiapkan wudhu sebelum kumandang adzan.</li>
                <li>Heningkan notifikasi perangkat selama prosesi ibadah.</li>
                <li>Luangkan waktu jeda 2 menit pasca sholat untuk evaluasi diri.</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
