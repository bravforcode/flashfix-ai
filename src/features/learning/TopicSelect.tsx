import React, { useState, useMemo } from 'react'
import { useStore } from '@/core/state/useStore'
import { Topic } from '@/core/state/store.types'
import { ChevronLeft, Loader2, Search, X, Star, TrendingUp, BookOpen, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { AIService } from '@/core/api/ai'
import { getReadableAIError } from '@/core/api/ai-errors'
import { TOPICS, TOPIC_CATEGORIES, CATEGORY_DISPLAY, TopicCategory, TopicWithCategory } from './topics'

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard'

const DIFFICULTY_LABELS: Record<DifficultyFilter, string> = {
  all:    'ทั้งหมด',
  easy:   'พื้นฐาน',
  medium: 'กลาง',
  hard:   'ยาก',
}

const ICON_COLOR_MAP: Record<string, string> = {
  accent: 'text-red-800 dark:text-red-500',
  blue:   'text-blue-700 dark:text-blue-400',
  purple: 'text-purple-700 dark:text-purple-400',
  teal:   'text-teal-700 dark:text-teal-400',
  gold:   'text-amber-600 dark:text-amber-400',
}

const DIFF_BADGE: Record<string, string> = {
  easy:   'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  hard:   'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-500',
}

const DIFF_LABEL: Record<string, string> = {
  easy:   'ง่าย',
  medium: 'กลาง',
  hard:   'ยาก',
}

export const TopicSelect: React.FC = () => {
  const { setPage, mastery, setTopic, setQuiz, loading } = useStore()

  const [activeCategory, setActiveCategory] = useState<TopicCategory | 'all'>('all')
  const [search, setSearch]                 = useState('')
  const [diffFilter, setDiffFilter]         = useState<DifficultyFilter>('all')

  const filtered = useMemo<TopicWithCategory[]>(() => {
    return TOPICS.filter(t => {
      if (activeCategory !== 'all' && t.category !== activeCategory) return false
      if (diffFilter !== 'all' && t.lv !== diffFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        if (!t.th.toLowerCase().includes(q) && !t.descTh.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [activeCategory, search, diffFilter])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: TOPICS.length }
    TOPIC_CATEGORIES.forEach(cat => {
      counts[cat] = TOPICS.filter(t => t.category === cat).length
    })
    return counts
  }, [])

  const handleSelect = async (topic: Topic) => {
    setTopic(topic)
    try {
      const quiz = await AIService.generateQuiz(topic)
      setQuiz(quiz)
      setPage('quiz')
    } catch (e) {
      console.error(e)
      setPage('topic_select')
      alert(getReadableAIError(e, 'เกิดข้อผิดพลาดในการสร้างโจทย์'))
    }
  }

  const masteredCount = TOPICS.filter(t => (mastery[t.id] || 0) >= 70).length
  const totalCount    = TOPICS.length

  return (
    <div className="animate-fade-in">
      {/* ── Header ── */}
      <div className="mb-8">
        <div className="serif text-[10px] tracking-[4px] text-slate-400 mb-2 uppercase">
          TOPIC SELECT · 数学トピック
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="serif text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
              เลือกหัวข้อคณิตศาสตร์
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {totalCount} หัวข้อ · เชี่ยวชาญแล้ว {masteredCount}/{totalCount}
            </p>
          </div>
          {/* Mastery progress */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
            <div className="text-xs text-slate-500 dark:text-slate-400">ความเชี่ยวชาญรวม</div>
            <div className="text-sm font-black text-slate-900 dark:text-slate-100">
              {Math.round((masteredCount / totalCount) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* ── Search + Difficulty ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          <input
            type="text"
            placeholder="ค้นหาหัวข้อ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-400 dark:focus:border-red-600 outline-none transition-all text-slate-900 dark:text-slate-100"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          {(['all', 'easy', 'medium', 'hard'] as DifficultyFilter[]).map(d => (
            <button
              key={d}
              onClick={() => setDiffFilter(d)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                diffFilter === d
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              )}
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Category tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <button
          onClick={() => setActiveCategory('all')}
          className={clsx(
            'flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer',
            activeCategory === 'all'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
          )}
        >
          <BookOpen size={13} />
          ทั้งหมด
          <span className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black">
            {categoryCounts.all}
          </span>
        </button>

        {TOPIC_CATEGORIES.map(cat => {
          const meta    = CATEGORY_DISPLAY[cat]
          const isActive = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                'flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer',
                isActive
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm'
                  : `bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400 ${meta.color}`
              )}
            >
              {meta.label}
              <span className={clsx(
                'px-1.5 py-0.5 rounded-full text-[10px] font-black',
                isActive
                  ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              )}>
                {categoryCounts[cat]}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Topic grid ── */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800"
          >
            <Search size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-sm font-semibold text-slate-400">ไม่พบหัวข้อที่ค้นหา</p>
            <button
              onClick={() => { setSearch(''); setDiffFilter('all'); setActiveCategory('all') }}
              className="mt-3 text-xs font-bold text-red-700 dark:text-red-500 hover:underline cursor-pointer"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={`${activeCategory}-${diffFilter}-${search}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
          >
            {filtered.map((t, i) => {
              const score   = mastery[t.id] || 0
              const mastered = score >= 70
              const iconColor = ICON_COLOR_MAP[t.color || 'accent'] ?? ICON_COLOR_MAP.accent
              return (
                <motion.button
                  key={t.id}
                  onClick={() => handleSelect(t)}
                  disabled={loading}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  whileHover={{ y: -2, boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)' }}
                  whileTap={{ scale: 0.97 }}
                  className={clsx(
                    'group relative text-left rounded-2xl p-4 border transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-red-500',
                    mastered
                      ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/40'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800/50',
                    loading && 'opacity-50 pointer-events-none'
                  )}
                >
                  {/* Mastered star */}
                  {mastered && (
                    <Star
                      size={12}
                      className="absolute top-2.5 right-2.5 text-emerald-500 fill-emerald-500"
                      aria-label="เชี่ยวชาญแล้ว"
                    />
                  )}

                  {/* Icon */}
                  <div className={clsx('serif text-2xl font-black mb-3 leading-none', iconColor)}>
                    {t.icon}
                  </div>

                  {/* Name */}
                  <div className="text-[13px] font-bold text-slate-900 dark:text-slate-100 leading-tight mb-0.5">
                    {t.th}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    {t.jp}
                  </div>

                  {/* Desc */}
                  <div className="text-[10px] text-slate-500 dark:text-slate-500 leading-snug mb-3 line-clamp-2">
                    {t.descTh}
                  </div>

                  {/* Bottom row: diff badge + progress */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={clsx('px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider', DIFF_BADGE[t.lv])}>
                      {DIFF_LABEL[t.lv]}
                    </span>
                    {score > 0 && (
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">{score}%</span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className={clsx(
                        'h-full rounded-full',
                        mastered ? 'bg-emerald-500' : 'bg-red-700 dark:bg-red-600'
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.02 }}
                    />
                  </div>

                  {/* Play hint on hover */}
                  <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-red-800/0 group-hover:bg-red-800/[0.03] dark:group-hover:bg-red-500/[0.04] transition-colors pointer-events-none">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black text-red-700 dark:text-red-500 tracking-widest uppercase flex items-center gap-1">
                      เริ่มเลย <ChevronRight size={10} />
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading indicator ── */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 mt-6"
        >
          <Loader2 size={18} className="animate-spin text-red-700 dark:text-red-500" />
          AI กำลังสร้างโจทย์วัดระดับ...
        </motion.div>
      )}

      {/* ── Back button ── */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => setPage('home')}
          className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
        >
          <ChevronLeft size={18} /> กลับหน้าแรก
        </button>
      </div>
    </div>
  )
}
