import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '@/core/state/useStore'
import { BookmarkItem } from '@/core/state/store.types'
import {
  Bookmark,
  Trash2,
  ChevronLeft,
  Search,
  FileText,
  Edit3,
  Save,
  BookOpen,
  Zap,
  CheckSquare,
  Square,
  X,
  PlusCircle,
  SlidersHorizontal,
} from 'lucide-react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

type FilterType = 'all' | 'file' | 'quiz' | 'flashcard'
type SortMode = 'latest' | 'az' | 'type'

const TYPE_LABELS: Record<FilterType, string> = {
  all: 'ทั้งหมด',
  file: 'ไฟล์',
  quiz: 'ควิซ',
  flashcard: 'แฟลชการ์ด',
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  file: <FileText size={22} />,
  quiz: <BookOpen size={22} />,
  flashcard: <Zap size={22} />,
}

function getTitle(b: BookmarkItem): string {
  return typeof b.title === 'string' ? b.title : 'Untitled'
}

function getType(b: BookmarkItem): string {
  return typeof b.type === 'string' ? b.type : ''
}

function getContent(b: BookmarkItem): string {
  return typeof b.content === 'string' ? b.content : ''
}

function getCategory(b: BookmarkItem): string {
  return typeof b.category === 'string' ? b.category : 'ทั่วไป'
}

export const Bookmarks: React.FC = () => {
  const { bookmarks, removeBookmark, notes, saveNote, setPage } = useStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [sortMode, setSortMode] = useState<SortMode>('latest')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tempNote, setTempNote] = useState('')
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sortOpen, setSortOpen] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  // Auto-focus textarea when edit mode opens
  useEffect(() => {
    if (editingId && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [editingId])

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Reset select mode when bookmarks change
  useEffect(() => {
    setSelected(new Set())
    if (bookmarks.length === 0) setSelectMode(false)
  }, [bookmarks])

  // Count per type for badge
  const countFor = (type: FilterType) =>
    type === 'all'
      ? bookmarks.length
      : bookmarks.filter((b) => getType(b) === type).length

  // Filter
  const afterFilter = bookmarks.filter((b: BookmarkItem) => {
    const matchType = activeFilter === 'all' || getType(b) === activeFilter
    const q = searchTerm.toLowerCase()
    const matchSearch =
      !q ||
      getTitle(b).toLowerCase().includes(q) ||
      getContent(b).toLowerCase().includes(q)
    return matchType && matchSearch
  })

  // Sort
  const sorted = [...afterFilter].sort((a, b) => {
    if (sortMode === 'az') return getTitle(a).localeCompare(getTitle(b), 'th')
    if (sortMode === 'type') return getType(a).localeCompare(getType(b))
    // 'latest' — use index in original array (higher index = more recent)
    return bookmarks.indexOf(b) - bookmarks.indexOf(a)
  })

  const handleEditNote = (id: string, currentNote: string) => {
    setEditingId(id)
    setTempNote(currentNote || '')
  }

  const handleSaveNote = (id: string) => {
    saveNote(id, tempNote)
    setEditingId(null)
  }

  const handleCancelNote = () => {
    setEditingId(null)
    setTempNote('')
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSelectAll = () => {
    if (selected.size === sorted.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(sorted.map((b) => b.id)))
    }
  }

  const handleBulkDelete = () => {
    selected.forEach((id) => removeBookmark(id))
    setSelected(new Set())
    setSelectMode(false)
  }

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelected(new Set())
  }

  const SORT_LABELS: Record<SortMode, string> = {
    latest: 'ล่าสุด',
    az: 'A-Z',
    type: 'ประเภท',
  }

  const isFiltered = activeFilter !== 'all' || searchTerm.length > 0

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Bookmark className="text-red-800 dark:text-red-500" fill="currentColor" />
            คลังความรู้ส่วนตัว
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            เนื้อหาที่คุณบันทึกไว้และโน้ตย่อส่วนตัว
          </p>
        </div>

        {/* Search + Sort + Select */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={16}
            />
            <input
              type="text"
              placeholder="ค้นหาบุ๊กมาร์ก..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 md:w-56 pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-sm"
            />
          </div>

          {/* Sort dropdown */}
          <div ref={sortRef} className="relative">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-red-400 dark:hover:border-red-500 transition-all cursor-pointer min-h-[44px]"
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">{SORT_LABELS[sortMode]}</span>
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-1 w-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg z-20 overflow-hidden"
                >
                  {(Object.entries(SORT_LABELS) as [SortMode, string][]).map(
                    ([key, label]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSortMode(key)
                          setSortOpen(false)
                        }}
                        className={clsx(
                          'w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer',
                          sortMode === key
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        )}
                      >
                        {label}
                      </button>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Select mode toggle */}
          {bookmarks.length > 0 && (
            <button
              onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
              className={clsx(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer min-h-[44px]',
                selectMode
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-red-400 dark:hover:border-red-500'
              )}
            >
              {selectMode ? <X size={15} /> : <CheckSquare size={15} />}
              <span className="hidden sm:inline">{selectMode ? 'ยกเลิก' : 'เลือก'}</span>
            </button>
          )}
        </div>
      </section>

      {/* Filter tabs */}
      {bookmarks.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(TYPE_LABELS) as FilterType[]).map((tab) => {
            const cnt = countFor(tab)
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={clsx(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer min-h-[40px]',
                  activeFilter === tab
                    ? 'bg-red-800 dark:bg-red-500 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-red-400 dark:hover:border-red-500'
                )}
              >
                {TYPE_LABELS[tab]}
                <span
                  className={clsx(
                    'inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black',
                    activeFilter === tab
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  )}
                >
                  {cnt}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Select-mode toolbar */}
      <AnimatePresence>
        {selectMode && sorted.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
          >
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {selected.size === sorted.length ? (
                <CheckSquare size={16} className="text-red-700 dark:text-red-400" />
              ) : (
                <Square size={16} />
              )}
              เลือกทั้งหมด ({sorted.length})
            </button>

            {selected.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                ลบที่เลือก ({selected.size})
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {sorted.length === 0 ? (
        bookmarks.length === 0 ? (
          // No bookmarks at all
          <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="mx-auto w-16 h-16 mb-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-300 dark:text-slate-600">
              <Bookmark size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">
              ยังไม่มีบุ๊กมาร์ก
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              คุณสามารถบันทึกเนื้อหาที่น่าสนใจได้ขณะเรียน
            </p>
          </div>
        ) : (
          // Bookmarks exist but filter yields nothing
          <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="mx-auto w-14 h-14 mb-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-300 dark:text-slate-600">
              <Search size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-500 dark:text-slate-400">
              ไม่มีบุ๊กมาร์กในหมวดนี้
            </h3>
            <p className="text-sm text-slate-400 mt-1">ลองเปลี่ยนตัวกรองหรือล้างการค้นหา</p>
            <button
              onClick={() => {
                setActiveFilter('all')
                setSearchTerm('')
              }}
              className="mt-4 px-5 py-2 rounded-full bg-red-800 dark:bg-red-500 text-white text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              ล้างตัวกรอง
            </button>
          </div>
        )
      ) : (
        /* Bookmark list */
        <motion.div layout className="grid grid-cols-1 gap-5">
          <AnimatePresence mode="popLayout">
            {sorted.map((b: BookmarkItem) => {
              const title = getTitle(b)
              const type = getType(b)
              const content = getContent(b)
              const category = getCategory(b)
              const note = notes[b.id] || ''
              const isEditing = editingId === b.id
              const isSelected = selected.has(b.id)

              return (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
                  transition={{ duration: 0.22 }}
                  onClick={selectMode ? () => toggleSelect(b.id) : undefined}
                  className={clsx(
                    'bg-white dark:bg-slate-800/50 rounded-2xl border p-6 shadow-sm transition-all',
                    selectMode && 'cursor-pointer',
                    isSelected
                      ? 'border-red-500 dark:border-red-400 ring-2 ring-red-500/20'
                      : 'border-slate-100 dark:border-slate-800 hover:shadow-md'
                  )}
                >
                  {/* Card header */}
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex gap-4 min-w-0">
                      {/* Select checkbox (select mode) */}
                      {selectMode && (
                        <div className="shrink-0 flex items-center">
                          {isSelected ? (
                            <CheckSquare
                              size={20}
                              className="text-red-700 dark:text-red-400"
                            />
                          ) : (
                            <Square size={20} className="text-slate-400" />
                          )}
                        </div>
                      )}

                      <div
                        className={clsx(
                          'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                          'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-500'
                        )}
                      >
                        {TYPE_ICON[type] ?? <Bookmark size={22} />}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug truncate">
                          {title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {category}
                          </span>
                          {type && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                              {TYPE_LABELS[type as FilterType] ?? type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete button (hidden in select mode) */}
                    {!selectMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeBookmark(b.id)
                        }}
                        className="shrink-0 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all cursor-pointer"
                        aria-label="ลบบุ๊กมาร์ก"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  {/* Content preview */}
                  {content && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed line-clamp-3">
                      {content}
                    </p>
                  )}

                  {/* Note section */}
                  {!selectMode && (
                    <div
                      className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Edit3 size={11} /> My Notes
                        </span>

                        {isEditing ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleCancelNote}
                              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            >
                              ยกเลิก
                            </button>
                            <button
                              onClick={() => handleSaveNote(b.id)}
                              className="text-[11px] font-bold text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Save size={11} /> บันทึก
                            </button>
                          </div>
                        ) : note ? (
                          <button
                            onClick={() => handleEditNote(b.id, note)}
                            className="text-[11px] font-bold text-red-800 dark:text-red-500 hover:underline cursor-pointer"
                          >
                            แก้ไข
                          </button>
                        ) : null}
                      </div>

                      <AnimatePresence mode="wait">
                        {isEditing ? (
                          <motion.div
                            key="editing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                          >
                            <textarea
                              ref={textareaRef}
                              value={tempNote}
                              onChange={(e) => setTempNote(e.target.value)}
                              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500/20 outline-none min-h-[80px] resize-none transition-all"
                              placeholder="พิมพ์โน้ตของคุณที่นี่..."
                            />
                          </motion.div>
                        ) : note ? (
                          <motion.p
                            key="note"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap"
                          >
                            {note}
                          </motion.p>
                        ) : (
                          <motion.button
                            key="add"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            onClick={() => handleEditNote(b.id, '')}
                            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-700 dark:hover:text-red-400 transition-colors cursor-pointer py-1"
                          >
                            <PlusCircle size={13} />
                            เพิ่มโน้ต
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Bulk delete sticky footer */}
      <AnimatePresence>
        {selectMode && selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="sticky bottom-4 flex justify-center pointer-events-none"
          >
            <button
              onClick={handleBulkDelete}
              className="pointer-events-auto flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 text-white text-sm font-bold shadow-xl transition-colors cursor-pointer min-h-[44px]"
            >
              <Trash2 size={16} />
              ลบที่เลือก ({selected.size})
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button */}
      <div className="flex justify-center">
        <button
          onClick={() => setPage('home')}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer min-h-[44px]"
        >
          <ChevronLeft size={18} /> กลับสู่หน้าหลัก
        </button>
      </div>
    </div>
  )
}
