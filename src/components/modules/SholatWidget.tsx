'use client'

import { useState, useEffect } from 'react'
import { Card, Badge, ProgressBar, showToast, TaskMascot } from '@/components/ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMosque,
  faFire,
  faCheck,
  faClock,
  faLocationDot,
  faLocationCrosshairs,
  faBell,
  faBellSlash,
  faXmark,
  faHourglassHalf,
} from '@fortawesome/free-solid-svg-icons'
import type { PrayerStatus, PrayerName } from '@/types'
import { Storage } from '@/lib/storage'

interface SholatWidgetProps {
  status: PrayerStatus
  onToggle: (prayer: PrayerName) => void
}

export interface CityPrayerTimes {
  id: string
  name: string
  province: string
  zone: 'WIB' | 'WITA' | 'WIT'
  lat: number
  lon: number
  terbit?: string
  times: {
    subuh: string
    dzuhur: string
    ashar: string
    maghrib: string
    isya: string
  }
}

export const INDONESIAN_CITIES: CityPrayerTimes[] = [
  {
    id: 'tangsel',
    name: 'Tangerang Selatan',
    province: 'Banten',
    zone: 'WIB',
    lat: -6.2888,
    lon: 106.7179,
    terbit: '05:45',
    times: { subuh: '04:33', dzuhur: '11:55', ashar: '15:13', maghrib: '18:05', isya: '19:15' },
  },
  {
    id: 'tangerang',
    name: 'Kota Tangerang',
    province: 'Banten',
    zone: 'WIB',
    lat: -6.1783,
    lon: 106.6319,
    terbit: '05:45',
    times: { subuh: '04:33', dzuhur: '11:55', ashar: '15:13', maghrib: '18:05', isya: '19:15' },
  },
  {
    id: 'jakarta',
    name: 'DKI Jakarta',
    province: 'Jabodetabek',
    zone: 'WIB',
    lat: -6.2088,
    lon: 106.8456,
    terbit: '05:44',
    times: { subuh: '04:32', dzuhur: '11:54', ashar: '15:12', maghrib: '18:04', isya: '19:14' },
  },
  {
    id: 'bandung',
    name: 'Bandung',
    province: 'Jawa Barat',
    zone: 'WIB',
    lat: -6.9175,
    lon: 107.6191,
    terbit: '05:42',
    times: { subuh: '04:29', dzuhur: '11:51', ashar: '15:10', maghrib: '18:01', isya: '19:11' },
  },
  {
    id: 'surabaya',
    name: 'Surabaya / Jawa Timur',
    province: 'Jawa Timur',
    zone: 'WIB',
    lat: -7.2575,
    lon: 112.7521,
    terbit: '05:29',
    times: { subuh: '04:10', dzuhur: '11:38', ashar: '14:48', maghrib: '17:46', isya: '18:57' },
  },
  {
    id: 'yogyakarta',
    name: 'Yogyakarta',
    province: 'DI Yogyakarta',
    zone: 'WIB',
    lat: -7.7956,
    lon: 110.3695,
    times: { subuh: '04:18', dzuhur: '11:40', ashar: '14:58', maghrib: '17:50', isya: '19:00' },
  },
  {
    id: 'semarang',
    name: 'Semarang',
    province: 'Jawa Tengah',
    zone: 'WIB',
    lat: -6.9667,
    lon: 110.4167,
    times: { subuh: '04:17', dzuhur: '11:39', ashar: '14:57', maghrib: '17:49', isya: '18:59' },
  },
  {
    id: 'medan',
    name: 'Medan',
    province: 'Sumatera Utara',
    zone: 'WIB',
    lat: 3.5952,
    lon: 98.6722,
    times: { subuh: '04:58', dzuhur: '12:20', ashar: '15:38', maghrib: '18:30', isya: '19:40' },
  },
  {
    id: 'makassar',
    name: 'Makassar',
    province: 'Sulawesi Selatan',
    zone: 'WITA',
    lat: -5.1477,
    lon: 119.4327,
    times: { subuh: '04:38', dzuhur: '12:00', ashar: '15:18', maghrib: '18:10', isya: '19:20' },
  },
  {
    id: 'denpasar',
    name: 'Denpasar / Bali',
    province: 'Bali',
    zone: 'WITA',
    lat: -8.6705,
    lon: 115.2126,
    times: { subuh: '04:55', dzuhur: '12:17', ashar: '15:35', maghrib: '18:27', isya: '19:37' },
  },
  {
    id: 'banjarmasin',
    name: 'Banjarmasin',
    province: 'Kalimantan Selatan',
    zone: 'WITA',
    lat: -3.3194,
    lon: 114.5908,
    times: { subuh: '04:52', dzuhur: '12:14', ashar: '15:32', maghrib: '18:24', isya: '19:34' },
  },
  {
    id: 'balikpapan',
    name: 'Balikpapan',
    province: 'Kalimantan Timur',
    zone: 'WITA',
    lat: -1.2654,
    lon: 116.8312,
    times: { subuh: '04:47', dzuhur: '12:09', ashar: '15:27', maghrib: '18:19', isya: '19:29' },
  },
]

function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

export default function SholatWidget({ status, onToggle }: SholatWidgetProps) {
  const [selectedCityId, setSelectedCityId] = useState<string>(() => {
    if (typeof window === 'undefined') return 'tangsel'
    const saved = Storage.getSelectedCity()
    const found = INDONESIAN_CITIES.find(
      (c) => c.name.toLowerCase() === saved.toLowerCase() || c.id === saved
    )
    return found ? found.id : 'tangsel'
  })
  const [showCityModal, setShowCityModal] = useState(false)
  const [reminderActive, setReminderActive] = useState(true)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [nowMinutes, setNowMinutes] = useState(() => {
    const d = new Date()
    return d.getHours() * 60 + d.getMinutes()
  })

  // Periodic clock update
  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date()
      setNowMinutes(d.getHours() * 60 + d.getMinutes())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const currentCity = INDONESIAN_CITIES.find((c) => c.id === selectedCityId) || INDONESIAN_CITIES[0]

  const handleSelectCity = (cityId: string, notify = true) => {
    setSelectedCityId(cityId)
    const city = INDONESIAN_CITIES.find((c) => c.id === cityId)
    if (city) {
      Storage.setSelectedCity(city.name)
      if (notify) {
        showToast(`Jadwal sholat disetel untuk ${city.name} (${city.province})`, 'success')
      }
    }
    setShowCityModal(false)
  }

  const handleGpsDetect = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      handleSelectCity('tangsel', false)
      showToast('Browser tidak mendukung geolokasi. Lokasi disetel ke Tangerang Selatan.', 'info')
      return
    }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        // Find closest Indonesian city by Euclidean distance
        let closest = INDONESIAN_CITIES[0]
        let minDist = Infinity
        for (const city of INDONESIAN_CITIES) {
          const dist = Math.hypot(city.lat - latitude, city.lon - longitude)
          if (dist < minDist) {
            minDist = dist
            closest = city
          }
        }
        handleSelectCity(closest.id, false)
        showToast(`Lokasi GPS terdeteksi: ${closest.name} (${closest.province})`, 'success')
        setGpsLoading(false)
      },
      () => {
        setGpsLoading(false)
        handleSelectCity('tangsel', false)
        showToast('Tidak dapat mendeteksi GPS. Lokasi dialihkan ke Tangerang Selatan.', 'info')
      },
      { timeout: 7000 }
    )
  }

  // Determine current active or upcoming prayer
  const prayerOrder: { name: PrayerName; label: string; desc: string }[] = [
    { name: 'subuh', label: 'Subuh', desc: '2 Rakaat fardhu' },
    { name: 'dzuhur', label: 'Dzuhur', desc: '4 Rakaat fardhu' },
    { name: 'ashar', label: 'Ashar', desc: '4 Rakaat fardhu' },
    { name: 'maghrib', label: 'Maghrib', desc: '3 Rakaat fardhu' },
    { name: 'isya', label: 'Isya', desc: '4 Rakaat fardhu' },
  ]

  let upcomingPrayerName: PrayerName = 'subuh'
  let minutesUntilNext = 0

  for (const p of prayerOrder) {
    const pMinutes = parseTimeToMinutes(currentCity.times[p.name])
    if (nowMinutes < pMinutes) {
      upcomingPrayerName = p.name
      minutesUntilNext = pMinutes - nowMinutes
      break
    }
  }

  if (nowMinutes >= parseTimeToMinutes(currentCity.times.isya)) {
    upcomingPrayerName = 'subuh'
    const tomorrowSubuh = 24 * 60 + parseTimeToMinutes(currentCity.times.subuh)
    minutesUntilNext = tomorrowSubuh - nowMinutes
  }

  const formatCountdown = (mins: number): string => {
    const hours = Math.floor(mins / 60)
    const m = mins % 60
    if (hours > 0) return `${hours} jam ${m} mnt lagi`
    return `${m} menit lagi`
  }

  const completedCount = Object.values(status.prayers).filter(Boolean).length
  const totalPrayers = 5
  const percentage = Math.round((completedCount / totalPrayers) * 100)

  return (
    <Card className="relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy">
            <FontAwesomeIcon icon={faMosque} className="h-4 w-4 sm:h-5 sm:w-5 text-navy" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-body-lg sm:text-h4 font-heading font-bold text-navy truncate">
                Sholat Lima Waktu
              </h3>
              <Badge variant="navy" className="text-[10px] py-0.5 px-2 shrink-0">
                Fardhu
              </Badge>
            </div>
            {/* Location Pill Button */}
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setShowCityModal(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
                title="Ganti Wilayah Waktu Sholat"
              >
                <FontAwesomeIcon icon={faLocationDot} className="text-sage text-[10px]" />
                <span className="font-semibold">{currentCity.name}</span>
                <span className="text-[10px] text-slate font-mono">
                  ({currentCity.zone}{currentCity.terbit ? ` • Terbit ${currentCity.terbit}` : ''})
                </span>
              </button>

              <button
                type="button"
                onClick={handleGpsDetect}
                disabled={gpsLoading}
                className="text-[11px] text-slate hover:text-navy transition-colors px-1.5 py-0.5 rounded hover:bg-slate-100"
                title="Deteksi Lokasi GPS"
              >
                <FontAwesomeIcon
                  icon={faLocationCrosshairs}
                  className={`text-[11px] ${gpsLoading ? 'animate-spin text-sage' : ''}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Streak Pill & Adhan reminder toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setReminderActive(!reminderActive)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium transition-all ${
              reminderActive
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                : 'bg-slate-100 text-slate'
            }`}
            title={reminderActive ? 'Pengingat Adzan Aktif' : 'Pengingat Hening'}
          >
            <FontAwesomeIcon
              icon={reminderActive ? faBell : faBellSlash}
              className={`text-[10px] ${reminderActive ? 'text-sage' : 'text-slate'}`}
            />
            <span>{reminderActive ? 'Adzan Aktif' : 'Hening'}</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-800 text-caption font-semibold">
            <FontAwesomeIcon icon={faFire} className="h-3.5 w-3.5 text-amber-500" />
            <span>{status.streak} Hari Streak</span>
          </div>
        </div>
      </div>

      {/* Progress & Live Countdown Banner */}
      <div className="mb-4 p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-border/80 flex items-center gap-3.5">
        <div className="shrink-0">
          <TaskMascot
            state={percentage === 100 ? 'done' : completedCount > 0 ? 'in_progress' : 'added_today'}
            size={40}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-body-sm font-medium mb-1.5">
            <div className="flex items-center gap-1.5 text-slate text-caption sm:text-body-sm truncate">
              <FontAwesomeIcon icon={faHourglassHalf} className="text-sage text-xs shrink-0" />
              <span className="truncate">
                Menuju <strong className="text-navy capitalize">{upcomingPrayerName}</strong>:{' '}
                <span className="font-mono text-sage font-bold">{formatCountdown(minutesUntilNext)}</span>
              </span>
            </div>
            <span className="font-heading font-bold text-navy tabular-nums text-caption sm:text-body-sm shrink-0 ml-2">
              {completedCount}/5 ({percentage}%)
            </span>
          </div>
          <ProgressBar
            value={completedCount}
            max={totalPrayers}
            color={percentage === 100 ? 'sage' : 'navy'}
            showLabel={false}
            size="sm"
          />
          {percentage === 100 && (
            <div className="flex items-center gap-1.5 text-caption text-sage font-medium mt-1.5">
              <FontAwesomeIcon icon={faCheck} className="h-3 w-3 shrink-0" />
              <span className="truncate">Alhamdulillah, seluruh sholat fardhu hari ini telah ditunaikan.</span>
            </div>
          )}
        </div>
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {prayerOrder.map((item) => {
          const isDone = status.prayers[item.name]
          const isUpcoming = !isDone && upcomingPrayerName === item.name
          const timeStr = currentCity.times[item.name]

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                const nextDone = !status.prayers[item.name]
                onToggle(item.name)
                showToast(
                  nextDone
                    ? `Alhamdulillah, Sholat ${item.label} selesai ditunaikan!`
                    : `Sholat ${item.label} ditandai belum selesai`,
                  nextDone ? 'success' : 'info'
                )
              }}
              className={`
                group relative flex flex-col justify-between p-3 sm:p-3.5 rounded-xl border text-left
                transition-all duration-200 active:scale-[0.98]
                ${
                  isDone
                    ? 'bg-emerald-50/70 border-emerald-300/80 shadow-xs'
                    : isUpcoming
                    ? 'bg-surface border-navy ring-2 ring-navy/10 shadow-sm'
                    : 'bg-surface border-border hover:border-slate/40 hover:bg-slate-50/40'
                }
              `}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faClock} className={`text-[10px] ${isDone ? 'text-emerald-700' : isUpcoming ? 'text-navy' : 'text-slate-400'}`} />
                  <span className="text-caption font-mono font-bold text-navy tabular-nums">
                    {timeStr}
                  </span>
                </div>
                <div
                  className={`
                    h-5 w-5 rounded-full flex items-center justify-center transition-all duration-200
                    ${
                      isDone
                        ? 'bg-sage text-white shadow-xs'
                        : isUpcoming
                        ? 'border-2 border-navy bg-white'
                        : 'border border-slate-300 bg-white group-hover:border-slate-500'
                    }
                  `}
                >
                  {isDone && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
                </div>
              </div>

              <div>
                <span
                  className={`block text-body-sm font-heading font-bold transition-colors ${
                    isDone ? 'text-emerald-900 line-through opacity-80' : 'text-navy'
                  }`}
                >
                  {item.label}
                </span>
                <span className="text-[11px] text-slate-light block mt-0.5">
                  {isDone ? 'Selesai' : isUpcoming ? 'Waktu Terdekat' : item.desc}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* City Selection Modal */}
      {showCityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-navy/60 backdrop-blur-xs"
            onClick={() => setShowCityModal(false)}
          />
          <div className="relative w-full max-w-sm max-h-[85vh] flex flex-col rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden z-10 animate-scale-in">
            <div className="bg-navy px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faLocationDot} className="text-sage text-sm" />
                <h4 className="font-heading font-bold text-body-sm">Pilih Kota / Wilayah</h4>
              </div>
              <button
                onClick={() => setShowCityModal(false)}
                className="text-slate-light hover:text-white p-1"
                aria-label="Tutup"
              >
                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 space-y-1 overflow-y-auto flex-1">
              {INDONESIAN_CITIES.map((city) => {
                const isSelected = city.id === currentCity.id
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelectCity(city.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                      isSelected
                        ? 'bg-navy text-white font-semibold'
                        : 'hover:bg-slate-100 text-navy'
                    }`}
                  >
                    <div>
                      <p className="text-body-sm leading-tight">{city.name}</p>
                      <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate'}`}>
                        {city.province} • {city.zone}
                      </span>
                    </div>
                    <span className="text-caption font-mono">
                      Subuh: {city.times.subuh}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
