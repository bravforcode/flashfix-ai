import React, { useState } from 'react'
import { useStore } from '@/core/state/useStore'
import { LearningHistoryEntry, Page } from '@/core/state/store.types'
import { useI18n } from '@/shared/hooks/useI18n'
import { 
  Home, 
  FileUp, 
  BookOpen, 
  LayoutDashboard, 
  History, 
  Settings, 
  Moon, 
  Sun, 
  ChevronLeft,
  ChevronRight,
  Trash2,
  X,
  Bookmark,
  Languages,
  Calculator,
  FileText,
  GraduationCap,
  Layers3,
  Pin
} from 'lucide-react'
import { clsx } from 'clsx'

export const Sidebar: React.FC = () => {
  const { t, lang, setLang } = useI18n()
  const { 
    page, 
    setPage, 
    theme, 
    toggleTheme, 
    history, 
    clearHistory,
    mastery,
    openApiSettings,
  } = useStore()
  
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const menuItems = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'file_upload', label: t('file_upload'), icon: FileUp },
    { id: 'topic_select', label: t('quiz'), icon: BookOpen },
    { id: 'bookmarks', label: t('bookmarks'), icon: Bookmark },
    { id: 'mastery', label: t('mastery'), icon: LayoutDashboard },
  ]

  const overallMastery = Math.round(
    Object.values(mastery).reduce((a, b) => a + b, 0) / (Object.keys(mastery).length || 1)
  )

  const fmtDate = (ts: number) => {
    const d = new Date(ts)
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`
  }

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'file': return FileText
      case 'quiz': return Calculator
      case 'exam': return FileText
      case 'flashcard': return Layers3
      case 'teachback': return GraduationCap
      default: return Pin
    }
  }

  return (
    <>
      {/* Main Sidebar */}
      <aside 
        className={clsx(
          "fixed left-0 top-0 bottom-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col shadow-xl md:shadow-none",
          isCollapsed ? "w-20" : "w-64",
          "hidden md:flex"
        )}
      >
        {/* Logo Section */}
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-8 h-8 bg-red-800 rounded-lg flex items-center justify-center text-white font-black italic">FF</div>
              <span className="serif text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                FlashFix <span className="text-red-800 dark:text-red-500">AI</span>
              </span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-red-800 rounded-lg flex items-center justify-center text-white font-black italic mx-auto">FF</div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 space-y-1 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id as Page)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                page === item.id 
                  ? "bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-500 font-bold" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <item.icon size={20} className={clsx(
                "flex-shrink-0 transition-transform group-hover:scale-110",
                page === item.id && "text-red-800 dark:text-red-500"
              )} />
              {!isCollapsed && <span className="text-sm truncate animate-fade-in">{item.label}</span>}
              {isCollapsed && (
                <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          ))}
          
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-4 mx-2" />
          
          <button
            onClick={() => setShowHistory(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group relative"
          >
            <History size={20} className="flex-shrink-0 group-hover:rotate-12 transition-transform" />
            {!isCollapsed && <span className="text-sm truncate animate-fade-in">ประวัติการเรียน</span>}
            {isCollapsed && (
              <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                ประวัติการเรียน
              </div>
            )}
          </button>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 space-y-3">
          {!isCollapsed && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 animate-fade-in border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Mastery</span>
                <span className="text-xs font-black text-red-800 dark:text-red-500">{overallMastery}%</span>
              </div>
              <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-800 dark:bg-red-600 transition-all duration-1000"
                  style={{ width: `${overallMastery}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <button
              onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group relative"
            >
              <Languages size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="text-sm truncate animate-fade-in">{lang === 'th' ? 'English' : 'ภาษาไทย'}</span>}
            </button>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group relative"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              {!isCollapsed && <span className="text-sm truncate animate-fade-in">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
            </button>
            <button
              onClick={openApiSettings}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group relative"
            >
              <Settings size={20} />
              {!isCollapsed && <span className="text-sm truncate animate-fade-in">ตั้งค่า API</span>}
            </button>
          </div>

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>

      {/* History Slide-over */}
      <div 
        className={clsx(
          "fixed inset-0 z-50 transition-opacity duration-300",
          showHistory ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
        <div 
          className={clsx(
            "absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 transform",
            showHistory ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                  <History size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">ประวัติการเรียน</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{history.length} รายการ</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={clearHistory}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
                  title="ล้างประวัติ"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
                    <History size={28} />
                  </div>
                  <div className="text-sm font-bold text-slate-400">ยังไม่มีประวัติการเรียน</div>
                  <div className="text-xs text-slate-400 mt-1">เริ่มเรียนรู้เพื่อบันทึกก้าวแรกของคุณ</div>
                </div>
              ) : (
                history.map((h: LearningHistoryEntry, i) => {
                  const HistoryIcon = getHistoryIcon(h.type)
                  let title = '', sub = '', score = ''
                  if (h.type === 'file') {
                    title = h.data.title || 'ไฟล์'
                    sub = h.data.fileName || ''
                  } else if (h.type === 'quiz') {
                    title = h.data.topic || 'แบบฝึกหัด'
                    sub = `${h.data.question?.substring(0, 40) || ''}...`
                  } else if (h.type === 'exam') {
                    title = `ข้อสอบ ${h.data.title || ''}`.trim()
                    sub = `${h.data.score || 0}/${h.data.total || 0} ข้อ`
                    score = h.data.total ? `${Math.round(((h.data.score || 0) / h.data.total) * 100)}%` : ''
                  } else if (h.type === 'flashcard') {
                    title = 'Flashcard'
                    sub = h.data.topic || h.data.title || ''
                  } else if (h.type === 'teachback') {
                    title = `Teach-Back ${h.data.topic || ''}`.trim()
                    sub = `คะแนน ${h.data.score || 0}/10`
                  }

                  return (
                    <div 
                      key={h.ts + i}
                      className="group p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/30 hover:shadow-md transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-800/30"
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-red-800 dark:text-red-500 flex-shrink-0">
                          <HistoryIcon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-red-800 dark:group-hover:text-red-500 transition-colors">{title}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">{sub}</div>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="text-[10px] text-slate-400 font-medium">{fmtDate(h.ts)}</div>
                            {score && (
                              <div className={clsx(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                parseInt(score) >= 60 ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-500" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-500"
                              )}>
                                Score: {score}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-3 z-40 flex justify-between items-center">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id as Page)}
            className={clsx(
              "flex flex-col items-center gap-1",
              page === item.id ? "text-red-800 dark:text-red-500" : "text-slate-400"
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => setShowHistory(true)}
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <History size={20} />
          <span className="text-[10px] font-bold">ประวัติ</span>
        </button>
      </nav>
    </>
  )
}
