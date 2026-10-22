'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faNoteSticky,
  faThumbtack,
  faTrashCan,
  faMagnifyingGlass,
  faPlus,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { Card, Badge, Button } from '@/components/ui'
import type { NotionNote } from '@/types'

interface NotionNotesProps {
  notes: NotionNote[]
  onAddNote: (note: Omit<NotionNote, 'id' | 'updatedAt'>) => void
  onDeleteNote: (id: string) => void
}

const TAG_COLORS: Record<NotionNote['tag'], { bg: string; text: string }> = {
  Ide: { bg: 'bg-amber-100', text: 'text-amber-800' },
  Kerja: { bg: 'bg-blue-100', text: 'text-blue-800' },
  Gym: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  Pribadi: { bg: 'bg-purple-100', text: 'text-purple-800' },
  Rencana: { bg: 'bg-rose-100', text: 'text-rose-800' },
}

export default function NotionNotes({ notes, onAddNote, onDeleteNote }: NotionNotesProps) {
  const [selectedTag, setSelectedTag] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  // Form state
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newTag, setNewTag] = useState<NotionNote['tag']>('Ide')
  const [isPinned, setIsPinned] = useState(false)

  const tags = ['All', 'Ide', 'Kerja', 'Gym', 'Pribadi', 'Rencana']

  const filteredNotes = notes.filter((n) => {
    const matchesTag = selectedTag === 'All' || n.tag === selectedTag
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTag && matchesSearch
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    onAddNote({
      title: newTitle.trim(),
      content: newContent.trim(),
      tag: newTag,
      pinned: isPinned,
    })

    setNewTitle('')
    setNewContent('')
    setIsPinned(false)
    setShowAddModal(false)
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/5 text-navy">
            <FontAwesomeIcon icon={faNoteSticky} className="h-5 w-5 text-navy" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-h4 font-heading font-bold text-navy">
                Catatan & Repositori Gagasan
              </h3>
              <Badge variant="navy" className="text-[10px] py-0.5 px-2">
                Simpel Notion
              </Badge>
            </div>
            <p className="text-caption text-slate mt-0.5">
              Ruang bebas tanpa filter untuk menampung ide, unek-unek & rencana
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="gap-1.5 self-start sm:self-auto"
        >
          <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
          <span>Tambah</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-5">
        {/* Tag Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-caption font-medium transition-all ${
                selectedTag === tag
                  ? 'bg-navy text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-50">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="h-3 w-3 text-slate absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            type="text"
            placeholder="Cari catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-caption rounded-lg border border-border bg-surface text-navy focus:outline-none focus:border-navy"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredNotes.map((note) => {
          const tagColor = TAG_COLORS[note.tag] || { bg: 'bg-slate-100', text: 'text-slate-800' }
          return (
            <div
              key={note.id}
              className="group relative p-4 rounded-xl border border-border bg-surface hover:shadow-md hover:border-slate/30 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${tagColor.bg} ${tagColor.text}`}
                  >
                    #{note.tag}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {note.pinned && (
                      <FontAwesomeIcon
                        icon={faThumbtack}
                        className="h-3 w-3 text-navy"
                        title="Dipin"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteNote(note.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate hover:text-red-600 transition-opacity p-1"
                      title="Hapus catatan"
                      aria-label="Hapus catatan"
                    >
                      <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <h4 className="text-body-sm font-heading font-bold text-navy mb-2 line-clamp-1">
                  {note.title}
                </h4>

                <p className="text-caption text-slate whitespace-pre-line line-clamp-5 leading-relaxed font-body">
                  {note.content}
                </p>
              </div>

              <span className="text-[10px] text-slate-light block mt-3 pt-2 border-t border-border/50 font-mono">
                Diperbarui {new Date(note.updatedAt).toLocaleDateString('id-ID')}
              </span>
            </div>
          )
        })}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-8 border border-dashed border-border rounded-xl">
          <p className="text-body-sm text-slate">Belum ada catatan untuk filter ini.</p>
        </div>
      )}

      {/* Quick Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border shadow-2xl p-6 z-10 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faNoteSticky} className="h-4 w-4 text-navy" />
                <h3 className="text-h4 font-heading font-bold text-navy">
                  Buat Catatan Baru
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Judul Catatan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Arsitektur micro-SaaS fitness dan nutrisi"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-body-sm font-medium text-navy mb-1.5">
                    Kategori / Tag
                  </label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value as NotionNote['tag'])}
                    className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                  >
                    <option value="Ide">Ide</option>
                    <option value="Kerja">Kerja</option>
                    <option value="Gym">Gym</option>
                    <option value="Pribadi">Pribadi</option>
                    <option value="Rencana">Rencana</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="rounded text-navy focus:ring-0"
                    />
                    <span className="text-body-sm font-medium text-navy">Pin catatan di atas</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Isi Catatan (Gunakan tanda - untuk bullet list)
                </label>
                <textarea
                  rows={6}
                  placeholder="- Poin pertama&#10;- Poin kedua&#10;- Catatan pertimbangan..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy resize-none font-body leading-relaxed"
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
                  Simpan Catatan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  )
}
