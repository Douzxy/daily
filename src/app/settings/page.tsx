'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, Button } from '@/components/ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser,
  faShieldHalved,
  faDownload,
  faRotateLeft,
  faCircleCheck,
  faSliders,
} from '@fortawesome/free-solid-svg-icons'

export default function SettingsPage() {
  const [name, setName] = useState('Edo')
  const [email, setEmail] = useState('edo@lifetime.dev')
  const [city, setCity] = useState('Jakarta (WIB)')
  const [targetWeight, setTargetWeight] = useState('75.0')
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleExportData = () => {
    if (typeof window === 'undefined') return
    const exportData: Record<string, any> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('lifetime_')) {
        try {
          exportData[key] = JSON.parse(localStorage.getItem(key) || '{}')
        } catch {
          exportData[key] = localStorage.getItem(key)
        }
      }
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lifetime_backup_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh data ke data awal?')) {
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('lifetime_')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k))
        window.location.reload()
      }
    }
  }

  return (
    <DashboardLayout
      title="Pengaturan & Preferensi"
      subtitle="Kustomisasi identitas, target kesehatan & kelola data aplikasi Lifetime Anda"
    >
      <div className="space-y-6 pb-12 max-w-4xl">
        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 animate-fade-in text-body-sm">
            <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4 text-sage" />
            <span>Perubahan profil berhasil disimpan.</span>
          </div>
        )}

        {/* Profile Card */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-navy" />
            </div>
            <div>
              <h3 className="text-h4 font-heading font-bold text-navy">
                Profil & Identitas Diri
              </h3>
              <p className="text-caption text-slate">
                Informasi dasar untuk personalisasi dashboard harian
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Nama Lengkap / Panggilan
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Zona Waktu & Kota Sholat
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Target Berat Badan (kg)
                </label>
                <input
                  type="text"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button type="submit" variant="primary" size="md">
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Card>

        {/* Design System & Aesthetic info */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-sage/10 text-sage flex items-center justify-center">
              <FontAwesomeIcon icon={faSliders} className="h-4 w-4 text-sage" />
            </div>
            <div>
              <h3 className="text-h4 font-heading font-bold text-navy">
                Design System: Verdana Health
              </h3>
              <p className="text-caption text-slate">
                Calm, trustworthy, clinical-yet-warm aesthetic (refero.design money standard)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-caption">
            <div className="p-3 rounded-lg border border-border bg-surface">
              <div className="h-6 w-full rounded bg-navy mb-1.5" />
              <span className="font-semibold text-navy">Primary Navy</span>
              <p className="text-[10px] text-slate font-mono">#0F172A</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface">
              <div className="h-6 w-full rounded bg-sage mb-1.5" />
              <span className="font-semibold text-navy">Tertiary Sage</span>
              <p className="text-[10px] text-slate font-mono">#059669</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface">
              <div className="h-6 w-full rounded bg-slate mb-1.5" />
              <span className="font-semibold text-navy">Secondary Slate</span>
              <p className="text-[10px] text-slate font-mono">#64748B</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface">
              <div className="h-6 w-full rounded bg-bg border border-border mb-1.5" />
              <span className="font-semibold text-navy">Canvas Background</span>
              <p className="text-[10px] text-slate font-mono">#F8FAFC</p>
            </div>
          </div>
        </Card>

        {/* Data & Backup Card */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center">
              <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4 text-navy" />
            </div>
            <div>
              <h3 className="text-h4 font-heading font-bold text-navy">
                Kelola Data & Cadangan
              </h3>
              <p className="text-caption text-slate">
                Seluruh data tersimpan secara lokal di browser Anda dengan zero latency
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-border/70">
            <div>
              <h4 className="text-body-sm font-semibold text-navy">
                Ekspor Backup JSON
              </h4>
              <p className="text-caption text-slate mt-0.5">
                Unduh seluruh data sholat, keuangan, catatan gym & notion
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportData}
              className="gap-2 w-full sm:w-auto"
            >
              <FontAwesomeIcon icon={faDownload} className="h-3.5 w-3.5" />
              <span>Unduh Backup</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-red-50/50 border border-red-200/60 mt-3">
            <div>
              <h4 className="text-body-sm font-semibold text-red-900">
                Reset Seluruh Data
              </h4>
              <p className="text-caption text-red-700/80 mt-0.5">
                Mengembalikan seluruh data ke kondisi bawaan awal
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleResetData}
              className="gap-2 w-full sm:w-auto"
            >
              <FontAwesomeIcon icon={faRotateLeft} className="h-3.5 w-3.5" />
              <span>Reset Data</span>
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
