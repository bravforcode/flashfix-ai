import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '@/core/state/useStore'
import { Page } from '@/core/state/store.types'
import { useI18n } from '@/shared/hooks/useI18n'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  Bookmark,
  FileUp,
  History,
  Home,
  Languages,
  LayoutDashboard,
  LucideIcon,
  Menu,
  Moon,
  RotateCcw,
  Settings,
  Sun,
  TrendingUp,
  X,
  Clock,
} from 'lucide-react'
import { clsx } from 'clsx'

/* ─── History mini-panel ──────────────────────────────────────────── */
const HistoryBadge: React.FC<{ count: number }> = ({ count }) =>
  count === 0 ? null : (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-red-700 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none"
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  )

/* ─── Recent-history dropdown ─────────────────────────────────────── */
const getTypeLabel = (type: string) => {
  switch (type) {
    case 'file':      return { text: 'FILE',  bg: 'bg-blue-600' }
    case 'quiz':      return { text: 'QUIZ',  bg: 'bg-purple-600' }
    case 'exam':      return { text: 'EXAM',  bg: 'bg-amber-600' }
    case 'flashcard': return { text: 'FC',    bg: 'bg-red-700' }
    case 'teachback': return { text: 'TB',    bg: 'bg-green-700' }
    default:          return { text: 'LOG',   bg: 'bg-slate-500' }
  }
}

/* ─── Main Navbar ─────────────────────────────────────────────────── */
export const Navbar: React.FC = () => {
  const { t, lang, setLang } = useI18n()
  const {
    page,
    setPage,
    theme,
    toggleTheme,
    mastery,
    history,
    openApiSettings,
    openHistory,
  } = useStore()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSettingsOpen,   setIsSettingsOpen]   = useState(false)
  const [isHistoryOpen,    setIsHistoryOpen]     = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const historyRef  = useRef<HTMLDivElement>(null)

  /* click-outside for settings + history dropdowns */
  useEffect(() => {
    if (!isSettingsOpen && !isHistoryOpen) return
    const handler = (e: MouseEvent) => {
      if (!settingsRef.current?.contains(e.target as Node)) setIsSettingsOpen(false)
      if (!historyRef.current?.contains(e.target as Node))  setIsHistoryOpen(false)
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [isSettingsOpen, isHistoryOpen])

  /* escape key */
  useEffect(() => {
    if (!isSettingsOpen && !isMobileMenuOpen && !isHistoryOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setIsSettingsOpen(false)
      setIsMobileMenuOpen(false)
      setIsHistoryOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isMobileMenuOpen, isSettingsOpen, isHistoryOpen])

  const menuItems: Array<{ id: Page; label: string; icon: LucideIcon; shortcut?: string }> = [
    { id: 'home',         label: t('home'),       icon: Home,          shortcut: 'Alt+H' },
    { id: 'file_upload',  label: t('file_upload'), icon: FileUp,        shortcut: 'Alt+U' },
    { id: 'topic_select', label: t('quiz'),        icon: BookOpen,      shortcut: 'Alt+Q' },
    { id: 'mastery',      label: t('mastery'),     icon: LayoutDashboard, shortcut: 'Alt+M' },
    { id: 'bookmarks',    label: t('bookmarks'),   icon: Bookmark,      shortcut: 'Alt+B' },
  ]

  const overallMastery = Math.round(
    Object.values(mastery).reduce((total, score) => total + score, 0) / (Object.keys(mastery).length || 1)
  )

  const recentHistory = history.slice(0, 5)

  const handleNavigation = (newPage: Page) => {
    setPage(newPage)
    setIsMobileMenuOpen(false)
  }

  const handleOpenApiSettings = () => {
    openApiSettings()
    setIsMobileMenuOpen(false)
    setIsSettingsOpen(false)
  }

  const handleOpenHistory = () => {
    openHistory()
    setIsMobileMenuOpen(false)
    setIsSettingsOpen(false)
    setIsHistoryOpen(false)
  }

  const handleReset = () => {
    localStorage.removeItem('flashfix-storage')
    window.location.reload()
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/60 dark:bg-slate-950/70 border-b border-white/20 dark:border-slate-800/60 shadow-sm shadow-black/5">
        <div className="max-w-full px-4 md:px-8 xl:px-12 py-3 md:py-3.5">
          <div className="flex items-center justify-between gap-4">

            {/* ── Brand ── */}
            <motion.button
              onClick={() => handleNavigation('home')}
              className="flex items-center gap-2 md:gap-3 flex-shrink-0 focus:outline-none"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.div
                className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-red-800 to-red-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-red-700/30"
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <span className="serif text-sm md:text-base tracking-wide">FF</span>
              </motion.div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="serif text-base md:text-lg font-extrabold tracking-wider text-slate-900 dark:text-slate-100">
                  FlashFix
                </span>
                <span className="text-[10px] font-bold text-red-700 dark:text-red-500 tracking-widest uppercase">AI</span>
              </div>
            </motion.button>

            {/* ── Desktop nav links ── */}
            <div className="hidden lg:flex items-center gap-0.5">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = page === item.id
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={clsx(
                      'relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                      active
                        ? 'bg-red-800/10 dark:bg-red-700/20 text-red-800 dark:text-red-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                    )}
                    title={item.shortcut}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                    {active && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-xl bg-red-800/10 dark:bg-red-700/20 -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {active && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute bottom-0.5 left-2 right-2 h-0.5 bg-red-700 rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* ── Right actions ── */}
            <div className="hidden md:flex items-center gap-1.5">
              {/* Mastery chip */}
              {Object.keys(mastery).length > 0 && (
                <motion.div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-900/20 border border-emerald-400/20 dark:border-emerald-700/30"
                  whileHover={{ scale: 1.04 }}
                >
                  <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {overallMastery}%
                  </span>
                </motion.div>
              )}

              {/* History button with badge + dropdown */}
              <div ref={historyRef} className="relative">
                <motion.button
                  onClick={() => setIsHistoryOpen(v => !v)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all"
                  aria-label="Recent activity"
                  title="Recent activity"
                >
                  <History size={19} />
                  <HistoryBadge count={history.length} />
                </motion.button>

                <AnimatePresence>
                  {isHistoryOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.94, y: -8 }}
                      animate={{ opacity: 1, scale: 1,    y: 0  }}
                      exit={{   opacity: 0, scale: 0.94, y: -8  }}
                      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                      className="absolute right-0 mt-2 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/10 border border-slate-200/60 dark:border-slate-700/40 overflow-hidden z-50"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          กิจกรรมล่าสุด
                        </span>
                        <button
                          onClick={handleOpenHistory}
                          className="text-[10px] font-bold text-red-700 dark:text-red-500 hover:underline"
                        >
                          ดูทั้งหมด →
                        </button>
                      </div>
                      <div className="divide-y divide-slate-50 dark:divide-slate-800/50 max-h-72 overflow-y-auto">
                        {recentHistory.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-slate-400">
                            ยังไม่มีกิจกรรม
                          </div>
                        ) : (
                          recentHistory.map((entry, i) => {
                            const tag = getTypeLabel(entry.type)
                            const title = entry.data.topic || entry.data.title || 'กิจกรรม'
                            const dateStr = new Date(entry.ts).toLocaleDateString(
                              lang === 'th' ? 'th-TH' : 'en-US',
                              { day: 'numeric', month: 'short' }
                            )
                            return (
                              <motion.div
                                key={`${entry.ts}-${i}`}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                              >
                                <span className={`text-[9px] font-black text-white px-1.5 py-0.5 rounded ${tag.bg} flex-shrink-0`}>
                                  {tag.text}
                                </span>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate flex-1">
                                  {title}
                                </span>
                                <span className="text-[10px] text-slate-400 flex-shrink-0 flex items-center gap-0.5">
                                  <Clock size={9} /> {dateStr}
                                </span>
                              </motion.div>
                            )
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.08, rotate: 20 }}
                whileTap={{ scale: 0.92 }}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all"
                aria-label="Toggle dark mode"
              >
                {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
              </motion.button>

              {/* Language */}
              <motion.button
                onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all"
                aria-label={`Switch to ${lang === 'th' ? 'English' : 'Thai'}`}
              >
                <Languages size={19} />
              </motion.button>

              {/* Settings dropdown */}
              <div ref={settingsRef} className="relative">
                <motion.button
                  onClick={() => setIsSettingsOpen(v => !v)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all"
                  aria-label="Settings"
                  aria-expanded={isSettingsOpen}
                  aria-haspopup="menu"
                >
                  <Settings size={19} />
                </motion.button>

                <AnimatePresence>
                  {isSettingsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.94, y: -8 }}
                      animate={{ opacity: 1, scale: 1,    y: 0  }}
                      exit={{   opacity: 0, scale: 0.94, y: -8  }}
                      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                      className="absolute right-0 mt-2 w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/10 border border-slate-200/60 dark:border-slate-700/40 overflow-hidden z-50"
                      role="menu"
                    >
                      <button
                        type="button"
                        onClick={handleOpenApiSettings}
                        className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-slate-200 transition-colors"
                        role="menuitem"
                      >
                        API Settings
                      </button>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 text-red-700 dark:text-red-400 transition-colors border-t border-slate-100 dark:border-slate-800"
                        role="menuitem"
                      >
                        Reset App Data
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Mobile menu toggle ── */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(v => !v)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </motion.button>
          </div>

          {/* ── Mobile menu ── */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                className="lg:hidden mt-3 pt-3 border-t border-white/20 dark:border-slate-800/50 overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => handleNavigation(item.id)}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.96 }}
                        className={clsx(
                          'flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-semibold transition-all',
                          page === item.id
                            ? 'bg-red-800/10 dark:bg-red-700/20 text-red-800 dark:text-red-400'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                        )}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </motion.button>
                    )
                  })}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/20 dark:border-slate-800/50">
                  <motion.button
                    onClick={toggleTheme}
                    whileTap={{ scale: 0.97 }}
                    className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all"
                  >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
                  </motion.button>

                  <motion.button
                    onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
                    whileTap={{ scale: 0.97 }}
                    className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all"
                  >
                    <Languages size={18} />
                    <span>{lang === 'th' ? 'EN' : 'TH'}</span>
                  </motion.button>

                  <motion.button
                    onClick={handleOpenApiSettings}
                    whileTap={{ scale: 0.97 }}
                    className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all"
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </motion.button>

                  <motion.button
                    onClick={handleOpenHistory}
                    whileTap={{ scale: 0.97 }}
                    className="relative flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all"
                  >
                    <span className="relative">
                      <History size={18} />
                      <HistoryBadge count={history.length} />
                    </span>
                    <span>History</span>
                  </motion.button>

                  <motion.button
                    onClick={handleReset}
                    whileTap={{ scale: 0.97 }}
                    className="col-span-2 flex items-center justify-center gap-1.5 px-2 py-3 rounded-xl text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <RotateCcw size={16} />
                    <span>Reset App Data</span>
                  </motion.button>
                </div>

                {Object.keys(mastery).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 pt-3 border-t border-white/20 dark:border-slate-800/50"
                  >
                    <div className="flex items-center justify-between px-3 py-2 bg-emerald-500/10 dark:bg-emerald-900/20 rounded-xl border border-emerald-400/20">
                      <span className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        <TrendingUp size={14} /> Overall Mastery
                      </span>
                      <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                        {overallMastery}%
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Spacer matching navbar height */}
      <div className="h-16 md:h-[66px]" aria-hidden="true" />
    </>
  )
}
